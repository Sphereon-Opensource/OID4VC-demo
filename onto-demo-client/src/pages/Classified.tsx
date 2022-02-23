import React from "react"
import ProtectedResource from "../ProtectedResource";

export default class Landing extends ProtectedResource {

  render() {
    if (this.isAuthenticated()) {
      return (
          <div className="App">
            <img src="classified.gif" alt="logo"/>
            <h5>The classified page</h5>
          </div>
      )
    } else {
      return this.accessDenied();
    }
  }
}
