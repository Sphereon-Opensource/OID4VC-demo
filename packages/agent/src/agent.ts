import {createAgent, IAgentContext, IDIDManager, IResolver, TAgent} from '@veramo/core'
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
import {DIDResolverPlugin} from '@veramo/did-resolver'
import {KeyManager} from '@veramo/key-manager'
import {KeyManagementSystem, SecretBox} from '@veramo/kms-local'
import {getDbConnection} from './database'
import {ISIOPv2RP} from '@sphereon/ssi-sdk.siopv2-oid4vp-rp-auth'
import {IPresentationExchange, PresentationExchange} from '@sphereon/ssi-sdk.presentation-exchange'
import {ISIOPv2RPRestAPIOpts, SIOPv2RPRestAPI} from "@sphereon/ssi-sdk.siopv2-oid4vp-rp-rest-api";
import {
    createDidProviders,
    createDidResolver,
    createOID4VPRP,
    getDefaultDID,
    getDefaultKid, getDefaultOID4VPRPOptions,
    getIdentifier,
    getOrCreateDIDs,
} from "./utils";
import {
    DB_CONNECTION_NAME, DB_ENCRYPTION_KEY,
    DID_PREFIX,
    DIDMethods,
    INTERNAL_HOSTNAME_OR_IP,
    INTERNAL_PORT,
    IS_OID4VP_ENABLED
} from "./index";


/*const RP_DID_WEB = `did:web:${EXTERNAL_HOSTNAME}`
const RP_DID_WEB_KID = `${RP_DID_WEB}#auth-key`

const RP_PRIVATE_KEY_HEX = '851eb04ca3e2b2589d6f6a7287565816ee8e3126599bfeede8d3e93c53fb26e3'
const RP_DID_ION =
    'did:ion:EiAeobpQwEVpR-Ib9toYwbISQZZGIBck6zIUm0ZDmm9v0g:eyJkZWx0YSI6eyJwYXRjaGVzIjpbeyJhY3Rpb24iOiJyZXBsYWNlIiwiZG9jdW1lbnQiOnsicHVibGljS2V5cyI6W3siaWQiOiJhdXRoLWtleSIsInB1YmxpY0tleUp3ayI6eyJjcnYiOiJzZWNwMjU2azEiLCJrdHkiOiJFQyIsIngiOiJmUUE3WUpNRk1qNXFET0RrS25qR1ZLNW0za1VSRFc1YnJ1TWhUa1NYSGQwIiwieSI6IlI3cVBNNEsxWHlqNkprM3M2a3I2aFNrQzlDa0ExSEFpMVFTejZqSU56dFkifSwicHVycG9zZXMiOlsiYXV0aGVudGljYXRpb24iLCJhc3NlcnRpb25NZXRob2QiXSwidHlwZSI6IkVjZHNhU2VjcDI1NmsxVmVyaWZpY2F0aW9uS2V5MjAxOSJ9XX19XSwidXBkYXRlQ29tbWl0bWVudCI6IkVpQnpwN1loTjltaFVjWnNGZHhuZi1sd2tSVS1oVmJCdFpXc1ZvSkhWNmprd0EifSwic3VmZml4RGF0YSI6eyJkZWx0YUhhc2giOiJFaUJvbWxvZ0JPOERROFdpVVFsa3diYmxuMXpsRFU2Q3Jvc01wNDRySjYzWHhBIiwicmVjb3ZlcnlDb21taXRtZW50IjoiRWlEQVFYU2k3SGNqSlZCWUFLZE8yenJNNEhmeWJtQkJDV3NsNlBRUEpfamtsQSJ9fQ'
const PRIVATE_RECOVERY_KEY_HEX = '7c90c0575643d09a370c35021c91e9d8af2c968c5f3a4bf73802693511a55b9f'
const PRIVATE_UPDATE_KEY_HEX = '7288a92f6219c873446abd1f8d26fcbbe1caa5274b47f6f086ef3e7e75dcad8b'
const RP_DID_ION_KID = `${RP_DID_ION}#auth-key`*/
const dbConnection = getDbConnection(DB_CONNECTION_NAME)
const privateKeyStore: PrivateKeyStore = new PrivateKeyStore(dbConnection, new SecretBox(DB_ENCRYPTION_KEY))
type TAgentTypes = ISIOPv2RP & IPresentationExchange & IDIDManager & IResolver;
const oid4vpRP = await createOID4VPRP();
const agent = createAgent<TAgentTypes>({
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
            defaultProvider: `${DID_PREFIX}:${DIDMethods.DID_JWK}`,
            providers: createDidProviders(),
        }),
        new DIDResolverPlugin({
            resolver: createDidResolver(),
        }),
        new PresentationExchange(),
        oid4vpRP,
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
}) as TAgent<TAgentTypes>
export default agent
export const context: IAgentContext<TAgentTypes> = {agent}

const defaultDID = await getDefaultDID()
console.log(`[DID] default DID: ${defaultDID}`)
const defaultKid = await getDefaultKid({did: defaultDID})
console.log(`[DID] default key identifier: ${defaultKid}`)
if (!defaultDID || !defaultKid || !(await getIdentifier(defaultDID))) {
    console.log('TODO create identifier and write config')
    // create Identifier
}
const oid4vpOpts = await getDefaultOID4VPRPOptions({did: defaultDID})
if (oid4vpOpts) {
    oid4vpRP.setDefaultOpts(oid4vpOpts)
}

getOrCreateDIDs().catch(e => console.log(e))
/*agent.didManagerGet({did: RP_DID_WEB}).then(id => {
    console.log(`==DID WEB existed:  \r\n${JSON.stringify(id, null, 2)}\r\nJWK:\r\n${JSON.stringify(toJwk(id.keys[0].publicKeyHex, 'Ed25519'), null, 2)}`)
}).catch(error => {
    agent.didManagerCreate({
            provider: 'did:web',
            alias: EXTERNAL_HOSTNAME,
            kms: KMS.LOCAL,
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
    })*/


if (IS_OID4VP_ENABLED) {
    const opts: ISIOPv2RPRestAPIOpts = {
        hostname: INTERNAL_HOSTNAME_OR_IP,
        port: INTERNAL_PORT,
        webappBaseURI: process.env.OID4VP_WEBAPP_BASE_URI ?? `http://localhost:${INTERNAL_PORT}`,
        siopBaseURI: process.env.OID4VP_AGENT_BASE_URI ?? `http://localhost:${INTERNAL_PORT}`,
    }
    new SIOPv2RPRestAPI({agent, opts})
}
