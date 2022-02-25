import React, {Component} from "react";

export default class Landing extends Component {
  render() {
    return (
        <div className="App" style={{ width: 750}}>
          <h2 style={{textAlign: 'left'}}>
            Welcome to SSI demo web app
          </h2>
          <p style={{textAlign: "left" }}>The Demo app is using verifiable credentials to fetch personal identity of the authorized users, with an associated ‘wallet’ that holds the data as Verifiable Credentials (VCs).</p>

          <p style={{textAlign: "left"}}>An example of company data as a Verifiable Credential could be an extract from Chamber of Commerce, the Bank account details, the Ultimate Beneficial Owner (UBO). These data are validated and digitally signed at issuance by so-called “Trusted Parties”, for example the Chamber of Commerce, the bank, a public notary, etc. and then stored in the SSI-Wallet.</p>

          <p style={{textAlign: "left"}}>By then sharing this data as Verifiable Credentials/Presentations, the requesting party – like for example the Telco – receiving the data can automatically import the data and verify its authenticity and trust the data.</p>
        </div>
    )
  }
}
