import {createAgent, IAgent, IDIDManager, RemoveContext, TAgent} from '@veramo/core'
import {getUniResolver} from '@sphereon/did-uni-client'
import {
    CredentialHandlerLDLocal,
    LdDefaultContexts,
    MethodNames,
    SphereonBbsBlsSignature2020,
    SphereonEd25519Signature2018,
    SphereonEd25519Signature2020,
    SphereonJsonWebSignature2020,
} from '@sphereon/ssi-sdk.vc-handler-ld-local'
import {CredentialPlugin} from '@veramo/credential-w3c'
import {DataStore, DataStoreORM, DIDStore, KeyStore, PrivateKeyStore} from '@veramo/data-store'
import {DIDManager} from '@veramo/did-manager'
import {EthrDIDProvider} from '@veramo/did-provider-ethr'
import {getDidIonResolver, IonDIDProvider} from '@veramo/did-provider-ion'
import {getDidKeyResolver, KeyDIDProvider} from '@veramo/did-provider-key'
import {WebDIDProvider} from '@veramo/did-provider-web'
import {DIDResolverPlugin} from '@veramo/did-resolver'
import {KeyManager} from '@veramo/key-manager'
import {KeyManagementSystem, SecretBox} from '@veramo/kms-local'
import {Resolver} from 'did-resolver'
import {DB_CONNECTION_NAME, DB_ENCRYPTION_KEY, getDbConnection} from './database'
import {ISIOPv2RP, SIOPv2RP} from '@sphereon/ssi-sdk.siopv2-oid4vp-rp-auth'
import {IPresentationExchange, PresentationExchange} from '@sphereon/ssi-sdk.presentation-exchange'
import {
    dbcConferenceAttendeeDef,
    entraAndSphereonCompatibleDef,
    entraVerifiedIdPresentation, fmaGuestDef
} from './presentationDefinitions'
import {ISIOPv2RPRestAPIOpts, SIOPv2RPRestAPI} from "@sphereon/ssi-sdk.siopv2-oid4vp-rp-rest-api";

import {getResolver as getDidWebResolver} from 'web-did-resolver'

import * as dotenv from "dotenv-flow";
import {CheckLinkedDomain} from '@sphereon/ssi-sdk.siopv2-oid4vp-common'
import {JwkDIDProvider} from "@sphereon/ssi-sdk-ext.did-provider-jwk";
import {toJwk} from "@sphereon/ssi-sdk-ext.key-utils";

dotenv.config()
export const DIF_UNIRESOLVER_RESOLVE_URL = 'https://dev.uniresolver.io/1.0/identifiers'
export const DID_PREFIX = 'did'

export enum KeyManagementSystemEnum {
    LOCAL = 'local',
}

export enum SupportedDidMethodEnum {
    DID_ETHR = 'ethr',
    DID_KEY = 'key',
    // DID_LTO = 'lto',
    DID_ION = 'ion',
    // DID_FACTOM = 'factom',
    DID_JWK = 'jwk',
    DID_WEB = 'web'
}

const HOSTNAME = 'dbc2023.test.sphereon.com'
const RP_DID_WEB = `did:web:${HOSTNAME}`
const RP_DID_WEB_KID = `${RP_DID_WEB}#auth-key`

const RP_PRIVATE_KEY_HEX = '851eb04ca3e2b2589d6f6a7287565816ee8e3126599bfeede8d3e93c53fb26e3'
const RP_DID_ION =
    'did:ion:EiAeobpQwEVpR-Ib9toYwbISQZZGIBck6zIUm0ZDmm9v0g:eyJkZWx0YSI6eyJwYXRjaGVzIjpbeyJhY3Rpb24iOiJyZXBsYWNlIiwiZG9jdW1lbnQiOnsicHVibGljS2V5cyI6W3siaWQiOiJhdXRoLWtleSIsInB1YmxpY0tleUp3ayI6eyJjcnYiOiJzZWNwMjU2azEiLCJrdHkiOiJFQyIsIngiOiJmUUE3WUpNRk1qNXFET0RrS25qR1ZLNW0za1VSRFc1YnJ1TWhUa1NYSGQwIiwieSI6IlI3cVBNNEsxWHlqNkprM3M2a3I2aFNrQzlDa0ExSEFpMVFTejZqSU56dFkifSwicHVycG9zZXMiOlsiYXV0aGVudGljYXRpb24iLCJhc3NlcnRpb25NZXRob2QiXSwidHlwZSI6IkVjZHNhU2VjcDI1NmsxVmVyaWZpY2F0aW9uS2V5MjAxOSJ9XX19XSwidXBkYXRlQ29tbWl0bWVudCI6IkVpQnpwN1loTjltaFVjWnNGZHhuZi1sd2tSVS1oVmJCdFpXc1ZvSkhWNmprd0EifSwic3VmZml4RGF0YSI6eyJkZWx0YUhhc2giOiJFaUJvbWxvZ0JPOERROFdpVVFsa3diYmxuMXpsRFU2Q3Jvc01wNDRySjYzWHhBIiwicmVjb3ZlcnlDb21taXRtZW50IjoiRWlEQVFYU2k3SGNqSlZCWUFLZE8yenJNNEhmeWJtQkJDV3NsNlBRUEpfamtsQSJ9fQ'
