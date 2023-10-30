## Agent setup
In this document we're going to show you how to setup your agent module.
Agent module uses the config values that are specified in your `.env` file. In Your `.env` file, you have a property `CONF_PATH` based on this value, agent will setup itself. So let's go through them together. If you open your `packages/agent/conf` folder and head to `examples`, you'll see 6 folders:
- dids
- oid4vci_metadata
- oid4vci_options
- oid4vp_options
- presentation_definitions
- templates

#### dids
This folder contains did documents that will be used throughout the vci process.
#### oid4vci_metadata
The json files in this folder contain VCI metadata from [VCI spec](https://openid.net/specs/openid-4-verifiable-credential-issuance-1_0.html), and some other agent specific data:
```ts
{
  correlationId: string
  overwriteExisting: boolean
  metadata: VCIMetadata
}
```
`correlationId` and `overwriteExisting` are used for setting up agent's store. For a more detailed account of VCI inner works in Sphereon libraries, you can visit our underlying library ([SSI-SDK](https://github.com/Sphereon-Opensource/SSI-SDK.git))
#### oid4vp_options
You have to create an oid4vp option of your own. The important bit here is to have a file for this id in your `presentation_definitions`.
#### presentation_definitions
Here you have to have your own `presentation_definition`. For a detailed account of Presentation Definitions and how they work, you can read [DIF Presentation Exchange](https://identity.foundation/presentation-exchange/) this library is using [Sphereon's PEX](https://github.com/Sphereon-Opensource/PEX) as the underlying library for presentation exchange.
### templates
We're using `handlebars` for populating our credentials. You can take a look at our `.hbs` files and see how we're populating these templates as an example:
```hbs
{
    "@context": [
        "https://www.w3.org/2018/credentials/v1"
    ],
    "type": [
        "VerifiableCredential",
        "GuestCredential"
    ],
    "expirationDate": "{{{ dateTimeAfterDays 7 }}}",
    "credentialSubject": {
        "Voornaam": "{{Voornaam}}",
        "Achternaam": "{{Achternaam}}",
        "E-mail": "{{email}}",
        "type": "Sphereon Guest"
    }
}
```

## Setting up your own agent
To setup your own agent, you need to create all the aforementioned folder in your desired path (`CONF_PATH` in your `.env`). Then you need to change the values according to your own desired behaviour (credential metadata, presentation definition, etc). Once you've done all these steps, you can run your agent with `start:dev` or `start:prod` commands.
#### Testing locally
Note that, since you need to access your agent via your phone, you can't use `localhost` or `127.0.0.1`, etc. instead you have to use your local ip address which can be accessible to your phone if you are in the same network.
