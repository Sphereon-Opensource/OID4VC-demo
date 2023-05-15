import React from "react"
import ProtectedResource from "./ProtectedResource";

export default class SecretPage extends ProtectedResource {

  render() {
    if (this.isAuthenticated()) {
      return (
        <div className="App" style={{
          backgroundImage: `url("930-W.jpg")`,
          backgroundRepeat: "no-repeat",
          backgroundSize: "cover",
          width:"100%"}}>
            <img src="secret.svg" alt="logo" width="350px"/>
            <h5>The secret page</h5>
          </div>
      )
    } else {
      return this.accessDenied();
    }
  }
}
