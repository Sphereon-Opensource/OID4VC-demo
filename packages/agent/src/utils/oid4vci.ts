import {
    createDidResolver,
    getDefaultDID,
    getDefaultKid,
    getIdentifier,
    IS_OID4VCI_ENABLED,
    oid4vciInstanceOpts,
    oid4vciMetadataOpts
} from "../environment";
import {IIssuerOptions as IssuerOpts, OID4VCIIssuer} from '@sphereon/ssi-sdk.oid4vci-issuer'
import {Resolvable} from "did-resolver";
import {
    IIssuerInstanceOptions,
    IIssuerOptions,
    IIssuerOptsPersistArgs,
    OID4VCIStore
} from "@sphereon/ssi-sdk.oid4vci-issuer-store";
import {IIssuerOptsImportArgs} from "@sphereon/ssi-sdk.oid4vci-issuer-store/src/types/IOID4VCIStore";
import agent from '../agent'
import {ManagedIdentifierOpts} from "@sphereon/ssi-sdk-ext.identifier-resolution";


export function toImportIssuerOptions(args?: { oid4vciInstanceOpts: IIssuerOptsImportArgs[] }): IIssuerOptsImportArgs[] {
    return args?.oid4vciInstanceOpts ?? oid4vciInstanceOpts.asArray
}


export async function getDefaultOID4VCIIssuerOptions(args?: { did?: string, resolver?: Resolvable }): Promise<IssuerOpts | undefined> {
    if (!IS_OID4VCI_ENABLED) {
        return
    }
    const did = args?.did ?? await getDefaultDID()
    if (!did) {
        return
    }
    const identifier = await agent.identifierManagedGet({identifier: did})
    if (!identifier) {
        return
    }
    //fixme: remove the casting
    return {
        userPinRequired: process.env.OID4VCI_DEFAULTS_USER_PIN_REQUIRED?.toLowerCase() !== 'false' ?? false,
        idOpts: {
            method: identifier.method,
            identifier: identifier
        } as unknown as ManagedIdentifierOpts
    }

}


export async function addDefaultsToOpts(issuerOpts: IIssuerOptions) {
    const defaultOpts: IssuerOpts | undefined = await getDefaultOID4VCIIssuerOptions({resolver: issuerOpts?.didOpts?.resolveOpts?.resolver})
    let idOpts = issuerOpts?.didOpts?.idOpts ?? defaultOpts?.didOpts?.idOpts
    let resolveOpts = issuerOpts.didOpts.resolveOpts ?? defaultOpts?.resolveOpts
    if (!issuerOpts.didOpts) {
        issuerOpts.didOpts = {
            idOpts,
            resolveOpts
        }
    }
    if (!issuerOpts.didOpts.idOpts) {
        issuerOpts.didOpts.idOpts = idOpts
    }
    if (!issuerOpts.didOpts.resolveOpts) {
        issuerOpts.didOpts.resolveOpts = resolveOpts
    }
    return issuerOpts;
}

export async function issuerPersistToInstanceOpts(opt: IIssuerOptsPersistArgs): Promise<IIssuerInstanceOptions> {
    const issuerOpts = await addDefaultsToOpts(opt.issuerOpts);
    return {
        credentialIssuer: opt.correlationId,
        issuerOpts,
        storeId: opt.storeId,
        storeNamespace: opt.namespace
    }
}

export async function createOID4VCIStore() {
    if (!IS_OID4VCI_ENABLED) {
        return
    }
    const importIssuerOpts = toImportIssuerOptions()
    return new OID4VCIStore({

        importIssuerOpts,
        importMetadatas: oid4vciMetadataOpts.asArray,
        // instanceOpts: await Promise.all(importIssuerOpts.map(async opt => issuerPersistToInstanceOpts(opt)))
    })
}

export async function createOID4VCIIssuer(opts?: { resolver?: Resolvable }) {
    if (!IS_OID4VCI_ENABLED) {
        return
    }
    return new OID4VCIIssuer({
        returnSessions: true,
        resolveOpts: {
            resolver: opts?.resolver ?? createDidResolver(),
        },
    })
}
