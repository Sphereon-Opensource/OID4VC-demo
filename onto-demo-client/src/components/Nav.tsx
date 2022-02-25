import React from "react";
import {Link} from 'react-router-dom';
import ProtectedResource from "../pages/ProtectedResource";
import Button from '@material-ui/core/Button';


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
              <Link to="/" style={{textDecoration: "none"}}>
                <Button style={{width: "90%"}} variant="contained" color={"secondary"} >Home</Button>
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
          <Link to="/secret" style={{textDecoration: "none"}}>
            <Button style={{width: "90%"}} variant="contained" color={"secondary"} >A secret page</Button>
          </Link>
        </li>
        <li>
          <Link to="/classified"  style={{textDecoration: "none"}}>
            <Button style={{width: "90%"}} variant="contained" color={"secondary"} >A classified page</Button>
          </Link>
        </li>
      </>;
    } else {
      return null
    }
  }
}
