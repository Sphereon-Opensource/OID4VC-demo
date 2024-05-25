import {IRPDefaultOpts, SIOPv2RP} from "@sphereon/ssi-sdk.siopv2-oid4vp-rp-auth";
import {IPEXInstanceOptions} from "@sphereon/ssi-sdk.siopv2-oid4vp-rp-auth/src/types/ISIOPv2RP";
import {
    createDidResolver,
    getDefaultDID,
    getDefaultKid,
    getIdentifier,
    IS_OID4VP_ENABLED,
    OID4VPInstanceOpts,
    oid4vpInstanceOpts
} from "../environment";
import {CheckLinkedDomain, SupportedVersion} from "@sphereon/did-auth-siop";
import {Resolvable} from "did-resolver";
import {AbstractPdStore} from "@sphereon/ssi-sdk.data-store";


function toPexInstanceOptions(pdStore: AbstractPdStore, oid4vpInstanceOpts: OID4VPInstanceOpts[], opts?: {
    resolver: Resolvable
}): IPEXInstanceOptions[] {
    const result: IPEXInstanceOptions[] = []
    oid4vpInstanceOpts.map(opt => {
        opt.store = pdStore
        if (opt.rpOpts && !opt.rpOpts.didOpts?.resolveOpts) {
            if (!opt.rpOpts.didOpts) {
                // @ts-ignore
                opt.rpOpts.didOpts = {resolveOpts: {resolver: opts?.resolver ?? createDidResolver()}}
            }
            opt.rpOpts.didOpts.resolveOpts = {...opt.rpOpts.didOpts.resolveOpts}
            if (!opt.rpOpts.didOpts.resolveOpts.resolver) {
                opt.rpOpts.didOpts.resolveOpts.resolver = opts?.resolver ?? createDidResolver()
            }
            const rpOpts = opt.rpOpts
            // we handle rpOpts separately, because it contains a resolver function of which the prototype would get lost
            result.push({...opt, rpOpts})
        }
    })
    return result
}


export async function getDefaultOID4VPRPOptions(args?: {
    did?: string,
    resolver?: Resolvable
}): Promise<IRPDefaultOpts | undefined> {
    if (!IS_OID4VP_ENABLED) {
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
    const resolver = args?.resolver ?? createDidResolver()
    return {
        supportedVersions: [SupportedVersion.SIOPv2_D12_OID4VP_D18, SupportedVersion.JWT_VC_PRESENTATION_PROFILE_v1],
        didOpts: {
            resolveOpts: {
                resolver
            },
            checkLinkedDomains: CheckLinkedDomain.IF_PRESENT,
            identifierOpts: {
                identifier,
                kid: await getDefaultKid({did})
            }
        }
    }

}

export async function createOID4VPRP(opts: { resolver: Resolvable, pdStore: AbstractPdStore }) {
    if (!IS_OID4VP_ENABLED) {
        return
    }
    return new SIOPv2RP({
        instanceOpts: toPexInstanceOptions(
            opts.pdStore,
            oid4vpInstanceOpts.asArray,
            opts),
    })
}
