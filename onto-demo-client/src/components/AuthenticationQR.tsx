import React, {Component} from "react"
import axios from "axios"
import Loader from "react-loader-spinner"
import {
  AuthResponse,
  QRVariables,
  StateMapping
} from "@sphereon/did-auth-siop-web-demo-shared"
import {
  AcceptMode,
  GoalCode,
  OobPayload,
  OobQRProps,
  QRType
} from "@sphereon/ssi-sdk-waci-pex-qr-react";
import {createOobQrCode} from '../agent';

export type AuthenticationQRProps = {
  onAuthRequestCreated: () => void
  onSignInComplete: (AuthResponse: AuthResponse) => void
}

export interface AuthenticationQRState {
  qrVariables?: QRVariables
  qrCode?: Element
}

export default class AuthenticationQR extends Component<AuthenticationQRProps> {

  state: AuthenticationQRState = {}

  private registerStateSent: boolean = false
  private refreshTimerHandle?: NodeJS.Timeout
  private qrExpiryMs: number = 0
  private currentStateMapping?: StateMapping
  private timedOutRequestMappings: Set<StateMapping> = new Set<StateMapping>()
  private _isMounted: boolean = false


  componentDidMount() {
    this.qrExpiryMs = parseInt(process.env.REACT_APP_QR_CODE_EXPIRES_AFTER_SEC) * 1000
    if (!this.state.qrCode) {
      this.getQRVariables().then(qrVariables => {
        createOobQrCode(this.createOobQRProps(qrVariables as QRVariables)).then(qr => {
          return this.setState({qrVariables, qrCode: qr})
        })
      }).catch(e=> console.error(e))
      this.refreshTimerHandle = setTimeout(() => this.refreshQR(), this.qrExpiryMs)
    }
    this._isMounted = true
  }

  createOobQRProps(qrVariables: QRVariables): OobQRProps {
    console.log("qrVariables:",qrVariables)
    const oobBaseUrl = qrVariables.redirectUrl as string + '?oob=';
    return {
      oobBaseUrl,
      type: QRType.DID_AUTH_SIOP_V2,
      body: {
        goalCode: GoalCode.STREAMLINED_VP,
        accept: [AcceptMode.SIOPV2_WITH_OIDC4VP],
      },
      id: qrVariables.id,
      from: qrVariables.requestorDID as string,
      onGenerate: (oobQRProps: OobQRProps, payload: OobPayload) => {
        console.log(payload)
      },
      bgColor: 'white',
      fgColor: '#352575',
      level: 'L',
      size: 250,
      title: 'Sign in'
    }
  }
  componentWillUnmount() {
    if (this.refreshTimerHandle) {
      clearTimeout(this.refreshTimerHandle)
    }
    this._isMounted = false
  }

  render() {
    // Show the loader until we have details on which parameters to load into the QR code
    return this.state.qrCode
      ? this.state.qrCode
      : <Loader type="BallTriangle" color="#352575" height="100" width="100"/>
  }

  /* Get the parameters that need to go into the QR code from the server. (We don't want to build/pack a new frontend version for every change to the QR code.) */
  private getQRVariables = async () => {
    const response = await axios.get("/backend/get-qr-variables")
    const body = await response.data

    if (response.status !== 200) {
      throw Error(body.message)
    }
    return body
  }

  /* We don't want to keep used and unused states indefinitely, so expire the QR code after a configured timeout  */
  private refreshQR = () => {
    console.log("Timeout expired, refreshing QR code...")
    if (this.qrExpiryMs > 0) {
      if (this.currentStateMapping) {
        this.timedOutRequestMappings.add(this.currentStateMapping)
      }
      this.registerStateSent = false
      if (this.state.qrVariables) {
        createOobQrCode(this.createOobQRProps(this.state.qrVariables)).then(qr => {
          return this.setState({qrCode: qr});
        })
      } else {
        throw "qrVariables not defined";
      }
    }
  }
}
