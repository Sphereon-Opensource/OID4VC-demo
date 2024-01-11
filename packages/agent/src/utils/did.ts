import {Resolver} from "did-resolver";
import {getDidIonResolver, IonDIDProvider} from "@veramo/did-provider-ion";
import {getDidJwkResolver} from "@sphereon/ssi-sdk-ext.did-resolver-jwk";
import {getResolver as getDidWebResolver} from "web-did-resolver";
import {WebDIDProvider} from "@sphereon/ssi-sdk-ext.did-provider-web";
import {JwkDIDProvider} from "@sphereon/ssi-sdk-ext.did-provider-jwk";
import agent, {context} from "../agent";
import {DIDDocumentSection, IIdentifier} from "@veramo/core";
import {DID_PREFIX, DIDMethods, didOptConfigs, IDIDResult, KMS, UNIVERSAL_RESOLVER_RESOLVE_URL} from "../environment";
import {mapIdentifierKeysToDocWithJwkSupport} from "@sphereon/ssi-sdk-ext.did-utils";
import {generatePrivateKeyHex, TKeyType, toJwk} from "@sphereon/ssi-sdk-ext.key-utils";
import {getUniResolver} from "@sphereon/did-uni-client";


export function createDidResolver() {
    return new Resolver({
        // ...getUniResolver('ethr', {
        //     resolveUrl: UNIVERSAL_RESOLVER_RESOLVE_URL,
        // }),
        // ...getDidKeyResolver(),
        ...getDidJwkResolver(),
        ...getUniResolver('key', {
            resolveUrl: UNIVERSAL_RESOLVER_RESOLVE_URL,
        }),
        /*...getUniResolver('jwk', {
            resolveUrl: UNIVERSAL_RESOLVER_RESOLVE_URL,
        }),*/
        ...getDidIonResolver(),
        ...getDidWebResolver()
    })
}

export function createDidProviders() {
    return {
        /*[`${DID_PREFIX}:${DIDMethods.DID_ETHR}`]: new EthrDIDProvider({
            defaultKms: KMS.LOCAL,
            network: 'goerli',
        }),*/
        /*[`${DID_PREFIX}:${DIDMethods.DID_KEY}`]: new SphereonKeyDidProvider({
            defaultKms: KMS.LOCAL,
        }),*/
        [`${DID_PREFIX}:${DIDMethods.DID_ION}`]: new IonDIDProvider({
            defaultKms: KMS.LOCAL,
        }),
        [`${DID_PREFIX}:${DIDMethods.DID_WEB}`]: new WebDIDProvider({
            defaultKms: KMS.LOCAL,
        }),
        [`${DID_PREFIX}:${DIDMethods.DID_JWK}`]: new JwkDIDProvider({
            defaultKms: KMS.LOCAL
        })
    }
}

export async function getIdentifier(did: string): Promise<IIdentifier | undefined> {
    return await agent.didManagerGet({did}).catch(e => {
        console.log(e)
        return undefined
    })
}

export async function getDefaultDID(): Promise<string | undefined> {
    if (process.env.DEFAULT_DID) {
        return process.env.DEFAULT_DID
    }
    return agent.didManagerFind().then(ids => {
        if (!ids || ids.length === 0) {
            return
        }
        return ids[0].did
    })
}

export async function getDefaultKid({did, verificationMethodName, verificationMethodFallback}: {
    did?: string,
    verificationMethodName?: DIDDocumentSection,
    verificationMethodFallback?: boolean
}): Promise<string | undefined> {
    if (!did && process.env.DEFAULT_KID) {
        return process.env.DEFAULT_KID
    }
    const targetDid = did ?? await getDefaultDID()
    if (!targetDid) {
        return undefined
    }
    const identifier = await getIdentifier(targetDid)
    if (!identifier) {
        return undefined
    }
    let keys = await mapIdentifierKeysToDocWithJwkSupport(identifier, verificationMethodName ?? 'assertionMethod', context)
    if (keys.length === 0 && (verificationMethodFallback === undefined || verificationMethodFallback)) {
        keys = await mapIdentifierKeysToDocWithJwkSupport(identifier, 'verificationMethod', context)
    }
    if (keys.length === 0) {
        return undefined
    }
    return keys[0].kid
}


export async function getOrCreateDIDs(): Promise<IDIDResult[]> {
    const result = didOptConfigs.asArray.map(async opts => {
            console.log(`DID config found for: ${opts.did}`)
            const did = opts.did
            let identifier = did ? await getIdentifier(did) : undefined
            let privateKeyHex = opts.privateKeyHex
            if (identifier) {
                console.log(`Identifier exists for DID ${did}`)
                console.log(`${JSON.stringify(identifier)}`)
                identifier.keys.map(key => console.log(`kid: ${key.kid}:\r\n ` + JSON.stringify(toJwk(key.publicKeyHex, key.type), null, 2)))
            } else {
                console.log(`No identifier for DID ${did} exists yet. Will create the DID...`)

                let args = opts.createArgs
                if (!args) {
                    args = {options: {}}
                }

                if (!privateKeyHex && !('privateKeyPem' in opts)) {
                    // @ts-ignore
                    privateKeyHex = generatePrivateKeyHex((args.options?.type ?? args.options.keyType ?? "Secp256k1") as TKeyType)
                    console.log("This really is a demo and should not be used in production!")
                    console.log(`privateKeyHex: ${privateKeyHex}`)
                }

                if (privateKeyHex) {
                    if (args.options && !('key' in args.options)) {
                        // @ts-ignore
                        args.options['key'] = {privateKeyHex}
                        // @ts-ignore
                    } else if (args.options && 'key' in args.options && args.options.key && typeof args.options?.key === 'object' && !('privateKeyHex' in args.options.key)) {
                        // @ts-ignore
                        args.options.key['privateKeyHex'] = privateKeyHex
                    }
                }
                identifier = await agent.didManagerCreate(args)
                if (!did) {
                    console.error('TODO: write did config object to did folder')
                    console.error('Please adjust your did config file and add the "did" value to it: "did": "' + identifier.did + '"')
                    console.error(JSON.stringify(identifier, null, 2))
                    throw Error('Exit. Please see instructions')

                }
                identifier.keys.map(key => console.log(`kid: ${key.kid}:\r\n ` + JSON.stringify(toJwk(key.publicKeyHex, key.type), null, 2)))

                console.log(`Identifier created for DID ${did}`)
                console.log(`${JSON.stringify(identifier, null, 2)}`)
            }

            return {...opts, did, identifier} as IDIDResult
        }
    )
    return Promise.all(result)
}
