<!--suppress HtmlDeprecatedAttribute -->
<h1 align="center">
  <br>
  <a href="https://www.sphereon.com"><img src="https://sphereon.com/content/themes/sphereon/assets/img/logo.svg" alt="Sphereon" width="400"></a>
  <br>OID4VC demo's credential branding 
  <br>
</h1>

---

**Warning: This project still is in very early development. Breaking changes without notice will happen at this point!**

<h2 id="toc">Table of contents</h2>
1. [Credential Branding in Verifiable Credentials](#branding_in_vcs)
2. [Definition and Purpose](#definition)
3. [Metadata Parameters](#metadata)
4. [Branding in real-world](#branding_real)

<h2 id="branding_in_vcs">Credential Branding in Verifiable Credentials</h2>
Credential branding is an essential aspect of Verifiable Credentials (VCs) that helps define how a credential is displayed and identified to end-users. It plays a crucial role in creating a user-friendly and consistent experience for individuals who interact with verifiable credentials. In this explanation, we give you a detailed account of the concept of credential branding as defined in the [Verifiable Credentials Issuance (VCI) spec](https://openid.net/specs/openid-4-verifiable-credential-issuance-1_0.html) specification.

<h2 id="definition">Definition and Purpose</h2>

In the context of VCs, "Credential Branding" refers to the visual and descriptive attributes associated with a credential, including its name, logo, background color, and more. These attributes are defined in the metadata of the credential issuer and are used to present the credential in a consistent and nice way to the credential holder or verifier.

<h2 id="metadata">Metadata Parameters</h2>

Credential branding is specified using various parameters in the metadata of a credential issuer. Here are some metadata parameters related to credential branding:

- **Display (OPTIONAL):** An array of objects, where each object contains the display properties of the supported credential for a specific language. Display properties include the credential's name, logo, background color, and more. Each language-specific display object helps create a localized credential presentation.

    - **Name (REQUIRED):** A string value representing the display name for the credential.

    - **Locale (OPTIONAL):** A string value that identifies the language of the display object, represented as a language tag (e.g., "en-US" for English). Multiple display objects can be included for different languages.

    - **Logo (OPTIONAL):** A JSON object with information about the logo of the credential. This object may include:
        - **URL (OPTIONAL):** The URL where the wallet or verifier can obtain the credential's logo from the credential issuer.
        - **Alt Text (OPTIONAL):** A string value serving as alternative text for the logo image.

    - **Description (OPTIONAL):** A string value providing a description of the credential.

    - **Background Color (OPTIONAL):** A string value representing the background color of the credential, specified using numerical color values defined in CSS Color Module Level 3.

    - **Text Color (OPTIONAL):** A string value representing the text color of the credential, specified using numerical color values defined in CSS Color Module Level 3.

<h2 id="branding_real">Branding in real-world</h2>

We're using branding in this project. So in order to get familiar with it, you can visit one of our config json files in [packages/agent/conf/examples/oid4vci_metadata](./agent-setup.md#oid4vci_metadata). You can find the branding related information (as the spec suggests in `credentials_supported` field of the metadata)
Here is a real world example of a credential branding:
```json
{
  ...,
  "credentials_supported": [
    {
      "display": [
        {
          "name": "Conference Attendee",
          "description": "The DBC Conference Attendee credential is given to all visitors of the DBC conference.",
          "background_color": "#3B6F6D",
          "text_color": "#FFFFFF",
          "logo": {
            "url": "https://dutchblockchaincoalition.org/assets/images/icons/Logo-DBC.png",
            "alt_text": "An orange block shape, with the text Dutch Blockchain Coalition next to it, portraying the logo of the Dutch Blockchain Coalition."
          },
          "background_image": {
            "url": "https://i.ibb.co/CHqjxrJ/dbc-card-hig-res.png",
            "alt_text": "Connected open cubes in blue with one orange cube as a background of the card"
          }
        }
      ],
      ...
    }
  ],
  ...
}
```

When providing image for branding, be sure that:
1. The image (both `background_image.url` and `logo.url`) are available to every party interacting with the demo.
2. Providing a rectangular image without rounded corners, the library will take care of that.
3. You can have locale-specific branding for your credentials. For this to happen you can add a locale to your display array, with a `locale` key representing your desired locale. Read more in [OID4VCI](https://openid.net/specs/openid-4-verifiable-credential-issuance-1_0.html#section-10.2.3.1-2.5.1)