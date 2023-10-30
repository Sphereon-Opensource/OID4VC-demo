
## Credential Branding in Verifiable Credentials
Credential branding is an essential aspect of Verifiable Credentials (VCs) that helps define how a credential is displayed and identified to end-users. It plays a crucial role in creating a user-friendly and consistent experience for individuals who interact with verifiable credentials. In this explanation, we give you a detailed account of the concept of credential branding as defined in the [Verifiable Credentials Issuance (VCI) spec](https://openid.net/specs/openid-4-verifiable-credential-issuance-1_0.html) specification.

## Definition and Purpose

In the context of VCs, "Credential Branding" refers to the visual and descriptive attributes associated with a credential, including its name, logo, background color, and more. These attributes are defined in the metadata of the credential issuer and are used to present the credential in a consistent and nice way to the credential holder or verifier.

## Metadata Parameters

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

## Branding in real-world
We're using branding in this project. So in order to get familiar with it, you can visit one of our config json files in `packages/agent/conf/examples/oid4vci_metadata`. You can find the branding related information (as the spec suggests in `credentials_supported` field of the metadata)
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
## Implementation

Credential branding is typically specified by credential issuers in their metadata. They define how each credential they issue should be presented, including its name, logo, and visual style. Credential holders and verifiers use this branding information to ensure a consistent and recognizable display of the credential.

In code, credential branding can be accessed and displayed using appropriate methods. For example, following code (in our oid4vci-demo-frontend) shows how to read and display credential branding. The `credentialBranding` object is populated with information extracted from the `credentials_supported` metadata parameter, which includes display properties and other branding-related details.

```typescript
const credentialBranding = new Map<string, Array<IBasicCredentialLocaleBranding>>()

Promise.all(
    (metadata.credentialIssuerMetadata.credentials_supported as CredentialSupported[]).map(async (metadata: CredentialSupported): Promise<void> => {
      const localeBranding: Array<IBasicCredentialLocaleBranding> = await Promise.all(
          (metadata.display ?? []).map(
              async (display: CredentialsSupportedDisplay): Promise<IBasicCredentialLocaleBranding> =>
                  await credentialLocaleBrandingFrom(display)
          ),
      );

      const credentialTypes: Array<string> =
          metadata.types.length > 1
              ? metadata.types.filter((type: string) => type !== 'VerifiableCredential')
              : metadata.types.length === 0
                  ? ['VerifiableCredential']
                  : metadata.types;

      credentialBranding.set(credentialTypes[0], localeBranding);
    })
).then(() => setSupportedCredentials(credentialBranding))
```