const PRIVATE_RECOVERY_KEY_HEX = '7c90c0575643d09a370c35021c91e9d8af2c968c5f3a4bf73802693511a55b9f'
const PRIVATE_UPDATE_KEY_HEX = '7288a92f6219c873446abd1f8d26fcbbe1caa5274b47f6f086ef3e7e75dcad8b'
const RP_DID_ION_KID = `${RP_DID_ION}#auth-key`



export const resolver = new Resolver({
    ...getUniResolver('ethr', {
        resolveUrl: DIF_UNIRESOLVER_RESOLVE_URL,
    }),
    ...getDidKeyResolver(),
    // ...getDidJwkResolver(),
    ...getUniResolver('jwk', {
        resolveUrl: DIF_UNIRESOLVER_RESOLVE_URL,
    }),
    ...getDidIonResolver(),
    ...getDidWebResolver()
})

export const didProviders = {
    [`${DID_PREFIX}:${SupportedDidMethodEnum.DID_ETHR}`]: new EthrDIDProvider({
        defaultKms: KeyManagementSystemEnum.LOCAL,
        network: 'ropsten',
    }),
    [`${DID_PREFIX}:${SupportedDidMethodEnum.DID_KEY}`]: new KeyDIDProvider({
        defaultKms: KeyManagementSystemEnum.LOCAL,
    }),
    [`${DID_PREFIX}:${SupportedDidMethodEnum.DID_ION}`]: new IonDIDProvider({
        defaultKms: KeyManagementSystemEnum.LOCAL,
    }),
    [`${DID_PREFIX}:${SupportedDidMethodEnum.DID_WEB}`]: new WebDIDProvider({
        defaultKms: KeyManagementSystemEnum.LOCAL,
    }),
    [`${DID_PREFIX}:${SupportedDidMethodEnum.DID_JWK}`]: new JwkDIDProvider({
        defaultKms: KeyManagementSystemEnum.LOCAL
    })
}

const dbConnection = getDbConnection(DB_CONNECTION_NAME)
const privateKeyStore: PrivateKeyStore = new PrivateKeyStore(dbConnection, new SecretBox(DB_ENCRYPTION_KEY))


