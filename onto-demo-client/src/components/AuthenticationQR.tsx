import React, {Component} from "react"
import GimlyIDQRCode, {QRContent, QRMode, QRType} from "@gimly-blockchain/gimlyid-qr-code-generator"
import axios from "axios"
import Loader from "react-loader-spinner"
import {AuthResponse, QRVariables, StateMapping} from "@gimly-blockchain/did-auth-siop-web-demo-shared"

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
        return this.setState({qrVariables: qrVariables, qrCode: this.generateGimlyIDQRCode(qrVariables)})
      })
      this.refreshTimerHandle = setTimeout(() => this.refreshQR(), this.qrExpiryMs)
    }
    this._isMounted = true
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
        : <Loader type="ThreeDots" color="#FEFF8AFF" height="100" width="100"/>
  }

  /* The GimlyIDQRCode component generates a random state id. Here we make sure it's created only once
    and the render() function will reuse the same one every time it is called. */
  private generateGimlyIDQRCode(qrVariables: QRVariables) {
    return <GimlyIDQRCode
        type={QRType.AUTHENTICATION}
        mode={QRMode.DID_AUTH_SIOP_V2}
        did={qrVariables?.requestorDID as string}
        redirectUrl={qrVariables?.redirectUrl}
        onGenerate={(qrContent: QRContent) => this.registerState(qrContent)}
    />
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
    if (this.currentStateMapping) {
      this.timedOutRequestMappings.add(this.currentStateMapping)
    }
    this.registerStateSent = false
    this.setState({qrCode: this.generateGimlyIDQRCode(this.state.qrVariables as QRVariables)})
    this.refreshTimerHandle = setTimeout(() => this.refreshQR(), this.qrExpiryMs)
  }

  /* Register the state along with the redirect URL in the backend */
  private registerState = (qrContent: QRContent) => {
    if (this.registerStateSent) return
    this.registerStateSent = true

    const stateMapping: StateMapping = new StateMapping()
    stateMapping.requestorDID = qrContent.did
    stateMapping.redirectUrl = qrContent.redirectUrl
    stateMapping.stateId = qrContent.state
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
