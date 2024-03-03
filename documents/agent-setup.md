<!--suppress HtmlDeprecatedAttribute -->
<h1 align="center">
  <br>
  <a href="https://www.sphereon.com"><img src="https://sphereon.com/content/themes/sphereon/assets/img/logo.svg" alt="Sphereon" width="400"></a>
  <br>OID4VC demo's agent setup 
  <br>
</h1>

---

## Table of contents
1. [Agent Configuration Guide](#agent-configuration-guide)
    1. [Configuration Directory Structure](#configuration-directory-structure)
        1. [dids](#1-dids)
        2. [oid4vci_metadata](#2-oid4vci_metadata)
        3. [oid4vci_options](#3-oid4vci_options)
        4. [oid4vp_options](#4-oid4vp_options)
        5. [presentation_definitions](#5-presentation_definitions)
        6. [templates](#6-templates)
    2. [.env variables](#env-variables)
2. [Starting the agent](#starting-the-agent)


## Agent Configuration Guide

Welcome to the agent setup guide. This document will walk you through configuring your agent module by leveraging the settings defined in your `.env` file. Specifically, the `CONF_PATH` property in your `.env` file dictates where the agent retrieves its configuration from.

### Configuration Directory Structure

Within your `packages/agent/conf` directory, navigate to the `examples` subfolder. Here, you will find six key directories, each integral to the agent's configuration:

#### 1. dids

This directory is designated for storing Decentralized Identifiers (DIDs) documents. These did documents will be used throughout or oid4vci and oid4vp/siop process.

#### 2. oid4vci_metadata

In this folder, you'll find JSON files that detail the metadata required by the [VCI specification](https://openid.net/specs/openid-4-verifiable-credential-issuance-1_0.html) and some values that are essential for configuring this agent. Following is a table of values that should be set for a json file inside `oid4vci_metadata`:

| Variable              | Sub-Variable                 | Description                                                                                                                                                                                                                                                                                                                                        |
|-----------------------|------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `correlationId`       |                              | This value maps different configuration files onto the same internal issuer or verifier. So a correlationId between an options file and for instance a metadata file end up in the same issuer/verifier instance and DB.                                                                                                                           |
| `overwriteExisting`   |                              | Determines whether to replace existing OID4VCI metadata stored in the database with new values coming from the metadata configuration file.                                                                                                                                                                                                        |
| `metadata`            |                              | Contains configuration details and specifications for credential issuance.                                                                                                                                                                                                                                                                         |
|                       | `credential_issuer`          | The Credential Issuer's identifier.                                                                                                                                                                                                                                                                                                                |
|                       | `credential_endpoint`        | URL of the Credential Issuer's Credential Endpoint. This URL MUST use the https scheme and MAY contain port, path and query parameter components.                                                                                                                                                                                                  |
|                       | `display`                    | (optional) An array of objects, where each object contains display properties of a Credential Issuer for a certain language. Below is a non-exhaustive list of valid parameters that MAY be included: name (optional) string and locale (optional) string                                                                                          |
|                       | `credentials_supported`      | A JSON array containing a list of JSON objects, each of them representing metadata about a separate credential type that the Credential Issuer can issue. The JSON objects in the array MUST conform to the structure of the [OID4VCI spec](https://openid.net/specs/openid-4-verifiable-credential-issuance-1_0.html#credential-metadata-object). |
|                       | `credential_supplier_config` | Configuration settings for the provider of the credentials.                                                                                                                                                                                                                                                                                        | 

#### 3. oid4vci_options

This is the directory where custom OID4VCI configuration files are maintained.

| Variable              | Sub-Variable        | Description                                                                                                                                                                                                               |
|-----------------------|---------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `definitionId`        |                     | Unique identifier for the credential definition.                                                                                                                                                                          |
| `correlationId`       |                     | This value maps different configuration files onto the same internal issuer or verifier. So a correlationId between an options file and for instance a metadata file end up in the same issuer/verifier instance and DB.  |
| `overwriteExisting`   |                     | (optional) Boolean flag indicating whether existing storage should be overwritten. Defaults to `true`                                                                                                                     |
| `ttl`                 |                     | (optional) A number how long to store the value in milliseconds. If not provided will be stored indefinitely                                                                                                              |
| `storeId`             |                     | (optional) String specifying the store identifier for using different storage solutions side by side.                                                                                                                     |
| `namespace`           |                     | (optional) Namespace for the current instance.                                                                                                                                                                            |
| `issuerOpts`          |                     | Object containing configuration details and options for credential issuance.                                                                                                                                              |
|                       | `didOpts`           | Options related to the Decentralized Identifier (DID) of the issuer.                                                                                                                                                      |
|                       | `userPinRequired`   | (optional) Boolean indicating if a user PIN is required for operations.                                                                                                                                                   |
|                       | `cNonceExpiresIn`   | (optional) Number specifying the expiration time for the client nonce in the issuance process.                                                                                                                            |

#### 4. oid4vp_options

Here, you will store configuration files related to OpenID for Verifiable Presentations (OID4VP).

| Variable           | Sub-Variable          | Description                                                                                             |
|--------------------|-----------------------|---------------------------------------------------------------------------------------------------------|
| `definitionId`     |                       | Unique identifier associated with a specific credential definition.                                     |
| `rpOpts`           |                       | Configuration options for the Relying Party (RP).                                                       |
|                    | `responseMode`        | (optional) Specifies the method that the RP uses to receive the response from the OpenID Provider.      |
|                    | `supportedVersions`   | (optional) Lists the versions supported by the RP.                                                      |
|                    | `sessionManager`      | (optional) An instance of IRPSessionManager from Sphereon's SIOP-OID4VP library managing session state. |
|                    | `expiresIn`           | (optional) Defines the duration after which the RP's request or session should expire.                  |
|                    | `eventEmitter`        | (optional) An object used to handle events, enabling asynchronous event-driven programming.             |
|                    | `didOpts`             | Options related to the Decentralized Identifier (DID) of the verifier.                                  |

#### 5. presentation_definitions

The content of this directory is essential for defining how the agent understands and processes presentation requests. This is only applied if your demo application is asking the user for their VerifiableCredential(s) from the wallet. For an in-depth explanation of presentation_definition, refer to the [Presentation Exchange Documentation](https://identity.foundation/presentation-exchange/). To understand its role in the context of the [OID4VP specification](https://openid.net/specs/openid-4-verifiable-presentations-1_0.html), please consult the provided link.

#### 6. templates

This directory features templates designed to dynamically create Verifiable Credentials. We use [Handlebars](https://handlebarsjs.com/) to fill the templates with data received from the demo application. Ensure that your [form configuration](./vci-front-end.md#form-configuration)/ requested VerifiableCredential (in above section) provides the necessary data for this process. Examples within this directory illustrate how to implement this approach. Below is one such example:
```handlebars
   {
       "@context": ["https://www.w3.org/2018/credentials/v1"],
       "type": ["VerifiableCredential", "GuestCredential"],
       "expirationDate": "{{{ dateTimeAfterDays 7 }}}",
       "credentialSubject": {
           "firstName": "{{firstName}}",
           "lastName": "{{lastName}}",
           "email": "{{email}}",
           "type": "Sphereon Guest"
       }
   }
   ```

Each directory plays a critical role in the configuration of the agent and the successful deployment of the verifiable credential issuance ecosystem within your application. It is essential to carefully craft the contents of these directories in alignment with your specific use cases and the standards of the decentralized identity space.

### .env variables

Your `.env.local` file should contain the following variables with values tailored to your setup:

| Variable                         | Description                                                                                                              |
|----------------------------------|--------------------------------------------------------------------------------------------------------------------------|
| `NODE_ENV`                       | Defines the running environment of the application, typically `development`, `production`, or `local`.                   |
| `HOSTNAME`                       | Specifies the hostname or IP address for the application, used mainly for constructing callback URLs and server binding. |
| `PORT`                           | Determines the port on which the application will listen for incoming requests.                                          |
| `COOKIE_SIGNING_KEY`             | Secret key for signing cookies, ensuring session security.                                                               |
| `DB_CONNECTION_NAME`             | Identifies the database connection within multi-database setups.                                                         |
| `DB_SQLITE_FILE`                 | Path to the SQLite database file if using SQLite.                                                                        |
| `DB_ENCRYPTION_KEY`              | Key for encrypting database contents.                                                                                    |
| `OID4VP_ENABLED`                 | Boolean value for enabling OpenID for Verifiable Presentations (OID4VP).                                                 |
| `OID4VP_WEBAPP_BASE_URI`         | Base URI for the web application managing OID4VP.                                                                        |
| `OID4VP_AGENT_BASE_URI`          | Base URI for the agent’s API endpoints handling OID4VP.                                                                  |
| `AUTH_REQUEST_EXPIRES_AFTER_SEC` | Time in seconds before an authentication request expires.                                                                |
| `OID4VCI_ENABLED`                | Boolean to activate OpenID for Verifiable Credentials Issuance (OID4VCI).                                                |
| `CONF_PATH`                      | Path to the agent’s configuration files, detailed above.                                                                 |
| `UNIVERSAL_RESOLVER_RESOLVE_URL` | Endpoint URL for the universal resolver service for resolving DIDs.                                                      |

**Note**: If you intend to access the agent through a mobile device, ensure that you do not use `localhost` or `127.0.0.1`. Instead, use a local IP address that is reachable from your mobile device within the same network.

## Starting the agent

To start your agent:

1. Create the above-mentioned folders at the location specified by `CONF_PATH` in your `.env` file.
2. Populate the folders with your specific configurations, such as credential metadata and presentation definitions.
3. Launch your agent using either `start:dev` for development or `start:prod` for production environments.
