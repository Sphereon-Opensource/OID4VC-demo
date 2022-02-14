import {AuthResponse} from "@gimly-blockchain/did-auth-siop-web-demo-shared"
import React, {Component} from "react"
import {isBlank} from "underscore.string"

export type ProtectedResourceProps = {
  AuthResponse: AuthResponse
}


export default class ProtectedResource extends Component<ProtectedResourceProps> {


  protected isAuthenticated(): boolean {
    return this.props.AuthResponse && !isBlank(this.props.AuthResponse.userDID)
  }


  protected accessDenied() {
    return (
        <div className="App">
          <img src="access-denied.jpg" alt="logo" width="80%"/>
        </div>
    )
  }
}
