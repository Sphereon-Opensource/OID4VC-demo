<!--suppress HtmlDeprecatedAttribute -->
<h1 align="center">
  <br>
  <a href="https://www.sphereon.com"><img src="https://sphereon.com/content/themes/sphereon/assets/img/logo.svg" alt="Sphereon" width="400"></a>
  <br>OID4VC demo's OID4VCI frontend 
  <br>
</h1>

---

## Table of contents

1. [Overview](#overview)
2. [Config](#config)
    1. [.env configuration](#env-configuration)
    2. [Config files](#config-files)
       1. [Form configuration](#form-configuration)
3. [Starting the VCI frontend](#starting-the-vci-frontend)

## Overview

This module creates a UI using react. To create a custom UI, you should add your own configuration to `packages/oid4vci-demo-frontend/src/configs` folder. You can take a look at our other existing configurations before doing so, or if you want a more in-depth understanding about all the values inside these config files, you might want to take a look at the interfaces behind this [configuration](packages/oid4vci-demo-frontend/src/ecosystem/ecosystem-config.ts). In this document we're going to examine each configuration file and show you how to setup your own demo.

## Config
### .env configuration

In this module we're using a few configuration from .env which are listed below:
- `PORT`: The port number that you want this frontend to be accessed from.
- `REACT_APP_DEFAULT_ECOSYSTEM`: (optional) The default ecosystem name of this demo. This should be your own configuration file name. You can also switch you ecosystem in the runtime with using `ecosystemId` query param in your url. For example you can head to `http://localhost:5001/?ecosystemId=sphereon#/credentials/issue/success` to see Sphereon's configured version of SSICredentialIssuedSuccessPage page.
- `REACT_APP_DEFAULT_ECOSYSTEM_FROM_SUBDOMAIN`: (optional) If set to true, the frontend will try to find ecosystem value from subdomain
- `REACT_APP_DEFAULT_ECOSYSTEM_FROM_SUBDOMAIN_SUFFIX`: This optional environment variable enhances the functionality of multi-tenancy or environment-specific configurations in a web application. When `REACT_APP_DEFAULT_ECOSYSTEM_FROM_SUBDOMAIN` is set to `true`, this variable instructs the application to dynamically extract and set the ecosystem value from a specified segment of the application's URL.
  The purpose of this variable is to parse the URL and use a portion of the subdomain as the ecosystem identifier, which can then be used to configure or customize the application's behavior based on that ecosystem. This is particularly useful for applications that serve multiple ecosystems or tenants from a single codebase but require tenant-specific configurations.
  Here's how it works:
    - If the application's URL is `http://simple.demo.sphereon.com/`, and
    - The `REACT_APP_DEFAULT_ECOSYSTEM_FROM_SUBDOMAIN_SUFFIX` is set to `demo.sphereon.com`,
  Then the application will extract the subdomain segment that precedes the `demo.sphereon.com` part of the URL, which in this case is `simple`. This extracted value is then designated as the ecosystem identifier.
  The ecosystem identifier (`simple` in the example) can be used to load specific configurations, assets, or even to dictate the application's behavior for that particular ecosystem. This enables a flexible and scalable approach to managing configurations in a multi-ecosystem platform.
 
  Beware that this is the order of received ecocystem values:
    1. value received from query param
    2. value received from subdomain
    3. value received from `REACT_APP_DEFAULT_ECOSYSTEM`
    4. if all the above failed, defaults to `sphereon` config. 

### Config files

For configuring your VCI front end you have to create your own file in `packages/oid4vci-demo-frontend/src/configs`. Each of these config files that you're creating should follow a certain structure.

| Variable  | Sub-Variable          | Description                                                                                                                                                                                                                                                                                                                                                  |
|-----------|-----------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `general` |                       | This section includes global settings that apply across various aspects of the application.                                                                                                                                                                                                                                                                  |
|           | `credentialName`      | The name of the credential being issued or presented; typically a human-readable string.                                                                                                                                                                                                                                                                     |
|           | `issueCredentialType` | Specifies the type of credential being issued; this value will be used to query the agent of a certain type of credential; so, it's important to have this type in your [agent's vci metadata configuration](./agent-setup.md#2-oid4vci_metadata)                                                                                                              |
|           | `oid4vpAgentBaseUrl`  | The base URL of the OID4VP agent; this is the endpoint used to interact with the agent responsible for handling SIOP/OID4VP functionalities.                                                                                                                                                                                                                 |
|           | `oid4vciAgentBaseUrl` | The base URL of the OID4VCI agent; this is the endpoint for interactions with the agent in charge of verifiable credential issuance.                                                                                                                                                                                                                         |
|           | `verifierUrl`         | The URL where the credential verifier is available on.                                                                                                                                                                                                                                                                                                       |
|           | `verifierUrlCaption`  | A descriptive label or caption that accompanies the verifier URL, this is used for display purposes on multiple pages in this demo.                                                                                                                                                                                                                          |
|           | `downloadUrl`         | The URL from which a oid4vci/oid4vp+siop compatible wallet or your own preferred resource can be reached/downloaded.                                                                                                                                                                                                                                         |
| `pages`   |                       | This object defines the configuration for individual pages within the application, allowing customization for specific workflows or user interactions. Pages can be combined to tailor the demo experience.                                                                                                                                                  |
| `routes`  |                       | This object contains a collection of routes within the application, where each route is a sequence of steps leading the user through a process or workflow. Routes are how different pages are interconnected.                                                                                                                                               |
|           | `id`                  | (optional) A unique identifier for a particular route; if omitted, the default route will be used. It is utilized mainly for internal routing logic.                                                                                                                                                                                                         |
|           | `vpDefinitionId`      | (optional) A specific identifier that fetches the corresponding `presentation_definition` from the [agent](./agent-setup.md#5-presentation_definitions), dictating how presentations are processed and verified.                                                                                                                                                                       |
|           | `steps`               | This array defines a series of sequential steps for a route. Each step contains an `id` that matches a page configuration, an `operation` that dictates the action (such as "navigate" or "execute"), and optionally, `nextId` to indicate the subsequent step. The `isDefaultRoute` boolean flag sets the default pathway when the application initializes. |

here are a few important note on these configurations:
- We're supporting a wide range of options that are not necessarily used in all of our config samples. If you have a special case, be sure to read the interfaces behind the config.
- It's necessary to populate the form in `infoRequest` page.
- You can modify your flow to choose what suits your purpose. this can be achieved with modifying the `routes` property in your config json.
- If your config contains new images, be sure to copy them in the public folder of this module

### Form configuration

Here is a more in-depth look at the form configuration. A form is a list of lists. This is done to enable you to have multiple entries in a line.
Each input entry can be defined with the following interface:
```ts
export interface DataFormElement {
    id: string
    key: string
    type: HTMLInputTypeAttribute
    required?: boolean
    readonlyWhenAbsentInPayload?: boolean
    defaultValue?: FormFieldValue
    label?: string
    labelUrl?: string
    readonly?: boolean
    customValidation?: string
    display?: {
        checkboxBorderColor?: string
        checkboxLabelColor?: string
        checkboxSelectedColor?: string
    }
}
```

This form will be (partially) filled in with the vp_token that the agent receives from your wallet. Here is an explainer about some of the most important part of this interface:
- `id`:
  In order to make it known which field is related to which entry in `credentialSubject` we look at `id` of the field.
- `type`:
  For now a form entry, supports three types: `checkbox`, `text` and `date`.
- `customValidation`:
  If you want to have a custom validation on your input, you can provide a **regex** to `customValidation` field.
- `label`:
  You can set the label of your field. This is a translation key for the form. You can view them in `packages/oid4vci-demo-frontend/public/locales`
- `readonly`:
  If you wish that this input element be readonly you can assign true to this property
- `required`:
  If you wish make this a necessary field, you can assign true to this property. In case of empty value for this form element, The button at the end of the form will stay disable.
- `readonlyWhenAbsentInPayload`:
  If this element is only required if you're receiving it in your vp_token and otherwise should stay empty, you can assign true to this property.

####_**IMPORTANT NOTE**_
As mentioned we're partially filling in the form data from received vp_token. Make sure that you are configuring your form based on the value that is present in your `credentialSubject`. Only values that exist in your form (`id` property of a `DataFormElement`) will show up.
Here is an example of a `credentialSubject` that can be used for populating this form:

```json
{
...,
    "credentialSubject": {
      "firstName": "John",
      "lastName": "Smith",
      "emailAddress": "john.smith@email-provider.com",
      "id": "did:jwk:eyJhbGciOiJFUzI1NksiLCJ1c2UiOiJzaWciLCJrdHkiOiJFQyIsImNydiI6InNlY3AyNTZrMSIsIngiOiI3S2hEbmRTZEtGVGlzTy1BNXhwWno1SkVvYkJ2NVdELTAxWmVUbVJ0ZmdvIiwieSI6IjVFR3kyZlZPX1JKZzdsdjUwUDRuRjJ0ZklqakhsNERWOGtDQm1kdHZaQ0UifQ"
    }
  },
...
}
```

### Starting the VCI frontend

Once you've managed to create your own configuration file, you can start you have to alter the value of `REACT_APP_DEFAULT_ECOSYSTEM` in your `.env.local` file. After this, you can start this module using `start:prod` or `start:dev` scripts.
