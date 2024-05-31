import {
    CredentialConfigurationSupported,
    CredentialsSupportedDisplay,
    EndpointMetadataResult
} from '@sphereon/oid4vci-common'
import {IBasicCredentialLocaleBranding} from '@sphereon/ssi-sdk.data-store'

export const credentialLocaleBrandingFrom = async (credentialDisplay: CredentialsSupportedDisplay): Promise<IBasicCredentialLocaleBranding> => {
    console.log(JSON.stringify(credentialDisplay, null, 2))
    return {
        ...(credentialDisplay.name && {
            alias: credentialDisplay.name,
        }),
        ...(credentialDisplay.locale && {
            locale: credentialDisplay.locale,
        }),
        ...(credentialDisplay.logo && {
            logo: {
                ...(credentialDisplay.logo.url && {
                    uri: credentialDisplay.logo?.url,
                }),
                ...(credentialDisplay.logo.alt_text && {
                    alt: credentialDisplay.logo?.alt_text,
                }),
            },
        }),
        ...(credentialDisplay.description && {
            description: credentialDisplay.description,
        }),

        ...(credentialDisplay.text_color && {
            text: {
                color: credentialDisplay.text_color,
            },
        }),
        ...((credentialDisplay.background_image || credentialDisplay.background_color) && {
            background: {
                ...(typeof credentialDisplay.background_image === 'object' && credentialDisplay.background_image && {
                    image: {
                        ...(credentialDisplay.background_image.url && {
                            uri: credentialDisplay.background_image?.url,
                        }),
                        ...(credentialDisplay.background_image.alt_text && {
                            alt: credentialDisplay.background_image?.alt_text,
                        }),
                    },
                }),
                color: credentialDisplay.background_color,
            },
        }),
    };
}

export const getCredentialBrandings = async (metadata: EndpointMetadataResult): Promise<Map<string, Array<IBasicCredentialLocaleBranding>>> => {
    const credentialBranding = new Map<string, Array<IBasicCredentialLocaleBranding>>()

    Promise.all(
        (Object.values(metadata.credentialIssuerMetadata!.credential_configurations_supported as Record<string, CredentialConfigurationSupported>))
            .map(async (credentialsConfigSupported: CredentialConfigurationSupported): Promise<void> => {
                const localeBranding: Array<IBasicCredentialLocaleBranding> = await Promise.all(
                    (credentialsConfigSupported.display ?? []).map(
                        async (display: CredentialsSupportedDisplay): Promise<IBasicCredentialLocaleBranding> =>
                            await credentialLocaleBrandingFrom(display)
                    ),
                );

                const types = 'types' in credentialsConfigSupported // TODO CWALL-239 credentialsConfigSupported.types is deprecated
                    ? credentialsConfigSupported.types as string[]
                    : 'credential_definition' in credentialsConfigSupported
                        ? credentialsConfigSupported.credential_definition.type
                        : undefined

                if (types) {
                    const credentialTypes: Array<string> =
                        types.length > 1
                            ? types.filter((type: string) => type !== 'VerifiableCredential')
                            : types.length === 0
                                ? ['VerifiableCredential']
                                : types

                    credentialBranding.set(credentialTypes[0], localeBranding)
                }
            }))

    return credentialBranding
}
