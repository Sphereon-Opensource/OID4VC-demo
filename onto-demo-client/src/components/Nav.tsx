import React from "react";
import {Link} from 'react-router-dom';
import ProtectedResource from "../pages/ProtectedResource";
import Button from 'react-bootstrap/Button';


export default class Nav extends ProtectedResource {

  render() {
    return (
        <div
            style={{
              padding: "10px",
              width: "10em",
              height: "60em",
              background: "rgb(53 52 56 / 95%)"
            }}
        >
          <ul style={{listStyleType: "none", padding: 0}}>
            <li>
              <Link to="/">
                <Button style={{width: "90%"}} variant="sphereon" size="lg">Home</Button>
              </Link>
            </li>
            {this.protectedResources()}
          </ul>
        </div>
    );
  }

  private protectedResources() {
    if (this.isAuthenticated()) {
      return <>
        <li>
          <Link to="/secret">A secret page</Link>
        </li>
        <li>
          <Link to="/classified">A classified page</Link>
        </li>
      </>;
    } else {
      return null
    }
  }
}
