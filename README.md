<h2 style="text-align: center; vertical-align: middle">
    <center><a href="https://www.sphereon.com"><img src="https://sphereon.com/content/themes/sphereon/assets/img/logo.svg" alt="Sphereon" width="320" style="vertical-align: middle" ></a></center>

<br>OID4VC Issuer and Verifier Demo      
<br>
<br>
</h2>

#### This is a demo to showcase our OpenID for Verifiable Credentials libraries and components.

**Please note that this is not intended as production code. It is a relative simple implementation to show how the
OID4VC technologies, SIOPv2 (peer to peer authentication), OID4VP (Verification), OID4VCI (Issuance) end Presentation
Exchange (requirements by verifiers) work.**

## Overview

In this document we're going to show you step by step what you have to do to set your own VCI demo up.

The demo consists of 3 components, which can be found in the packages folder.

- The agent using our [SSI-SDK](https://github.com/Sphereon-OpenSource/SSI-SDK), responsible for key-management, DIDs,
  Presentation Exchange storage, Issuer Metadata Storage, as well as
  actual issuance and verification of Credentials. It can handle multiple issuer configurations as well as
  Verifiers/Presentation definitions at the same time, although the frontends only will use one
- A Demo Issuer frontend, allowing you to fill out a simple form, or using a wallet, to supply some information, which
  then will be used to issue a credential containing that information. This code can be exported and run on a regular
  webserver if you want. It is a frontend communicating with the agent, using some of our OID4VC SSI-SDK plugins.
- A Demo Verifier frontend, allowing you to verify the Credential issued by the agent (the demo issuer, also contains
  similar functionality if you would follow the wallet flow btw). Be aware that we will replace this demo frontend with
  something a bit more appealing soon.

The Demo is using code from our [SSI-SDK](https://github.com/Sphereon-OpenSource/SSI-SDK), providing 11 modules for
OID4VC, QR code generation, as well as Issuance branding. Integrating these technologies with a Key Management System,
DID methods etc. The OID4VC modules in the SDK in turn are using our less opinionated lower-level
libraries, allowing people to integrate OID4VC functionalities that do not desire full agent functionality, or have
their own agent support, like for
instance [Aries Framework Javascript](https://github.com/hyperledger/aries-framework-javascript).
Obviously integrating the low-level libraries will be a bit more work, but does bring flexibility.
The most prominent low-level libraries are:

- [OpenID for Verifiable Credential Issuance (client and issuer library)](https://github.com/Sphereon-Opensource/OID4VCI)
- [Self Issued OpenID v2 and OpenID for Verifiable Presentations](https://github.com/Sphereon-Opensource/SIOP-OID4VP)
- [Presentation Exchange v1 and v2](https://github.com/Sphereon-Opensource/PEX)

## Wallet Prerequisites

You will need an OID4VC capable wallet, that supports SIOPv2, OID4VP, OID4VCI and Presentation Exchange. You can use our
Open-Source wallet from the stores. You can see our [Wallet demo instructions](https://sphereon.com/sphereon-products/sphereon-wallet/sphereon-wallet-demo-instructions/)
Here is a list of wallet's with above-mentioned capabilities:
- [Sphereon](https://github.com/Sphereon-Opensource/ssi-mobile-wallet)
- [Animo](https://github.com/animo/paradym-wallet)

A scenario for fetching a credential. Note that since the process is dynamic, your setup might be a little different, but the main parts will stay the same.

//TODO: when merged, change the address
![To fetch a credential](./documents/vci-flow.puml)

And a scenario for using Verifiable Credential(s) For OID4VP flow:
![OID4VP flow](./documents/oid4vp-flow.puml)

In the next chapters we're going to show you how to setup the `agent` module, oid4vci-demo-front-end and a brief introduction on how credential branding actually works.

- [Setting up the agent](./documents/agent-setup.md)
- [Setting up VCI frontend](./documents/vci-front-end.md)
- [Credential Branding](./documents/credential-branding.md)

### Docker

From the root folder run:

```bash
docker-compose build
docker-compose up
```

The build phase might take a few minutes. If you run the docker-compose up command 3 services will be running. The ssi-agent, oid4vci-demo-frontend and oid4vp-frontend.

You should now be able to go to http://host.docker.internal:5001 and http://host.docker.internal:5002 respectively to test the issuer and verifier demo's.

Please note that you might have to configure your docker environment to expose the host.docker.internal like the image below. If you cannot make that work you could adjust the config/docker and docker/*.env files to suit your needs

<img src="resources/docker_settings.png" width="500" />

#### Environment variables and configuration for docker.
Please note that the environment variables for the 3 images come from the ./docker folder. You will have to copy the 3 example files and remove the .example suffix.

The configuration files are copied over to the agent image. So the above explained configuration options also apply when running in docker.