const agent = createAgent<ISIOPv2RP & IPresentationExchange & IDIDManager>({
    plugins: [
        new DataStore(dbConnection),
        new DataStoreORM(dbConnection),
        new KeyManager({
            store: new KeyStore(dbConnection),
            kms: {
                local: new KeyManagementSystem(privateKeyStore),
            },
        }),
        new DIDManager({
            store: new DIDStore(dbConnection),
            defaultProvider: `${DID_PREFIX}:${SupportedDidMethodEnum.DID_JWK}`,
            providers: didProviders,
        }),
        new DIDResolverPlugin({
            resolver,
        }),
        new PresentationExchange(),
        new SIOPv2RP({
            defaultOpts: {
                didOpts: {
                    checkLinkedDomains: CheckLinkedDomain.IF_PRESENT,
                    identifierOpts: {
                        identifier: RP_DID_WEB,
                        kid: RP_DID_WEB_KID,
                    },
                },
            },
            instanceOpts: [
                {
                    definitionId: 'dbc',
                    definition: dbcConferenceAttendeeDef,
                    rpOpts: {
                        didOpts: {
                            checkLinkedDomains: CheckLinkedDomain.IF_PRESENT,
                            identifierOpts: {
                                identifier: RP_DID_WEB,
                                kid: RP_DID_WEB_KID,
                            },
                        },
                    }
                },
                {
                    definitionId: dbcConferenceAttendeeDef.id,
                    definition: dbcConferenceAttendeeDef,
                    rpOpts: {
                        didOpts: {
                            checkLinkedDomains: CheckLinkedDomain.IF_PRESENT,
                            identifierOpts: {
                                identifier: RP_DID_WEB,
                                kid: RP_DID_WEB_KID,
                            },
                        },
                    }
                },
                {
                    definitionId: 'fma',
                    definition: fmaGuestDef,
                    rpOpts: {
                        didOpts: {
                            checkLinkedDomains: CheckLinkedDomain.IF_PRESENT,
                            identifierOpts: {
                                identifier: RP_DID_WEB,
                                kid: RP_DID_WEB_KID,
                            },
                        },
                    }
                },
                {
                    definitionId: fmaGuestDef.id,
                    definition: fmaGuestDef,
                    rpOpts: {
                        didOpts: {
                            checkLinkedDomains: CheckLinkedDomain.IF_PRESENT,
                            identifierOpts: {
                                identifier: RP_DID_WEB,
                                kid: RP_DID_WEB_KID,
                            },
                        },
                    }
                },
                {
                    definitionId: entraAndSphereonCompatibleDef.id,
                    definition: entraAndSphereonCompatibleDef,
                },
                {
                    definitionId: 'sphereon',
                    definition: entraAndSphereonCompatibleDef,
                },
                {
                    definitionId: entraVerifiedIdPresentation.id,
                    definition: entraVerifiedIdPresentation,
                },
                {
                    definitionId: 'entra',
                    definition: entraVerifiedIdPresentation,
                },
            ],
        }),
        new CredentialPlugin(),
        new CredentialHandlerLDLocal({
            contextMaps: [LdDefaultContexts],
            suites: [
                new SphereonEd25519Signature2018(),
                new SphereonEd25519Signature2020(),
                new SphereonBbsBlsSignature2020(),
                new SphereonJsonWebSignature2020(),
            ],
            bindingOverrides: new Map([
                ['createVerifiableCredentialLD', MethodNames.createVerifiableCredentialLDLocal],
                ['createVerifiablePresentationLD', MethodNames.createVerifiablePresentationLDLocal],
            ]),
            keyStore: privateKeyStore,
        }),
    ],
}) as TAgent<ISIOPv2RP & IPresentationExchange & IDIDManager>

agent.didManagerGet({did: RP_DID_WEB}).then(id => {
    console.log(`==DID WEB existed:  \r\n${JSON.stringify(id, null, 2)}\r\nJWK:\r\n${JSON.stringify(toJwk(id.keys[0].publicKeyHex, 'Ed25519'), null, 2)}`)
}).catch(error => {
    agent.didManagerCreate({
            provider: 'did:web',
            alias: HOSTNAME,
            kms: KeyManagementSystemEnum.LOCAL,
            options: {
                keyType: 'Ed25519'
            }
        }
    ).then(id => console.log(`==DID WEB created: \r\n${JSON.stringify(id, null, 2)}\r\nJWK:\r\n${JSON.stringify(toJwk(id.keys[0].publicKeyHex, 'Ed25519'), null, 2)}`)).catch(error => console.log(`==DID WEB ERROR: ${error}`))
})

agent
    .didManagerCreate({
        provider: 'did:ion',
        alias: RP_DID_ION,
        options: {
            kid: 'auth-key',
            anchor: false,
            recoveryKey: {
                kid: 'recovery-test2',
                key: {
                    privateKeyHex: PRIVATE_RECOVERY_KEY_HEX,
                },
            },
            updateKey: {
                kid: 'update-test2',
                key: {
                    privateKeyHex: PRIVATE_UPDATE_KEY_HEX,
                },
            },
            verificationMethods: [
                {
                    key: {
                        kid: 'auth-key',
                        privateKeyHex: RP_PRIVATE_KEY_HEX,
                    },
                    purposes: ['authentication', 'assertionMethod'],
                },
            ],
        },
    })
    .then((value) => {
        console.log(`DID imported: ${value.did}`)
    })
    .catch((reason) => {
        console.log(`${reason}`)
    })
export default agent


const port = process.env.PORT ? Number.parseInt(process.env.PORT) : 5000

const opts: ISIOPv2RPRestAPIOpts = {
    hostname: process.env.HOSTNAME ?? '0.0.0.0',
    port,
    webappBaseURI: process.env.BACKEND_BASE_URI ?? `http://localhost:${port}`,
    siopBaseURI: process.env.SIOP_BASE_URI ?? `http://localhost:${port}`,
}

new SIOPv2RPRestAPI({agent, opts})
