import React from "react"
import ProtectedResource from "./ProtectedResource";

export default class ClassifiedPage extends ProtectedResource {

  render() {
    if (this.isAuthenticated()) {
      return (
          <div className="App" style={{
          backgroundImage: `url("930-W.jpg")`,
          backgroundRepeat: "no-repeat",
          backgroundSize: "cover",
          width:"100%"}}>
            <img src="classified.svg" alt="logo"/>
            <h5>The classified page</h5>
          </div>
      )
    } else {
      return this.accessDenied();
    }
  }
}
