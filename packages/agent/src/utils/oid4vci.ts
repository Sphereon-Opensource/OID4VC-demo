import {
    createDidResolver,
    getDefaultDID,
    getDefaultKid,
    getIdentifier,
    IS_OID4VCI_ENABLED,
    oid4vciInstanceOpts,
    oid4vciMetadataOpts
} from "../environment";
import {IIssuerDefaultOpts, OID4VCIIssuer} from "@sphereon/ssi-sdk.oid4vci-issuer";
import {Resolvable} from "did-resolver";
import {
    IIssuerInstanceOptions,
    IIssuerOptions,
    IIssuerOptsPersistArgs,
    OID4VCIStore
} from "@sphereon/ssi-sdk.oid4vci-issuer-store";
import {IIssuerOptsImportArgs} from "@sphereon/ssi-sdk.oid4vci-issuer-store/src/types/IOID4VCIStore";


export function toImportIssuerOptions(args?: { oid4vciInstanceOpts: IIssuerOptsImportArgs[] }): IIssuerOptsImportArgs[] {
    return args?.oid4vciInstanceOpts ?? oid4vciInstanceOpts.asArray
}


export async function getDefaultOID4VCIIssuerOptions(args?: { did?: string, resolver?: Resolvable }): Promise<IIssuerDefaultOpts | undefined> {
    if (!IS_OID4VCI_ENABLED) {
        return
    }
    const did = args?.did ?? await getDefaultDID()
    if (!did) {
        return
    }
    const identifier = await getIdentifier(did)
    if (!identifier) {
        return
    }
    return {
        userPinRequired: process.env.OID4VCI_DEFAULTS_USER_PIN_REQUIRED?.toLowerCase() !== 'false' ?? false,
        didOpts: {
            resolveOpts: {
                resolver: args?.resolver ?? createDidResolver()
            },
            identifierOpts: {
                identifier,
                kid: await getDefaultKid({did})
            }
        }
    }

}


export async function addDefaultsToOpts(issuerOpts: IIssuerOptions) {
    const defaultOpts = await getDefaultOID4VCIIssuerOptions({resolver: issuerOpts?.didOpts?.resolveOpts?.resolver})
    let identifierOpts = issuerOpts?.didOpts?.identifierOpts ?? defaultOpts?.didOpts.identifierOpts
    let resolveOpts = issuerOpts.didOpts.resolveOpts ?? defaultOpts?.didOpts.resolveOpts
    if (!issuerOpts.didOpts) {
        issuerOpts.didOpts = {
            identifierOpts,
            resolveOpts
        }
    }
    if (!issuerOpts.didOpts.identifierOpts) {
        issuerOpts.didOpts.identifierOpts = identifierOpts
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
