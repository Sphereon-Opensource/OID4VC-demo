import React, {Component} from "react"
import {AuthorizationResponsePayload} from "@sphereon/did-auth-siop";

export type ProtectedResourceProps = {
  payload: AuthorizationResponsePayload
}


export default class ProtectedResource extends Component<ProtectedResourceProps> {


  protected isAuthenticated(): boolean {
    return this.props.payload !== undefined
  }


  protected accessDenied() {
    return (
        <div className="App">
          <img src="access-denied.jpg" alt="logo" width="50%"/>
        </div>
    )
  }
}
