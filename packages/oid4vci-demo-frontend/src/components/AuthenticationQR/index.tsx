import React, {Component} from 'react'
import {BallTriangle} from 'react-loader-spinner'
// import {AuthorizationResponseStateStatus, GenerateAuthRequestURIResponse} from './auth-model'
import {CreateElementArgs, QRType, URIData, ValueResult} from '@sphereon/ssi-sdk.qr-code-generator'
import { AuthStatusResponse, GenerateAuthRequestURIResponse } from '@sphereon/ssi-sdk.siopv2-oid4vp-common'

import {AuthorizationResponsePayload, AuthorizationResponseStateStatus} from '@sphereon/did-auth-siop'
import Debug from 'debug'
import {NonMobileOS} from "../../index"
import {Ecosystem} from "../../ecosystem/ecosystem"
import {APP_SSI_QR_CODE_EXPIRES_AFTER_SEC} from "../../environment"


const debug = Debug('sphereon:portal:ssi:AuthenticationQR')

export type AuthenticationQRProps = {
  vpDefinitionId: string
  ecosystem: Ecosystem
  width?: number
  fgColor?: string
  onAuthRequestRetrieved: () => void
  onSignInComplete: (payload: AuthorizationResponsePayload) => void
  setQrCodeData: (text: string) => void
}

export interface AuthenticationQRState {
  authRequestURIResponse?: GenerateAuthRequestURIResponse
  qrCode?: JSX.Element
}

class AuthenticationQR extends Component<AuthenticationQRProps> {
  state: AuthenticationQRState = {}

  private registerStateSent = false
  private refreshTimerHandle?: NodeJS.Timeout
  private authStatusHandle?: number
  private qrExpirationMs = 0
  private timedOutRequestMappings: Set<AuthenticationQRState> = new Set<AuthenticationQRState>()
  private _isMounted = false


  componentDidMount() {
    const {ecosystem, vpDefinitionId} = this.props

    this.qrExpirationMs = APP_SSI_QR_CODE_EXPIRES_AFTER_SEC * 1000
    // actually since the QR points to a JWT it has its own expiration value as well.

    if (!this.state.qrCode) {
      this.generateNewQRCode()
      this.refreshTimerHandle = setTimeout(
        () => this.refreshQRCode(),
        this.qrExpirationMs
      )
    }
    this._isMounted = true
    if (!ecosystem) {
      throw new Error('Prop ecosystem is required')
    }
    if (!vpDefinitionId) {
      throw new Error('Prop vpDefinitionId is required')
    }
  }

  private generateNewQRCode() {
    const {ecosystem, vpDefinitionId, setQrCodeData} = this.props
      ecosystem.getAgent()
      .siopClientCreateAuthRequest({definitionId: vpDefinitionId})
      .then((authRequestURIResponse) => {
        setQrCodeData(authRequestURIResponse.authRequestURI)
        ecosystem.getAgent()
          .qrURIElement(this.createQRCodeElement(authRequestURIResponse))
          .then((qrCode) => {
            this.registerState(authRequestURIResponse, qrCode)
            // return this.setState({authRequestURIResponse, qrCode})
          })
      })
      .catch(debug)
  }

  createQRCodeElement(
    authRequestURIResponse: GenerateAuthRequestURIResponse
  ): CreateElementArgs<QRType.URI, URIData> {
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
        fgColor: this.props.fgColor ?? '#000000',
        level: 'L',
        size:  this.props.width ?? 300,
        title: 'Sign in'
      }
    }
    return qrProps
  }

  componentWillUnmount() {
    if (this.refreshTimerHandle) {
      clearTimeout(this.refreshTimerHandle)
    }
    if (this.authStatusHandle) {
      clearInterval(this.authStatusHandle)
    }
    this._isMounted = false
  }

    render() {
        // Show the loader until we have details on which parameters to load into the QR code
        return this.state.qrCode ? (
            <NonMobileOS>
                <div>{this.state.qrCode}</div>
            </NonMobileOS>
        ) : (
            <NonMobileOS>
                <BallTriangle color="#352575" height="100" width="100"/>
            </NonMobileOS>
        )
    }

  /* We don't want to keep used and unused states indefinitely, so expire the QR code after a configured timeout  */
  private refreshQRCode = () => {
    debug('Timeout expired, refreshing QR code...')
    if (this.qrExpirationMs > 0) {
      if (this.state) {
        this.timedOutRequestMappings.add(this.state)
      }
      this.registerStateSent = false
      // this.generateNewQRCode()
    }
  }

  private registerState = (
    authRequestURIResponse: GenerateAuthRequestURIResponse,
    qrCode: JSX.Element
  ) => {
    if (
      this.state.authRequestURIResponse?.correlationId ===
      authRequestURIResponse.correlationId
    ) {
      // same correlationId, which we are already polling
      return
    }

    if (!this.timedOutRequestMappings.has({ authRequestURIResponse, qrCode })) {
      this.timedOutRequestMappings.add({ authRequestURIResponse, qrCode })
    }
    this.setState({ qrCode, authRequestURIResponse })
    void this.pollAuthStatus(authRequestURIResponse)
  }

  /* Poll the backend until we get a response, abort when the component is unloaded or the QR code expired */
  private pollAuthStatus = async (
    authRequestURIResponse: GenerateAuthRequestURIResponse
  ) => {
    const {ecosystem, onSignInComplete} = this.props
    this.authStatusHandle = setInterval(async (args) => {
      ecosystem.getAgent().siopClientGetAuthStatus({
        correlationId: authRequestURIResponse.correlationId,
        definitionId: authRequestURIResponse.definitionId
      }).then((response: AuthStatusResponse) => {
        if (response.status === AuthorizationResponseStateStatus.VERIFIED) {
          clearInterval(this.authStatusHandle)
          onSignInComplete(response.payload!)
        }
      }).catch((error: Error) => {
        clearInterval(this.authStatusHandle)
        console.log(`ERROR: ${error.message}`)
      })
    }, 1000)
  }
}

export default AuthenticationQR;
