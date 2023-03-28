import {IPresentationDefinition} from "@sphereon/pex";
import {Rules} from "@sphereon/pex-models";


export enum DefinitionIds {
  ENTRA_VERIFIED_ID_ONLY = 'entra-only',
  ENTRA_VERIFIED_ID_AND_SPHEREON = '9449e2db-791f-407c-b086-c21cc677d2e0'
}

export function getPresentationDefinition(id: string | DefinitionIds): IPresentationDefinition {
  // TODO: This should come from a database or your agent. We are just showing a simple example here
  if (id === DefinitionIds.ENTRA_VERIFIED_ID_AND_SPHEREON || (typeof id === "string") && (id.toLowerCase().includes('sphereon') || id === DefinitionIds.ENTRA_VERIFIED_ID_AND_SPHEREON.valueOf())) {
    return entraAndSphereonCompatibleDefinition()
  } else if (id === DefinitionIds.ENTRA_VERIFIED_ID_ONLY || id === DefinitionIds.ENTRA_VERIFIED_ID_ONLY.valueOf()) {
    return entraVerifiedIdPresentation()
  }
  throw Error(`Unknown definition specified ${id}`)
}

function entraAndSphereonCompatibleDefinition(): IPresentationDefinition {
  return {
    id: "9449e2db-791f-407c-b086-c21cc677d2e0",
    purpose: "You need to prove your Wallet Identity data",
    submission_requirements: [{
      name: "Wallet Identity",
      rule: Rules.Pick,
      min: 2,
      max: 3,
      from: "A"
    }],
    input_descriptors: [/*{
        id: "walletId",
        purpose: "Checking your Wallet information",
        name: "Wallet Identity",
        group: ["A"],
        schema: [{uri: "https://sphereon-opensource.github.io/ssi-mobile-wallet/context/sphereon-wallet-identity-v1.jsonld"}]
            },*/
      {
        id: "WorkplaceCredential",
        name: "ProfessionalCredential",
        purpose: "We need to verify your employment for the demo",
        group: ["A"],
        schema: [
          {
            uri: "WorkplaceCredential" // ENTRA
          },
          {uri: "https://sphereon-opensource.github.io/ssi-mobile-wallet/context/sphereon-wallet-identity-v1.jsonld"} // Sphereon

        ],
        constraints: {
          fields: [
            {
              path: [
                "$.issuer",
                "$.vc.issuer",
                "$.iss"
              ],
              filter: {
                "type": "string",
                "pattern": "did.*"
              }
            }
          ]
        }
      },
      {
        id: "OpenBadgeCredential",
        name: "AchievementCredential",
        purpose: "We need to verify your achievement for the demo",
        group: ["A"],
        schema: [
          {
            uri: "AchievementCredential" // ENTRA
          },
          {uri: "https://purl.imsglobal.org/spec/ob/v3p0/context.json"}

        ],
        constraints: {
          fields: [
            {
              path: [
                "$.issuer",
                "$.vc.issuer",
                "$.iss",
                "$.issuer.id",
              ],
              filter: {
                "type": "string",
                "pattern": "did.*"
              }
            }
          ]
        }
      }
    ]
  };
}

function entraVerifiedIdPresentation(): IPresentationDefinition {
  return {
    id: "entra-only",
    input_descriptors: [
      {
        id: "WorkplaceCredential",
        name: "WorkplaceCredential",
        purpose: "We need to verify your employment at Woodgrove for the demo",
        schema: [
          {
            uri: "WorkplaceCredential"
          }
        ],
        constraints: {
          fields: [
            {
              path: [
                "$.issuer",
                "$.vc.issuer",
                "$.iss"
              ],
              filter: {
                type: "string",
                pattern: "did:ion:EiDXOEH-YmaP2ZvxoCI-lA5zT1i5ogjgH6foIc2LFC83nQ:eyJkZWx0YSI6eyJwYXRjaGVzIjpbeyJhY3Rpb24iOiJyZXBsYWNlIiwiZG9jdW1lbnQiOnsicHVibGljS2V5cyI6W3siaWQiOiJzaWdfODEwYmQ1Y2EiLCJwdWJsaWNLZXlKd2siOnsiY3J2Ijoic2VjcDI1NmsxIiwia3R5IjoiRUMiLCJ4IjoiRUZwd051UDMyMmJVM1dQMUR0Smd4NjdMMENVVjFNeE5peHFQVk1IMkw5USIsInkiOiJfZlNUYmlqSUpqcHNxTDE2Y0lFdnh4ZjNNYVlNWThNYnFFcTA2NnlWOWxzIn0sInB1cnBvc2VzIjpbImF1dGhlbnRpY2F0aW9uIiwiYXNzZXJ0aW9uTWV0aG9kIl0sInR5cGUiOiJFY2RzYVNlY3AyNTZrMVZlcmlmaWNhdGlvbktleTIwMTkifV0sInNlcnZpY2VzIjpbeyJpZCI6ImxpbmtlZGRvbWFpbnMiLCJzZXJ2aWNlRW5kcG9pbnQiOnsib3JpZ2lucyI6WyJodHRwczovL2RpZC53b29kZ3JvdmVkZW1vLmNvbS8iXX0sInR5cGUiOiJMaW5rZWREb21haW5zIn0seyJpZCI6Imh1YiIsInNlcnZpY2VFbmRwb2ludCI6eyJpbnN0YW5jZXMiOlsiaHR0cHM6Ly9iZXRhLmh1Yi5tc2lkZW50aXR5LmNvbS92MS4wLzNjMzJlZDQwLThhMTAtNDY1Yi04YmE0LTBiMWU4Njg4MjY2OCJdfSwidHlwZSI6IklkZW50aXR5SHViIn1dfX1dLCJ1cGRhdGVDb21taXRtZW50IjoiRWlCUlNqWlFUYjRzOXJzZnp0T2F3OWVpeDg3N1l5d2JYc2lnaFlMb2xTSV9KZyJ9LCJzdWZmaXhEYXRhIjp7ImRlbHRhSGFzaCI6IkVpQXZDTkJoODlYZTVkdUk1dE1wU2ZyZ0k2aVNMMmV2QS0tTmJfUElmdFhfOGciLCJyZWNvdmVyeUNvbW1pdG1lbnQiOiJFaUN2RFdOTFhzcE1sbGJfbTFJal96ZV9SaWNKOWdFLUM1b2dlN1NnZTc5cy1BIn19"
              }
            }
          ]
        }
      }
    ]
  }
}
