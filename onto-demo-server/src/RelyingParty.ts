import {IPresentationDefinition} from "@sphereon/pex";
import {Rules} from "@sphereon/pex-models";
import {Resolver} from "did-resolver";
import {getUniResolver} from "@sphereon/did-uni-client";
import EventEmitter from "events";
import {
    CheckLinkedDomain,
    InMemoryReplayRegistry,
    IReplayRegistry,
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
import {generateRequestObjectUri} from "./utils";
import agent from "./agent";

export class RelyingParty {


    constructor() {
        this.eventEmitter = new EventEmitter()
        this.sessionManager = new InMemoryReplayRegistry(this.eventEmitter)
        this.rp = this.buildRP();
    }

    public rp: RP;
    public eventEmitter: EventEmitter;
    public sessionManager: IReplayRegistry

    public static buildPresentationDefinition(): IPresentationDefinition {
        return {
            id: "9449e2db-791f-407c-b086-c21cc677d2e0",
            purpose: "You need to prove your Wallet Identity data",
            submission_requirements: [{
                name: "Wallet Identity",
                rule: Rules.Pick,
                count: 1,
                from: "A"
            }],
            input_descriptors: [{
                id: "walletId",
                purpose: "Checking your Wallet information",
                name: "Wallet Identity",
                group: ["A"],
                schema: [{uri: "https://sphereon-opensource.github.io/ssi-mobile-wallet/context/sphereon-wallet-identity-v1.jsonld"}]
            }]
        };
    }

    public static buildEntraVeifiedIDPresentationDefinition(): IPresentationDefinition {
        return {
            "id": "3c724a94-9e42-4ab2-92d6-5d24382e8964",
            "input_descriptors": [
                {
                    "id": "WorkplaceCredential",
                    "name": "WorkplaceCredential",
                    "purpose": "To verify your employment at Woodgrove for the demo",
                    "schema": [
                        {
                            "uri": "WorkplaceCredential"
                        }
                    ],
                    "constraints": {
                        "fields": [
                            {
                                "path": [
                                    "$.issuer",
                                    "$.vc.issuer",
                                    "$.iss"
                                ],
                                "filter": {
                                    "type": "string",
                                    "pattern": "did:ion:EiDXOEH-YmaP2ZvxoCI-lA5zT1i5ogjgH6foIc2LFC83nQ:eyJkZWx0YSI6eyJwYXRjaGVzIjpbeyJhY3Rpb24iOiJyZXBsYWNlIiwiZG9jdW1lbnQiOnsicHVibGljS2V5cyI6W3siaWQiOiJzaWdfODEwYmQ1Y2EiLCJwdWJsaWNLZXlKd2siOnsiY3J2Ijoic2VjcDI1NmsxIiwia3R5IjoiRUMiLCJ4IjoiRUZwd051UDMyMmJVM1dQMUR0Smd4NjdMMENVVjFNeE5peHFQVk1IMkw5USIsInkiOiJfZlNUYmlqSUpqcHNxTDE2Y0lFdnh4ZjNNYVlNWThNYnFFcTA2NnlWOWxzIn0sInB1cnBvc2VzIjpbImF1dGhlbnRpY2F0aW9uIiwiYXNzZXJ0aW9uTWV0aG9kIl0sInR5cGUiOiJFY2RzYVNlY3AyNTZrMVZlcmlmaWNhdGlvbktleTIwMTkifV0sInNlcnZpY2VzIjpbeyJpZCI6ImxpbmtlZGRvbWFpbnMiLCJzZXJ2aWNlRW5kcG9pbnQiOnsib3JpZ2lucyI6WyJodHRwczovL2RpZC53b29kZ3JvdmVkZW1vLmNvbS8iXX0sInR5cGUiOiJMaW5rZWREb21haW5zIn0seyJpZCI6Imh1YiIsInNlcnZpY2VFbmRwb2ludCI6eyJpbnN0YW5jZXMiOlsiaHR0cHM6Ly9iZXRhLmh1Yi5tc2lkZW50aXR5LmNvbS92MS4wLzNjMzJlZDQwLThhMTAtNDY1Yi04YmE0LTBiMWU4Njg4MjY2OCJdfSwidHlwZSI6IklkZW50aXR5SHViIn1dfX1dLCJ1cGRhdGVDb21taXRtZW50IjoiRWlCUlNqWlFUYjRzOXJzZnp0T2F3OWVpeDg3N1l5d2JYc2lnaFlMb2xTSV9KZyJ9LCJzdWZmaXhEYXRhIjp7ImRlbHRhSGFzaCI6IkVpQXZDTkJoODlYZTVkdUk1dE1wU2ZyZ0k2aVNMMmV2QS0tTmJfUElmdFhfOGciLCJyZWNvdmVyeUNvbW1pdG1lbnQiOiJFaUN2RFdOTFhzcE1sbGJfbTFJal96ZV9SaWNKOWdFLUM1b2dlN1NnZTc5cy1BIn19"
                                }
                            }
                        ]
                    }
                }
            ]
        }
    }

    private buildRP() {
        const SPHEREON_UNIRESOLVER_RESOLVE_URL = 'https://uniresolver.test.sphereon.io/1.0/identifiers'
        const resolver = new Resolver({
            ...getUniResolver('ethr', {
                resolveUrl: 'https://dev.uniresolver.io/1.0/identifiers'
            }),
            // ...ethrDidResolver({infuraProjectId: 'e57bcb689a4f49d3a59e801384fcdca5'}),
            ...getUniResolver('lto', {
                resolveUrl: SPHEREON_UNIRESOLVER_RESOLVE_URL
            }),
            ...getUniResolver('key', {
                resolveUrl: 'https://dev.uniresolver.io/1.0/identifiers'
            }),
            ...getUniResolver('jwk', {
                resolveUrl: 'https://dev.uniresolver.io/1.0/identifiers'
            }),
            ...getUniResolver('jwk', {
                resolveUrl: 'https://dev.uniresolver.io/1.0/identifiers'
            }),
            ...getUniResolver('ion', {
                resolveUrl: 'https://dev.uniresolver.io/1.0/identifiers'
            })

        })


        return RP.builder({requestVersion: SupportedVersion.JWT_VC_PRESENTATION_PROFILE_v1})
            .withScope('openid', PropertyTarget.REQUEST_OBJECT)
            .withResponseMode(ResponseMode.POST)
            .withResponseType(ResponseType.ID_TOKEN, PropertyTarget.REQUEST_OBJECT)
            .withRedirectUri(process.env.REDIRECT_URL_BASE + "/siop-sessions", PropertyTarget.REQUEST_OBJECT)
            .withRequestByReference(generateRequestObjectUri())
            .withInternalSignature(process.env.RP_PRIVATE_KEY_HEX!, process.env.RP_DID, process.env.RP_DID_KID!, SigningAlgo.ES256K)
            .withCustomResolver(resolver)
            .withClientId(process.env.RP_DID, PropertyTarget.REQUEST_OBJECT)
            .withSupportedVersions([
                SupportedVersion.JWT_VC_PRESENTATION_PROFILE_v1,
                SupportedVersion.SIOPv2_ID1
            ])
            .withReplayRegistry(this.sessionManager)
            .withEventEmitter(this.eventEmitter)
            .addDidMethod('ethr')
            .addDidMethod('key')
            .addDidMethod('jwk')
            .addDidMethod('ion')
            .withClientMetadata(
                {

                    idTokenSigningAlgValuesSupported: [SigningAlgo.EDDSA, SigningAlgo.ES256, SigningAlgo.ES256K], // added newly
                    requestObjectSigningAlgValuesSupported: [SigningAlgo.EDDSA, SigningAlgo.ES256, SigningAlgo.ES256K], // added newly
                    responseTypesSupported: [ResponseType.ID_TOKEN], // added newly
                    client_name: "Verifiable Credential Employee Example",
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
            .withPresentationDefinition({definition: RelyingParty.buildEntraVeifiedIDPresentationDefinition()}, PropertyTarget.REQUEST_OBJECT)
            .withCheckLinkedDomain(CheckLinkedDomain.NEVER)
            .withRevocationVerification(RevocationVerification.NEVER)
            .withPresentationVerification(verificationCallback)
            .build();
    }
}

export const verificationCallback = async (args: any): Promise<PresentationVerificationResult> => {
    const result = await agent.verifyPresentation({presentation: args, fetchRemoteContexts: true, domain: "did:ion:EiANaYB43B-E9ngU1Z9XLx8zgIJ6SdOcx74sjeeF7KSa2A"})
    console.log(`VP verification result: ${JSON.stringify(result, null, 2)}`)
    return {verified: result.verified}
}
