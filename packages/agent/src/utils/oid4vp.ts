import {IPresentationDefinition} from '@sphereon/pex'
import {IRPDefaultOpts, SIOPv2RP} from "@sphereon/ssi-sdk.siopv2-oid4vp-rp-auth";
import {IPEXInstanceOptions} from "@sphereon/ssi-sdk.siopv2-oid4vp-rp-auth/src/types/ISIOPv2RP";
import {
    definitionsOpts, getDefaultDID, getDefaultKid, getIdentifier,
    IS_OID4VP_ENABLED,
    OID4VP_DEFINITIONS,
    OID4VPInstanceOpts,
    oid4vpInstanceOpts
} from "../index";
import {CheckLinkedDomain} from "@sphereon/did-auth-siop";


function toPexInstanceOptions(oid4vpInstanceOpts: OID4VPInstanceOpts[], definitions: IPresentationDefinition[]): IPEXInstanceOptions[] {
    const result: IPEXInstanceOptions[] = []
    oid4vpInstanceOpts.map(opt => {
        const definition = definitions.find(pd => pd.id === opt.definitionId || pd.name === opt.definitionId)
        if (definition) {
            if (OID4VP_DEFINITIONS.length === 0 || OID4VP_DEFINITIONS.includes(definition.id) || (definition.name && OID4VP_DEFINITIONS.includes(definition.name))) {
                console.log(`[OID4VP] Enabling Presentation Definition with name '${definition.name ?? '<none>'}' and id '${definition.id}'`)
                result.push({...opt, definition})
            }
        }
    })
    return result
}


export async function getDefaultOID4VPRPOptions(args?: { did?: string }): Promise<IRPDefaultOpts | undefined> {
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
    return {
        didOpts: {
            checkLinkedDomains: CheckLinkedDomain.IF_PRESENT,
            identifierOpts: {
                identifier,
                kid: await getDefaultKid({did})
            }
        }
    }

}

export async function createOID4VPRP() {
    return new SIOPv2RP({
        /*defaultOpts: await getDefaultOID4VPRPOptions()*//*: {

        didOpts: {
            checkLinkedDomains: CheckLinkedDomain.IF_PRESENT,
            identifierOpts: {
                identifier: RP_DID_WEB,
                kid: RP_DID_WEB_KID,
            },
        },
    }*/
        instanceOpts: toPexInstanceOptions(oid4vpInstanceOpts.asArray, definitionsOpts.asArray)
        /*instanceOpts: [
            {
                definitionId: 'dbc2023',
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
                definitionId: 'triall2023',
                definition: triallGuestDef,
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
                definitionId: triallGuestDef.id,
                definition: triallGuestDef,
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
                definitionId: 'fma2023',
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
        ],*/
    })

}
