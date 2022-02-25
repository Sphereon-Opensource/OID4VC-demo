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
              width: "14em",
              height: "60em",
              background: "rgb(53 52 56 / 95%)",
              justifyContent: 'center',
              alignItems: "center"
            }}
        >
          <ul style={{listStyleType: "none", padding: 0}}>
            <li>
              <Link to="/" style={{textDecoration: "none"}}>
                <Button style={{width: "90%", backgroundColor:'red', color: "white", marginBottom: 10}} variant="contained" >Home</Button>
              </Link>
            </li>
            {this.protectedResources()}
          </ul>
        </div>
    );
  }

  private protectedResources() {
    if (this.isAuthenticated()) {
      return <div style={{justifyContent: 'center', alignItems: "center"}}>
        <li>
          <Link to="/secret" style={{textDecoration: "none"}}>
             <Button style={{width: "90%", backgroundColor:'red', color: "white", marginBottom: 10}} variant="contained" >secret page</Button>
          </Link>
        </li>
        <li>
          <Link to="/classified" style={{textDecoration: "none"}}>
             <Button style={{width: "90%", backgroundColor:'red', color: "white", marginBottom: 10}} variant="contained" >classified page</Button>
          </Link>
        </li>
      </div>;
    } else {
        return <div style={{justifyContent: 'center', alignItems: "center"}}>
            <li>
                <Link to="/classified" style={{textDecoration: "none"}}>
                    <Button style={{width: "90%", backgroundColor:'red', color: "white", marginBottom: 10}} variant="contained" >classified page</Button>
                </Link>
            </li>
        </div>;
    }
  }
}
