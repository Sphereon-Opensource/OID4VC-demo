import {
    createAgent,
    IAgentContext,
    IAgentPlugin,
    ICredentialIssuer,
    ICredentialVerifier,
    IDataStore,
    IDataStoreORM,
    IDIDManager,
    IKeyManager,
    IResolver,
    TAgent
} from '@veramo/core'
import {
    CredentialHandlerLDLocal,
    LdDefaultContexts,
    MethodNames,
    SphereonEd25519Signature2018,
    SphereonEd25519Signature2020,
    SphereonJsonWebSignature2020,
} from '@sphereon/ssi-sdk.vc-handler-ld-local'
import {CredentialPlugin} from '@veramo/credential-w3c'
import {DataStore, DataStoreORM, DIDStore, KeyStore, PrivateKeyStore} from '@veramo/data-store'
import {DIDManager} from '@veramo/did-manager'
import {DIDResolverPlugin} from '@veramo/did-resolver'
import {SphereonKeyManager} from '@sphereon/ssi-sdk-ext.key-manager'
import {SecretBox} from '@veramo/kms-local'
import {SphereonKeyManagementSystem} from '@sphereon/ssi-sdk-ext.kms-local'
import {getDbConnection} from './database'
import {ISIOPv2RP} from '@sphereon/ssi-sdk.siopv2-oid4vp-rp-auth'
import {IPresentationExchange, PresentationExchange} from '@sphereon/ssi-sdk.presentation-exchange'
import {ISIOPv2RPRestAPIOpts, SIOPv2RPApiServer} from "@sphereon/ssi-sdk.siopv2-oid4vp-rp-rest-api";
import {PDStore} from '@sphereon/ssi-sdk.data-store'
import {
    createDidProviders,
    createDidResolver,
    createOID4VPRP,
    getDefaultDID,
    getDefaultKid,
    getDefaultOID4VPRPOptions,
    getIdentifier,
    getOrCreateDIDs,
} from "./utils";
import {
    DB_CONNECTION_NAME,
    DB_ENCRYPTION_KEY,
    DID_PREFIX,
    DIDMethods,
    INTERNAL_HOSTNAME_OR_IP,
    INTERNAL_PORT,
    IS_OID4VCI_ENABLED,
    IS_OID4VP_ENABLED,
    oid4vciInstanceOpts, OID4VP_DEFINITIONS, syncDefinitionsOpts
} from "./environment";
import {IOID4VCIStore, OID4VCIStore} from "@sphereon/ssi-sdk.oid4vci-issuer-store";
import {IOID4VCIIssuer} from "@sphereon/ssi-sdk.oid4vci-issuer";
import {
    addDefaultsToOpts,
    createOID4VCIIssuer,
    createOID4VCIStore,
    getDefaultOID4VCIIssuerOptions,
    issuerPersistToInstanceOpts,
    toImportIssuerOptions
} from "./utils/oid4vci";
import {OID4VCIRestAPI} from "@sphereon/ssi-sdk.oid4vci-issuer-rest-api";
import {getCredentialDataSupplier} from "./utils/oid4vciCredentialSuppliers";
import {ExpressBuilder, ExpressCorsConfigurer, StaticBearerAuth} from "@sphereon/ssi-express-support";
import {RemoteServerApiServer} from "@sphereon/ssi-sdk.remote-server-rest-api";
import {IPDManager, PDManager, pdManagerMethods} from '@sphereon/ssi-sdk.pd-manager'
import {IPresentationDefinition} from "@sphereon/pex";

const resolver = createDidResolver()
const dbConnection = getDbConnection(DB_CONNECTION_NAME)
const privateKeyStore: PrivateKeyStore = new PrivateKeyStore(dbConnection, new SecretBox(DB_ENCRYPTION_KEY))
type TAgentTypes = ISIOPv2RP &
    IPresentationExchange &
    IOID4VCIStore &
    IOID4VCIIssuer &
    IDIDManager &
    IResolver &
    IKeyManager &
    IDataStore &
    IDataStoreORM &
    ICredentialVerifier &
    ICredentialIssuer &
    IPDManager


