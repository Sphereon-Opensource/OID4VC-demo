## Overview
This multimodule project, consists of three parts. At the core of this project sits the "agent" module. This module coordinates all the backend functionalities of two other react projects. The agent can achieve this by taking advantage of our other ssi related technologies. Here are a brief list of other useful resources:
- [SSI-SDK](https://github.com/Sphereon-Opensource/SSI-SDK)
  - This mono repository, contains packages that add support for Presentation Exchange and OpenID4VC (SIOPv2, OID4VCI, OID4VP) and other functionalities to SSI-SDK and Veramo based agents.
- [PEX](https://github.com/Sphereon-Opensource/PEX)
  - The Presentation Exchange (PEX) Library implements the functionality described in the DIF Presentation Exchange specification for both version 1 and 2.
- [OID4VCI](https://github.com/Sphereon-Opensource/OID4VCI)
  - This is a mono-repository with a client and issuer pacakge to request and receive Verifiable Credentials using the OpenID for Verifiable Credential Issuance ( OpenID4VCI) specification for receiving Verifiable Credentials as a holder/subject.
- [SIOP-OID4VP](https://github.com/Sphereon-Opensource/SIOP-OID4VP)
  - An OpenID authentication library conforming to the Self Issued OpenID Provider v2 (SIOPv2) and OpenID for Verifiable Presentations (OpenID4VP) as specified in the OpenID Connect working group.

And many more open-source libraries.
You can use this demo for showcasing VCI abilities as well as SIOP-OID4VP abilities.

In this document we're going to show you step by step what you have to do to setup your own VCI demo.
Note that in order for you to setup a VCI demo and actually receive a credential, you need to have an SSI compatible wallet. Here is a list of wallet's with such capabilities:
- Sphereon

//TODO: complete this list

A scenario for fetching a credential. Note that since the process is dynamic, your setup might be a little different, but the main parts will stay the same.

//TODO: when merged, change the address
![To fetch a credential](./vci-flow.puml)

In the next chapters we're going to show you how to setup the `agent` module, oid4vci-demo-front-end and a brief introduction on how credential branding actually works.

- [Setting up the agent](./agent-setup.md)
- [Setting up VCI frontend](./vci-front-end.md)
- [Credential Branding](./credential-branding.md)
