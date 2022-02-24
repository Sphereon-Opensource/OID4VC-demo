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
  OobQRProps, QRContent,
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
        this.registerState(qrVariables)
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

  /* Register the state along with the redirect URL in the backend */
  private registerState = (qrVariables: QRVariables) => {
    if (this.registerStateSent) return
    this.registerStateSent = true

    const stateMapping: StateMapping = new StateMapping()
    stateMapping.stateId = qrVariables.id
    stateMapping.redirectUrl = qrVariables.redirectUrl
    stateMapping.sessionId = qrVariables.requestorDID
    axios.post("/backend/register-state", stateMapping)
      .then(response => {
        console.log("register-state response status", response.status)
        if (response.status !== 200) {
          throw Error(response.data.message)
        }
        this.currentStateMapping = stateMapping
        this.pollForResponse(stateMapping)
      })
      .catch(error => console.error("register-state failed", error))
  }

  /* Poll the backend until we get a response, abort when the component is unloaded or the QR code expired */
  private pollForResponse = async (stateMapping: StateMapping) => {
    let pollingResponse = await axios.post("/backend/poll-auth-response", {stateId: stateMapping.stateId})
    while (pollingResponse.status === 202 && this._isMounted && !this.timedOutRequestMappings.has(stateMapping)) {
      if (this.state.qrCode && pollingResponse.data && pollingResponse.data.authRequestCreated) {
        this.setState({qrCode: undefined})
        this.props.onAuthRequestCreated()
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