const pdStore = new PDStore(dbConnection);
const plugins: IAgentPlugin[] = [
    new DataStore(dbConnection),
    new DataStoreORM(dbConnection),
    new SphereonKeyManager({
        store: new KeyStore(dbConnection),
        kms: {
            local: new SphereonKeyManagementSystem(privateKeyStore),
        },
    }),
    new DIDManager({
        store: new DIDStore(dbConnection),
        defaultProvider: `${DID_PREFIX}:${DIDMethods.DID_JWK}`,
        providers: createDidProviders(),
    }),
    new DIDResolverPlugin({
        resolver,
    }),
    new PresentationExchange({pdStore}),
    new CredentialPlugin(),
    new CredentialHandlerLDLocal({
        contextMaps: [LdDefaultContexts],
        suites: [
            new SphereonEd25519Signature2018(),
            new SphereonEd25519Signature2020(),
//            new SphereonBbsBlsSignature2020(),
            new SphereonJsonWebSignature2020(),
        ],
        bindingOverrides: new Map([
            ['createVerifiableCredentialLD', MethodNames.createVerifiableCredentialLDLocal],
            ['createVerifiablePresentationLD', MethodNames.createVerifiablePresentationLDLocal],
        ]),
        keyStore: privateKeyStore,
    }),
    new PDManager({store: pdStore})
]
const oid4vpRP = IS_OID4VP_ENABLED ? await createOID4VPRP({resolver, pdStore}) : undefined;
if (oid4vpRP) {
    plugins.push(oid4vpRP)
}


const oid4vciStore: OID4VCIStore | undefined = IS_OID4VCI_ENABLED ? await createOID4VCIStore() : undefined
if (oid4vciStore) {
    plugins.push(oid4vciStore)

    const oid4vciIssuer = await createOID4VCIIssuer({resolver});
    if (oid4vciIssuer) {
        plugins.push(oid4vciIssuer)
    }
}

const agent = createAgent<TAgentTypes>({
    plugins
}) as TAgent<TAgentTypes>
export default agent

export const context: IAgentContext<TAgentTypes> = {agent}
await getOrCreateDIDs().catch(e => console.log(e))

const defaultDID = await getDefaultDID()
console.log(`[DID] default DID: ${defaultDID}`)
const defaultKid = await getDefaultKid({did: defaultDID})
console.log(`[DID] default key identifier: ${defaultKid}`)
if (!defaultDID || !defaultKid || !(await getIdentifier(defaultDID))) {
    console.log('TODO create identifier and write config')
    // create Identifier
}
const oid4vpOpts = IS_OID4VP_ENABLED ? await getDefaultOID4VPRPOptions({did: defaultDID, resolver}) : undefined
if (oid4vpOpts && oid4vpRP) {
    oid4vpRP.setDefaultOpts(oid4vpOpts, context)
}

StaticBearerAuth.init('bearer-auth').addUser({name: 'demo', id: 'demo', token: 'demo'}).connectPassport()

const expressSupport = IS_OID4VCI_ENABLED || IS_OID4VP_ENABLED ?
    ExpressBuilder.fromServerOpts({
        hostname: INTERNAL_HOSTNAME_OR_IP,
        port: INTERNAL_PORT,
        basePath: process.env.EXTERNAL_HOSTNAME ? new URL(process.env.EXTERNAL_HOSTNAME).toString() : undefined
    })
        .withCorsConfigurer(new ExpressCorsConfigurer({}).allowOrigin('*').allowCredentials(true))
        .withPassportAuth(true)
        .withMorganLogging()
        .build({startListening: false}) : undefined


