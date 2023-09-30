import {IPresentationDefinition} from '@sphereon/pex'
import {IRPDefaultOpts, SIOPv2RP} from "@sphereon/ssi-sdk.siopv2-oid4vp-rp-auth";
import {IPEXInstanceOptions} from "@sphereon/ssi-sdk.siopv2-oid4vp-rp-auth/src/types/ISIOPv2RP";
import {
    createDidResolver,
    definitionsOpts, getDefaultDID, getDefaultKid, getIdentifier,
    IS_OID4VP_ENABLED,
    OID4VP_DEFINITIONS,
    OID4VPInstanceOpts,
    oid4vpInstanceOpts
} from "../index";
import {CheckLinkedDomain} from "@sphereon/did-auth-siop";
import {Resolvable} from "did-resolver";


function toPexInstanceOptions(oid4vpInstanceOpts: OID4VPInstanceOpts[], definitions: IPresentationDefinition[], opts?: {
    resolver: Resolvable
}): IPEXInstanceOptions[] {
    const result: IPEXInstanceOptions[] = []
    oid4vpInstanceOpts.map(opt => {
        const definition = definitions.find(pd => pd.id === opt.definitionId || pd.name === opt.definitionId)
        if (opt.rpOpts && !opt.rpOpts.didOpts?.resolveOpts) {
            if (!opt.rpOpts.didOpts) {
                // @ts-ignore
                opt.rpOpts.didOpts = {}
            }
            opt.rpOpts.didOpts.resolveOpts = {...opt.rpOpts.didOpts.resolveOpts}
            if (!opt.rpOpts.didOpts.resolveOpts.resolver) {
                opt.rpOpts.didOpts.resolveOpts.resolver = opts?.resolver ?? createDidResolver()
            }
        }
        if (definition) {
            if (OID4VP_DEFINITIONS.length === 0 || OID4VP_DEFINITIONS.includes(definition.id) || (definition.name && OID4VP_DEFINITIONS.includes(definition.name))) {
                console.log(`[OID4VP] Enabling Presentation Definition with name '${definition.name ?? '<none>'}' and id '${definition.id}'`)
                const rpOpts = opt.rpOpts
                // we handle rpOpts separately, because it contains a resolver function of which the prototype would get lost
                result.push({...opt, definition, rpOpts})
            }
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
    const resolver = args?.resolver  ?? createDidResolver()
    return {
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

export async function createOID4VPRP(opts?: { resolver: Resolvable }) {
    if (!IS_OID4VP_ENABLED) {
        return
    }
    return new SIOPv2RP({
        instanceOpts: toPexInstanceOptions(oid4vpInstanceOpts.asArray, definitionsOpts.asArray, opts)
    })

}
