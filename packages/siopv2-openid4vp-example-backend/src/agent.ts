import {
  createAgent,
  ICredentialVerifier,
  IDataStore,
  IDataStoreORM,
  IDIDManager,
  IKeyManager,
  IResolver
} from '@veramo/core'

import {QrCodeProvider} from "@sphereon/ssi-sdk-qr-react";
import {getUniResolver} from '@sphereon/did-uni-client'
import {
  CredentialHandlerLDLocal,
  ICredentialHandlerLDLocal,
  LdDefaultContexts,
  MethodNames,
  SphereonBbsBlsSignature2020,
  SphereonEd25519Signature2018,
  SphereonEd25519Signature2020,
  SphereonJsonWebSignature2020
} from '@sphereon/ssi-sdk-vc-handler-ld-local'
import {CredentialPlugin} from '@veramo/credential-w3c'
import {DataStore, DataStoreORM, DIDStore, KeyStore, PrivateKeyStore} from '@veramo/data-store'
import {DIDManager} from '@veramo/did-manager'
import {EthrDIDProvider} from '@veramo/did-provider-ethr'
import {getDidIonResolver, IonDIDProvider} from '@veramo/did-provider-ion'
import {getDidKeyResolver, KeyDIDProvider} from '@veramo/did-provider-key'
import {DIDResolverPlugin} from '@veramo/did-resolver'
import {KeyManager} from '@veramo/key-manager'
import {KeyManagementSystem, SecretBox} from '@veramo/kms-local'
import {Resolver} from 'did-resolver'
import {getDbConnection} from "./database";
import {DB_CONNECTION_NAME, DB_ENCRYPTION_KEY} from "./database";



export const DIF_UNIRESOLVER_RESOLVE_URL = 'https://dev.uniresolver.io/1.0/identifiers'
export const APP_ID = 'sphereon:rp-demo'
export const DID_PREFIX = 'did'

export enum KeyManagementSystemEnum {
  LOCAL = 'local'
}

export enum SupportedDidMethodEnum {
  DID_ETHR = 'ethr',
  DID_KEY = 'key',
  // DID_LTO = 'lto',
  DID_ION = 'ion',
  // DID_FACTOM = 'factom',
  DID_JWK = 'jwk'
}


export const resolver = new Resolver({
  /*// const SPHEREON_UNIRESOLVER_RESOLVE_URL = 'https://uniresolver.test.sphereon.io/1.0/identifiers'
  ...getUniResolver('jwk', {
      resolveUrl: DIF_UNIRESOLVER_RESOLVE_URL
  }),
  ...getUniResolver('ion', {
      resolveUrl: DIF_UNIRESOLVER_RESOLVE_URL
  }),
  ..getUniResolver('lto', {
      resolveUrl: SPHEREON_UNIRESOLVER_RESOLVE_URL
  }),*/
  ...getUniResolver('ethr', {
    resolveUrl: DIF_UNIRESOLVER_RESOLVE_URL
  }),
  ...getDidKeyResolver(),
  ...getUniResolver('jwk', {
    resolveUrl: DIF_UNIRESOLVER_RESOLVE_URL
  }),
  // ...getDidJwkResolver(),
  ...getUniResolver('jwk', {
    resolveUrl: DIF_UNIRESOLVER_RESOLVE_URL
  }),
  ...getDidIonResolver(),
})

export const didProviders = {
  [`${DID_PREFIX}:${SupportedDidMethodEnum.DID_ETHR}`]: new EthrDIDProvider({
    defaultKms: KeyManagementSystemEnum.LOCAL,
    network: 'ropsten'
  }),
  [`${DID_PREFIX}:${SupportedDidMethodEnum.DID_KEY}`]: new KeyDIDProvider({
    defaultKms: KeyManagementSystemEnum.LOCAL
  }),
  [`${DID_PREFIX}:${SupportedDidMethodEnum.DID_ION}`]: new IonDIDProvider({
    defaultKms: KeyManagementSystemEnum.LOCAL
  }),
  /*[`${DID_PREFIX}:${SupportedDidMethodEnum.DID_JWK}`]: new JwkDIDProvider({
    defaultKms: KeyManagementSystemEnum.LOCAL
  })*/
}

const dbConnection = getDbConnection(DB_CONNECTION_NAME)
const privateKeyStore: PrivateKeyStore = new PrivateKeyStore(dbConnection, new SecretBox(DB_ENCRYPTION_KEY))

// @ts-ignore
const agent = createAgent<
    IDIDManager &
    IKeyManager &
    IDataStore &
    IDataStoreORM &
    IResolver &
    ICredentialVerifier &
    ICredentialHandlerLDLocal
>({
  plugins: [
    new QrCodeProvider(),
    new DataStore(dbConnection),
    new DataStoreORM(dbConnection),
    new KeyManager({
      store: new KeyStore(dbConnection),
      kms: {
        local: new KeyManagementSystem(privateKeyStore)
      }
    }),
    new DIDManager({
      store: new DIDStore(dbConnection),
      defaultProvider: `${DID_PREFIX}:${SupportedDidMethodEnum.DID_JWK}`,
      providers: didProviders
    }),
    new DIDResolverPlugin({
      resolver
    }),
    new CredentialPlugin(),
    new CredentialHandlerLDLocal({
      contextMaps: [LdDefaultContexts],
      suites: [
        new SphereonEd25519Signature2018(),
        new SphereonEd25519Signature2020(),
        new SphereonBbsBlsSignature2020(),
        new SphereonJsonWebSignature2020()
      ],
      bindingOverrides: new Map([
        ['createVerifiableCredentialLD', MethodNames.createVerifiableCredentialLDLocal],
        ['createVerifiablePresentationLD', MethodNames.createVerifiablePresentationLDLocal]
      ]),
      keyStore: privateKeyStore
    })
  ]
})

export default agent
