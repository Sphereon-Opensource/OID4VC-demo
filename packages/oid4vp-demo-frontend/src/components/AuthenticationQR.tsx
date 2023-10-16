import React, {Component} from "react"
import {BallTriangle} from "react-loader-spinner"
import {CreateElementArgs, QRType, URIData, ValueResult} from "@sphereon/ssi-sdk.qr-code-generator";
import agent from '../agent';
import {
    AuthorizationResponsePayload,
    AuthStatusResponse,
    GenerateAuthRequestURIResponse
} from "@sphereon/ssi-sdk.siopv2-oid4vp-common"

export type AuthenticationQRProps = {
    onAuthRequestRetrieved: () => void
    onSignInComplete: (payload: AuthorizationResponsePayload) => void
}

export interface AuthenticationQRState {
    authRequestURIResponse?: GenerateAuthRequestURIResponse
    qrCode?: JSX.Element
}

export default class AuthenticationQR extends Component<AuthenticationQRProps> {

    public state: AuthenticationQRState = {}

    private registerStateSent: boolean = false
    private refreshTimerHandle?: NodeJS.Timeout
    private qrExpirationMs: number = 0
    private timedOutRequestMappings: Set<AuthenticationQRState> = new Set<AuthenticationQRState>()
    private _isMounted: boolean = false

    private readonly definitionId = process.env.REACT_APP_PRESENTATION_DEF_ID || 'sphereon'


    componentDidMount() {
        this.qrExpirationMs = parseInt(process.env.REACT_APP_QR_CODE_EXPIRES_AFTER_SEC ?? 1200) * 1000
        // actually since the QR points to a JWT it has its own expiration value as well.

        if (!this.state.authRequestURIResponse || !this.state?.qrCode) {
            this.generateNewQRCode();
            this.refreshTimerHandle = setTimeout(() => this.refreshQRCode(), this.qrExpirationMs)
        }
        this._isMounted = true
    }

    private generateNewQRCode() {
        this.generateAuthRequestURI().then(authRequestURIResponse => {
            agent.qrURIElement(this.createQRCodeElement(authRequestURIResponse)).then((qrCode) => {
                this.registerState(authRequestURIResponse, qrCode)
                // return this.setState({authRequestURIResponse, qrCode})
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
                // this.registerState(authRequestURIResponse, qrProps.renderingProps)
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
        this.setState({})
        this._isMounted = false
    }

    render() {
        // Show the loader until we have details on which parameters to load into the QR code
        console.log(`====> render qr ${this.state.qrCode}`)
        return this.state.qrCode ? <div>{this.state.qrCode}</div>
            : <BallTriangle color="#352575" height="100" width="100"/>
    }

    /* Get the parameters that need to go into the QR code from the server */
    private generateAuthRequestURI = async (): Promise<GenerateAuthRequestURIResponse> => {
        return await agent.siopClientCreateAuthRequest({
          definitionId: this.definitionId
        })
    }

    /* We don't want to keep used and unused states indefinitely, so expire the QR code after a configured timeout  */
    private refreshQRCode = () => {
        console.log("Timeout expired, refreshing QR code...")
        if (this.qrExpirationMs > 0) {
            if (this.state.authRequestURIResponse) {
                this.timedOutRequestMappings.add(this.state)
            }
            this.registerStateSent = false
            this.generateNewQRCode()
        }
    }


    private registerState = (authRequestURIResponse: GenerateAuthRequestURIResponse, qrCode: JSX.Element) => {
        if (this.state.authRequestURIResponse?.correlationId === authRequestURIResponse.correlationId) {
            // same correlationId, which we are already polling
            return
        }

        /*if (!this.timedOutRequestMappings.has({authRequestURIResponse, qrCode})) {
            this.timedOutRequestMappings.add({authRequestURIResponse, qrCode})
        }*/
        this.setState({qrCode, authRequestURIResponse})
        /*    this.state.qrCode = qrCode
            this.state.authRequestURIResponse = authRequestURIResponse
    */
        this.pollAuthStatus(authRequestURIResponse)
    }


    /* Poll the backend until we get a response, abort when the component is unloaded or the QR code expired */
    private pollAuthStatus = async (authRequestURIResponse: GenerateAuthRequestURIResponse) => {
        let authStatus:  AuthStatusResponse = await agent.siopClientGetAuthStatus({
          correlationId: authRequestURIResponse?.correlationId,
          definitionId: authRequestURIResponse.definitionId
        })
        const interval = setInterval(async args => {
            if (!this.state.qrCode) {
                clearInterval(interval)
                // return this.generateNewQRCode()
            } else if (!authStatus) {
                return
            } else if (this.timedOutRequestMappings.has(this.state)) {
                const timedoutState = this.state
                try {
                    console.log("Cancelling timed out auth request.")
                    if (timedoutState?.authRequestURIResponse) {
                        await agent.siopClientRemoveAuthRequestSession({
                            correlationId: timedoutState.authRequestURIResponse.correlationId,
                            definitionId: timedoutState.authRequestURIResponse.definitionId
                        })
                        this.timedOutRequestMappings.delete(timedoutState) // only delete after deleted remotely
                    }
                    clearInterval(interval)
                } catch (error) {
                    console.log(error)
                }
            }
            if (authStatus.status === 'sent') {
                this.props.onAuthRequestRetrieved()
            } else if (authStatus.status === 'verified') {
                clearInterval(interval)
                return this.props.onSignInComplete(authStatus.payload as AuthorizationResponsePayload)
            } else if (authStatus.status === 'error') {
                clearInterval(interval)
                return Promise.reject(authStatus.error)
            } else {
                console.log(`status during polling: ${JSON.stringify(authStatus)}`)
            }

            // Use the state, as that gets updated by the qr code
            authStatus = await agent.siopClientGetAuthStatus({
              correlationId: authRequestURIResponse?.correlationId,
              definitionId: authRequestURIResponse.definitionId
            })
            console.log(JSON.stringify(authStatus))
        }, 1000)
    }
}