if (IS_OID4VP_ENABLED) {
    if (!expressSupport) {
        throw Error('Express support needs to be configured when exposing OID4VP')
    }
    const opts: ISIOPv2RPRestAPIOpts = {
        enableFeatures: ['siop', 'rp-status'],
        endpointOpts: {
            basePath: process.env.OID4VP_AGENT_BASE_PATH ?? '',
            globalAuth: {
                authentication: {
                    enabled: false,
                    strategy: 'bearer-auth'
                },
                secureSiopEndpoints: false
            },
            webappCreateAuthRequest: {
                webappBaseURI: process.env.OID4VP_WEBAPP_BASE_URI ?? `http://localhost:${INTERNAL_PORT}`,
                siopBaseURI: process.env.OID4VP_AGENT_BASE_URI ?? `http://localhost:${INTERNAL_PORT}`,
            },
            webappAuthStatus: {
                // webappBaseURI: process.env.OID4VP_WEBAPP_BASE_URI ?? `http://localhost:${INTERNAL_PORT}`,
            },
            webappDeleteAuthRequest: {
                // webappBaseURI: process.env.OID4VP_WEBAPP_BASE_URI ?? `http://localhost:${INTERNAL_PORT}`,
            },
            siopGetAuthRequest: {
                // siopBaseURI: process.env.OID4VP_AGENT_BASE_URI ?? `http://localhost:${INTERNAL_PORT}`,
            },
            siopVerifyAuthResponse: {
                // siopBaseURI: process.env.OID4VP_AGENT_BASE_URI ?? `http://localhost:${INTERNAL_PORT}`,
            }
        }
    }
    new SIOPv2RPApiServer({agent, expressSupport, opts})
    console.log('[OID4VP] SIOPv2 and OID4VP started: ' + process.env.OID4VP_AGENT_BASE_URI ?? `http://localhost:${INTERNAL_PORT}}`)
}

if (IS_OID4VCI_ENABLED) {
    if (!expressSupport) {
        throw Error('Express support needs to be configured when exposing OID4VP')
    }
    if (oid4vciStore) {
        const defaultOpts = await getDefaultOID4VCIIssuerOptions({resolver})
        const importIssuerPersistArgs = toImportIssuerOptions()
        for (const opt of importIssuerPersistArgs) {
            await addDefaultsToOpts(opt.issuerOpts);
        }
        // const importIssuerOpts = await Promise.all(importIssuerPersistArgs.map(async opt => issuerPersistToInstanceOpts(opt)))
        oid4vciStore.defaultOpts = defaultOpts
        oid4vciStore.importIssuerOpts(importIssuerPersistArgs)
    }

    oid4vciInstanceOpts.asArray.map(async opts => issuerPersistToInstanceOpts(opts).then(async instanceOpt => {
                const oid4vciRest = await OID4VCIRestAPI.init({
                        context,
                        expressSupport,
                        issuerInstanceArgs: {
                            ...instanceOpt
                        },
                        /*opts: {
                            // baseUrl: '',
                            endpointOpts: {
                                tokenEndpointOpts: {
                                    accessTokenSignerCallback:
                                }
                            }

                            },*/
                        credentialDataSupplier: getCredentialDataSupplier(instanceOpt.credentialIssuer)
                    }
                )
                console.log(`[OID4VCI] Started at ${expressSupport.hostname}:${expressSupport.port}, with issuer ${oid4vciRest.issuer.issuerMetadata.credential_issuer}`)
            }
        )
    )
}

expressSupport?.start()

if (expressSupport) {
    new RemoteServerApiServer({
        agent,
        expressSupport,
        opts: {
            exposedMethods: [...pdManagerMethods],
            endpointOpts: {
                globalAuth: {
                    authentication: {
                        enabled: false,
                    },
                },
            },
        },
    })
}

// Import presentation definitions from disk.
const definitionsToImport: Array<IPresentationDefinition> = syncDefinitionsOpts.asArray.filter(definition => {
    const {id, name} = definition ?? {};
    if (definition && (OID4VP_DEFINITIONS.length === 0 || OID4VP_DEFINITIONS.includes(id) || (name && OID4VP_DEFINITIONS.includes(name)))) {
        console.log(`[OID4VP] Enabling Presentation Definition with name '${name ?? '<none>'}' and id '${id}'`);
        return true
    }
    return false
})

if (definitionsToImport.length > 0) {
    agent.siopImportDefinitions({
        definitions: definitionsToImport,
        versionControlMode: 'AutoIncrementMajor' // This is the default, but just to indicate here it exists
    })
}
