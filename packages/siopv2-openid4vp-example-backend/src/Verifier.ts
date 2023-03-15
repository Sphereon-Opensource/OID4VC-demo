import EventEmitter from "events";
import {
    CheckLinkedDomain,
    InMemoryRPSessionManager,
    IRPSessionManager,
    PassBy,
    PropertyTarget,
    ResponseMode,
    ResponseType,
    RevocationVerification,
    RP,
    Scope,
    SigningAlgo,
    SubjectType,
    SupportedVersion
} from "@sphereon/did-auth-siop";
import {PresentationVerificationResult} from "@sphereon/did-auth-siop/dist/main/authorization-response/types";

import agent, {resolver} from "./agent";
import {DefinitionIds, getPresentationDefinition} from "./presentationDefinitions";

export class Verifier {


    constructor(definitionId: DefinitionIds) {
        this.eventEmitter = new EventEmitter()
        this.sessionManager = new InMemoryRPSessionManager(this.eventEmitter)
        this.definitionId = definitionId
        this.rp = this.buildRP(definitionId);
    }

    public readonly definitionId: DefinitionIds
    public readonly rp: RP;
    public readonly eventEmitter: EventEmitter;
    public readonly sessionManager: IRPSessionManager


    private buildRP(definitionId: DefinitionIds): RP {
        return RP.builder({requestVersion: SupportedVersion.JWT_VC_PRESENTATION_PROFILE_v1})
            .withScope('openid', PropertyTarget.REQUEST_OBJECT)
            .withResponseMode(ResponseMode.POST)
            .withResponseType(ResponseType.ID_TOKEN, PropertyTarget.REQUEST_OBJECT)
            // .withRedirectUri(process.env.REDIRECT_URL_BASE + "/siop-sessions", PropertyTarget.REQUEST_OBJECT)
            // .withRequestByReference(uriWithBase(`auth-requests`))
            .withInternalSignature(process.env.RP_PRIVATE_KEY_HEX!, process.env.RP_DID!, process.env.RP_DID_KID!, SigningAlgo.ES256K)
            .withCustomResolver(resolver)
            .withClientId(process.env.RP_DID!, PropertyTarget.REQUEST_OBJECT)
            .withSupportedVersions([
                SupportedVersion.JWT_VC_PRESENTATION_PROFILE_v1,
                SupportedVersion.SIOPv2_ID1
            ])
            .withSessionManager(this.sessionManager)
            .withEventEmitter(this.eventEmitter)
            .addDidMethod('ethr')
            .addDidMethod('key')
            // .addDidMethod('jwk')
            .addDidMethod('ion')
            .withClientMetadata(
                {

                    idTokenSigningAlgValuesSupported: [SigningAlgo.EDDSA, SigningAlgo.ES256, SigningAlgo.ES256K], // added newly
                    requestObjectSigningAlgValuesSupported: [SigningAlgo.EDDSA, SigningAlgo.ES256, SigningAlgo.ES256K], // added newly
                    responseTypesSupported: [ResponseType.ID_TOKEN], // added newly
                    client_name: "Sphereon",
                    vpFormatsSupported: {
                        jwt_vc: {alg: ["EdDSA", "ES256K"]},
                        jwt_vp: {alg: ["ES256K", "EdDSA"]}
                    },
                    scopesSupported: [Scope.OPENID_DIDAUTHN],
                    subjectTypesSupported: [SubjectType.PAIRWISE],
                    subject_syntax_types_supported: ['did', 'did:ethr', 'did:key', 'did:ion', 'did:jwk'],
                    passBy: PassBy.VALUE,
                }, PropertyTarget.REQUEST_OBJECT
            )
            .withPresentationDefinition({definition: getPresentationDefinition(definitionId)}, PropertyTarget.REQUEST_OBJECT)
            .withCheckLinkedDomain(CheckLinkedDomain.NEVER)
            .withRevocationVerification(RevocationVerification.NEVER)
            .withPresentationVerification(verificationCallback)
            .build();
    }
}

export const verificationCallback = async (args: any): Promise<PresentationVerificationResult> => {
    const result = await agent.verifyPresentation({
        presentation: args,
        fetchRemoteContexts: true,
        domain: "did:ion:EiANaYB43B-E9ngU1Z9XLx8zgIJ6SdOcx74sjeeF7KSa2A"
    })
    console.log(`VP verification result: ${JSON.stringify(result, null, 2)}`)
    return {verified: result.verified}
}
