import React from "react";
import {Link} from 'react-router-dom';
import ProtectedResource from "../ProtectedResource";
import Button from 'react-bootstrap/Button';


export default class Nav extends ProtectedResource {

  render() {
    return (
        <div
            style={{
              padding: "10px",
              width: "10em",
              height: "50em",
              background: "#f0f0f0"
            }}
        >
          <ul style={{listStyleType: "none", padding: 0}}>
            <li>
              <Link to="/">
                <Button style={{width: "100%"}} variant="sphereon" size="lg">Home</Button>
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
