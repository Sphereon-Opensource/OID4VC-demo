import React, {Component} from "react"
import axios from "axios"
import {BallTriangle} from "react-loader-spinner"
import {AuthResponse, StateMapping} from "@sphereon/did-auth-siop-web-demo-shared"
import {CreateElementArgs, QRType, URIData, ValueResult} from "@sphereon/ssi-sdk-qr-react";
import agent from '../agent';

export type AuthenticationQRProps = {
    onAuthRequestRetrieved: () => void
    onSignInComplete: (AuthResponse: AuthResponse) => void
}

export interface AuthenticationQRState {
    qrVariables?: URIData
    qrCode?: Element
}

export default class AuthenticationQR extends Component<AuthenticationQRProps> {

    state: AuthenticationQRState = {}

    private registerStateSent: boolean = false
    private refreshTimerHandle?: NodeJS.Timeout
    private qrExpirationMs: number = 0
    private currentStateMapping?: StateMapping
    private timedOutRequestMappings: Set<StateMapping> = new Set<StateMapping>()
    private _isMounted: boolean = false


    componentDidMount() {
        this.qrExpirationMs = parseInt(process.env.REACT_APP_QR_CODE_EXPIRES_AFTER_SEC ?? 120) * 1000
        // actually since the QR points to a JWT it has its own expiration value as well.

        if (!this.state.qrCode) {
            this.getQRValue().then(authRequestURI => {
                agent.uriElement(this.createQRArg(authRequestURI)).then(qr => {
                    return this.setState({qrVariables: authRequestURI, qrCode: qr})
                })
            }).catch(e => console.error(e))
            this.refreshTimerHandle = setTimeout(() => this.refreshQR(), this.qrExpirationMs)
        }
        this._isMounted = true
    }

    createQRArg(requestUri: string): CreateElementArgs<QRType.URI, URIData> {
        // console.log("SIOP URI:" + encodedUri)
        /*const siopv2Object: SIOPv2DataWithScheme = {
            scheme: 'openid-vc',
            requestUri,
        }
        const siopv2Data: QRData<QRType.SIOPV2, SIOPv2DataWithScheme> = {
            object: siopv2Object,
            type: QRType.SIOPV2,
            id: '456',
        }
        const siopv2CreateValue: CreateValueArgs<QRType.URI, URIData> = {
            data: siopv2Data,
            onGenerate: (result: ValueResult<QRType.SIOPV2, SIOPv2DataWithScheme>) => {
                this.registerState(result.value)
            },
        }*/

        const qrProps: CreateElementArgs<QRType.URI, URIData> = {

            data: {
                type: QRType.URI,
                object: requestUri,
                id: '456'

            },
            onGenerate: (result: ValueResult<QRType.URI, URIData>) => {
                this.registerState(result)
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
        /* const oobBaseUrl = encodedUri.redirectUrl as string + '?oob=';
         return {
           oobBaseUrl,
           type: QRType.DID_AUTH_SIOP_V2,
           body: {
             goalCode: GoalCode.STREAMLINED_VP,
             accept: [AcceptMode.SIOPV2_WITH_OIDC4VP],
           },
           id: encodedUri.id,
           from: encodedUri.requestorDID as string,
           onGenerate: (oobQRProps: OobQRProps, payload: OobPayload) => {
             this.registerState(encodedUri)
           },
           bgColor: 'white',
           fgColor: '#352575',
           level: 'L',
           size: 250,
           title: 'Sign in'
         }*/
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
    private getQRValue = async (): Promise<string> => {
        const response = await axios.get("/webapp/auth-request-uri")
        const requestURI = await response.data
        if (response.status !== 200) {
            throw Error(requestURI.message)
        }
        return requestURI as string
    }

    /* We don't want to keep used and unused states indefinitely, so expire the QR code after a configured timeout  */
    private refreshQR = () => {
        console.log("Timeout expired, refreshing QR code...")
        if (this.qrExpirationMs > 0) {
            if (this.currentStateMapping) {
                this.timedOutRequestMappings.add(this.currentStateMapping)
            }
            this.registerStateSent = false
            if (this.state.qrVariables) {
                agent.uriElement(this.createQRArg(this.state.qrVariables!)).then(qr => {
                    return this.setState({qrCode: qr});
                })
            } else {
                throw "qrVariables not defined";
            }
        }
    }

    /* Register the state along with the redirect URL in the backend */
    private registerState = (result: ValueResult<QRType.URI, URIData>) => {
        if (this.registerStateSent) return
        this.registerStateSent = true

        const stateMapping: StateMapping = new StateMapping()
        stateMapping.stateId = result.value
        stateMapping.redirectUrl = result.value.split('=')[1] // fixme
        stateMapping.sessionId = result.value
        /*    axios.post("/backend/register-state", stateMapping)
                .then(response => {
                    console.log("register-state response status", response.status)
                    if (response.status !== 200) {
                        throw Error(response.data.message)
                    }
                    this.currentStateMapping = stateMapping
                    this.pollForResponse(stateMapping)
                })
                .catch(error => console.error("register-state failed", error))*/
    }

    /* Poll the backend until we get a response, abort when the component is unloaded or the QR code expired */
    private pollForResponse = async (stateMapping: StateMapping) => {
        let pollingResponse = await axios.post("/backend/poll-auth-response", {uri: stateMapping.stateId})
        while (pollingResponse.status === 202 && this._isMounted && !this.timedOutRequestMappings.has(stateMapping)) {
            if (this.state.qrCode && pollingResponse.data && pollingResponse.data.authRequestCreated) {
                this.setState({qrCode: undefined})
                this.props.onAuthRequestRetrieved()
            }
            pollingResponse = await axios.post("/backend/poll-auth-response", {stateId: stateMapping.stateId})
        }
        if (this.timedOutRequestMappings.has(stateMapping)) {
            console.log("Cancelling timed out auth request.")
            await axios.post("/backend/cancel-auth-request", {stateId: stateMapping.stateId})
            this.timedOutRequestMappings.delete(stateMapping)
        } else if (pollingResponse.status === 200) {
            this.props.onSignInComplete(pollingResponse.data as AuthResponse)
        } else {
            return Promise.reject(pollingResponse.data.message)
        }
    }
}
