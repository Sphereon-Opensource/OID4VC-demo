import React, {Component} from "react"
import axios from "axios"
import {BallTriangle} from "react-loader-spinner"
import {
    AuthorizationRequestStateStatus,
    AuthorizationResponseStateStatus,
    AuthResponse,
    AuthStatusResponse,
    GenerateAuthRequestURIResponse
} from "@sphereon/did-auth-siop-web-demo-shared"
import {CreateElementArgs, QRType, URIData, ValueResult} from "@sphereon/ssi-sdk-qr-react";
import agent from '../agent';

export type AuthenticationQRProps = {
    onAuthRequestRetrieved: () => void
    onSignInComplete: (AuthResponse: AuthResponse) => void
}

export interface AuthenticationQRState {
    authRequestURIResponse?: GenerateAuthRequestURIResponse
    qrCode?: Element
}

export default class AuthenticationQR extends Component<AuthenticationQRProps> {

    state: AuthenticationQRState = {}

    private registerStateSent: boolean = false
    private refreshTimerHandle?: NodeJS.Timeout
    private qrExpirationMs: number = 0
    private timedOutRequestMappings: Set<AuthenticationQRState> = new Set<AuthenticationQRState>()
    private _isMounted: boolean = false

    private readonly definitionId = process.env.PRESENTATION_DEF_ID || '9449e2db-791f-407c-b086-c21cc677d2e0'


    componentDidMount() {
        this.qrExpirationMs = parseInt(process.env.REACT_APP_QR_CODE_EXPIRES_AFTER_SEC ?? 120) * 1000
        // actually since the QR points to a JWT it has its own expiration value as well.

        if (!this.state.qrCode) {
            this.generateNewQRCode();
            this.refreshTimerHandle = setTimeout(() => this.refreshQRCode(), this.qrExpirationMs)
        }
        this._isMounted = true
    }

    private generateNewQRCode() {
        this.generateAuthRequestURI().then(authRequestURIResponse => {
            agent.uriElement(this.createQRCodeElement(authRequestURIResponse)).then(qrCode => {
                return this.setState({authRequestURIResponse, qrCode})
            })
        }).catch(e => console.error(e))
    }

    createQRCodeElement(authRequestURIResponse: GenerateAuthRequestURIResponse): CreateElementArgs<QRType.URI, URIData> {
        const qrProps: CreateElementArgs<QRType.URI, URIData> = {

            data: {
                type: QRType.URI,
                object: authRequestURIResponse.authRequestURI,
                id: authRequestURIResponse.correlationId

            },
            onGenerate: (result: ValueResult<QRType.URI, URIData>) => {
                this.registerState(authRequestURIResponse, result)
            },
            renderingProps: {
                bgColor: 'white',
                fgColor: '#352575',
                level: 'L',
                size: 200,
                title: 'Sign in'
            }

        }
        return qrProps
    }

    componentWillUnmount() {
        if (this.refreshTimerHandle) {
            clearTimeout(this.refreshTimerHandle)
        }
        this._isMounted = false
    }

    render() {
        // Show the loader until we have details on which parameters to load into the QR code
        return this.state.qrCode ? <div>{this.state.qrCode}</div>
            : <BallTriangle color="#352575" height="100" width="100"/>
    }

    /* Get the parameters that need to go into the QR code from the server */
    private generateAuthRequestURI = async (): Promise<GenerateAuthRequestURIResponse> => {
        const response = await axios.get(`/webapp/definitions/${this.definitionId}/auth-request-uri`)
        const generateResponse = await response.data
        if (response.status !== 200) {
            throw Error(generateResponse.message)
        }
        return generateResponse
    }

    /* We don't want to keep used and unused states indefinitely, so expire the QR code after a configured timeout  */
    private refreshQRCode = () => {
        console.log("Timeout expired, refreshing QR code...")
        if (this.qrExpirationMs > 0) {
            if (this.state) {
                this.timedOutRequestMappings.add(this.state)
            }
            this.registerStateSent = false
            this.generateNewQRCode()
        }
    }


    private registerState = (authRequestURIResponse: GenerateAuthRequestURIResponse, result: ValueResult<QRType.URI, URIData>) => {
        if (this.registerStateSent) return
        this.registerStateSent = true
        this.pollAuthStatus(authRequestURIResponse)
    }


    /* Poll the backend until we get a response, abort when the component is unloaded or the QR code expired */
    private pollAuthStatus = async (authRequestURIResponse: GenerateAuthRequestURIResponse) => {
        let pollingResponse = await axios.post("/webapp/auth-status", {
            correlationId: authRequestURIResponse?.correlationId,
            definitionId: authRequestURIResponse.definitionId
        })

        while (pollingResponse.status === 200 && this._isMounted && !this.timedOutRequestMappings.has(this.state)) {
            const authStatus:  AuthStatusResponse = pollingResponse.data
            if (!this.state.qrCode) {
                await this.generateNewQRCode()
            } else if (!authStatus) {
                continue
            } else if (this.timedOutRequestMappings.has(this.state)) {
                console.log("Cancelling timed out auth request.")
                await axios.post("/backend/cancel-auth-request", {}) // todo
                this.timedOutRequestMappings.delete(this.state)
            }
            // @ts-ignore
            if (authStatus.status === AuthorizationRequestStateStatus.SENT) {
                this.props.onAuthRequestRetrieved()
            } else if (authStatus.status === AuthorizationResponseStateStatus.VERIFIED) {
                this.props.onSignInComplete(authStatus as unknown as AuthResponse) // FIXME: BACKEND SHOULD PASS IN BODY HERE
                break
            } else if (authStatus.status === AuthorizationRequestStateStatus.ERROR || authStatus.status === AuthorizationResponseStateStatus.ERROR) {
                return Promise.reject(authStatus.error)
            } else {
                console.log(`Unknown status during polling: ${JSON.stringify(authStatus)}`)
            }
            pollingResponse = await axios.post("/webapp/auth-status", {
                correlationId: authRequestURIResponse?.correlationId,
                definitionId: authRequestURIResponse.definitionId
            })
        }
    }
}
