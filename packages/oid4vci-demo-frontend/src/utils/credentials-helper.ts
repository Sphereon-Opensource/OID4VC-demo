import {
    AdditionalClaims,
    ICredentialSubject,
    IVerifiableCredential,
    IVerifiablePresentation,
    W3CVerifiableCredential,
    W3CVerifiablePresentation
} from "@sphereon/ssi-types"
import {Buffer} from "buffer"
import {ImmutableRecord} from "../types"

export function useCredentialsReader() {
    
    const decodeBase64 = async (jwt: string, kid?: string): Promise<any> => {
        return JSON.parse(Buffer.from(jwt.split('.')[1], 'base64').toString())
    }

    async function credentialDataFromVpToken(vp_token: W3CVerifiablePresentation | W3CVerifiablePresentation[]): Promise<ImmutableRecord | undefined> {
        const credentialData = await handleVPToken(vp_token)
        if (credentialData.length) {
            const max = Math.max(...credentialData.map(p => Object.keys(p).length))
            return Promise.resolve(credentialData.filter(p => Object.keys(p).length === max)[0])
        }
        return undefined
    }

    const handleVPToken = async (vpToken?: W3CVerifiablePresentation | W3CVerifiablePresentation[]): Promise<ImmutableRecord[]> => {
        if (!vpToken) {
            return []
        }
        if (Array.isArray(vpToken)) {
            return asyncFlatMap(vpToken, handleVP)
        }
        return await handleVP(vpToken)
    }

    const handleVP = async (vp: W3CVerifiablePresentation): Promise<ImmutableRecord[]> => {
        let verifiablePresentation: IVerifiablePresentation
        if (typeof vp === 'string') {
            verifiablePresentation = (await decodeBase64(vp)).vp as IVerifiablePresentation
        } else {
            verifiablePresentation = vp as IVerifiablePresentation
        }
        if (!verifiablePresentation.verifiableCredential) {
            return []
        }
        if (Array.isArray(verifiablePresentation.verifiableCredential)) {
            return asyncFlatMap(verifiablePresentation.verifiableCredential, handleCredential)
        }
        return handleCredential(verifiablePresentation.verifiableCredential)
    }

    const handleCredentialSubject = (cs: ICredentialSubject & AdditionalClaims): ImmutableRecord => {
        const keyValuePairs = Object.entries(cs).flatMap(([key, value]) => {
            if (value && typeof value === 'object' && !Array.isArray(value) && !(value instanceof Function)) {
                return Object.entries(value).map(([nestedKey, nestedValue]) => [`${key}.${nestedKey}`, nestedValue])
            } else {
                return [[key, value]]
            }
        })
        return Object.fromEntries(keyValuePairs) as ImmutableRecord
    }

    const handleCredential = async (vc: W3CVerifiableCredential): Promise<ImmutableRecord[]> => {
        let verifiableCredential: IVerifiableCredential
        if (typeof vc === 'string') {
            verifiableCredential = (await decodeBase64(vc)).vc as IVerifiableCredential
        } else {
            verifiableCredential = vc as IVerifiableCredential
        }
        if (!verifiableCredential.credentialSubject) {
            return []
        }
        if (Array.isArray(verifiableCredential.credentialSubject)) {
            return (verifiableCredential.credentialSubject as (ICredentialSubject & AdditionalClaims)[])
                .map(cs => handleCredentialSubject(cs))
        }
        return [handleCredentialSubject(verifiableCredential.credentialSubject)]
    }

    async function asyncFlatMap<T, O>(arr: T[], asyncFn: (t: T) => Promise<O[]>): Promise<O[]> {
        return Promise.all(flatten(await asyncMap(arr, asyncFn)))
    }

    function asyncMap<T, O>(arr: T[], asyncFn: (t: T) => Promise<O>): Promise<O[]> {
        return Promise.all(arr.map(asyncFn))
    }

    function flatten<T>(arr: T[][]): T[] {
        return ([] as T[]).concat(...arr)
    }

    return {credentialDataFromVpToken}
}