import React, {Component} from "react";

export default class Landing extends Component {
  render() {
    return (
        <div className="App" style={{ width: 750}}>
          <h2 style={{textAlign: 'left'}}>
            Welcome to the Sphereon OpenID4VP and SIOPv2 demo
          </h2>

          <p style={{textAlign: "left" }}>This demo is using Presentation Exchange to fetch claims of the authorized users, with an associated 'wallet' app that securely holds the data as Verifiable Credentials (VCs).</p>

          <p style={{textAlign: "left"}}>An example of company data as a Verifiable Credentials could be an extract from Chamber of Commerce, bank account details and the Ultimate Beneficial Owner (UBO). The data is validated and digitally signed in the process of issuing a Verifiable Credential by so-called "Issuers". Typically these are trusted parties like for example the Chamber of Commerce, the bank, a public notary, etc.. After issuance they are stored in the SSI-Wallet.</p>

          <p style={{textAlign: "left"}}>By then sharing this data as a Verifiable Presentations, the requesting party, a "Verifier:" – like for example a Telco – receiving the data can automatically import the data and verify its authenticity.</p>
        </div>
    )
  }
}
