import {IPresentationDefinition} from '@sphereon/pex'
import {Rules} from '@sphereon/pex-models'

export const dbcConferenceAttendeeDef: IPresentationDefinition = {
    "id": "022c2664-68cc-45cc-b291-789ce8b599eb",
    "purpose": "We want to know your name and e-mail address (will not be stored)",
    "input_descriptors": [
        {
            "id": "c2834d0e-3c95-4721-b21a-40e3d7ea2549",
            "name": "DBC Conference 2023 Attendee",
            "purpose": "To access this portal your DBC Conference 2023 attendance proof is required.",
            "schema": [
                {
                    "uri": "DBCConferenceAttendee"
                }
            ],
            "constraints": {
                "fields": [
                    {
                        "path": [
                            "$.credentialSubject.event.name",
                            "$.vc.credentialSubject.event.name"
                        ],
                        "filter": {
                            "type": "string",
                            "pattern": "DBC Conference 2023"
                        }
                    }
                ]
            }
        }
    ]
}

export const fmaGuestDef: IPresentationDefinition = {
    "id": "7601f45c-614f-4076-b13b-15c920ab1d0b",
    "purpose": "For this portal we need your e-mail address and name from a FMA guest or DBC Conference credential",
    "input_descriptors": [
        {
            "id": "4cf7cff1-0234-4f35-9d21-251668a60959",
            "name": "FMA Guest",
            "purpose": "You need to provide a FMA Guest Credential.",
            "schema": [
                {
                    "uri": "GuestCredential"
                }
            ],
            "constraints": {
                "fields": [
                    {
                        "path": [
                            "$.credentialSubject.type",
                            "$.vc.credentialSubject.type"
                        ],
                        "filter": {
                            "type": "string",
                            "pattern": "Future Mobility Alliance Guest"
                        }
                    }
                ]
            }
        }
    ]
}


export const triallGuestDef: IPresentationDefinition = {
    "id": "0101f45c-614f-4076-b13b-15c920ab1d0c",
    "purpose": "For this portal we need your e-mail address and name from a Triall guest or DBC Conference credential",
    "input_descriptors": [
        {
            "id": "4cf7cff1-0234-4f35-9d21-251668a60950",
            "name": "Triall Guest",
            "purpose": "You need to provide a Guest Credential.",
            "schema": [
                {
                    "uri": "GuestCredential"
                }
            ],
            "constraints": {
                "fields": [
                    {
                        "path": [
                            "$.credentialSubject.type",
                            "$.vc.credentialSubject.type"
                        ],
                        "filter": {
                            "type": "string",
                            "pattern": "Triall Guest"
                        }
                    }
                ]
            }
        }
    ]
}



export const entraAndSphereonCompatibleDef: IPresentationDefinition = {
    id: '9449e2db-791f-407c-b086-c21cc677d2e0',
    purpose: 'You need to prove your Wallet Identity data',
    submission_requirements: [
        {
            name: 'Sphereon Wallet Identity',
            rule: Rules.Pick,
            min: 0,
            max: 1,
            from: 'A',
        }/* ,
    {
      name: 'Accademic Award',
      rule: Rules.Pick,
      min: 1,
      max: 1,
      from: 'B',
    },*/
    ],
    input_descriptors: [
        {
            id: 'SphereonWalletId',
            purpose: 'Checking your Sphereon Wallet information',
            name: 'Wallet Identity',
            group: ['A'],
            schema: [{uri: 'https://sphereon-opensource.github.io/ssi-mobile-wallet/context/sphereon-wallet-identity-v1.jsonld'}],
        },
        /* {
           id: 'Academic Award',
           name: 'Academic Award',
           group: ['B'],
           purpose: 'To verify Academic Background',
           schema: [
             {
               uri: 'AcademicAward',
             },
           ],
           constraints: {
             fields: [
               {
                 path: ['$.issuer.id', '$.issuer', '$.vc.issuer', '$.iss'],
                 filter: {
                   type: 'string',
                   pattern:
                     'did:web:launchpad.vii.electron.mattrlabs.io',
                 },
               },
             ],
           },
         },*/
    ],
}

export const entraVerifiedIdPresentation: IPresentationDefinition = {
    id: '081ea6b1-9009-4ec0-b41a-0afcf668bd50',
    input_descriptors: [
        {
            id: 'TrueIdentity',
            name: 'TrueIdentity',
            purpose: 'To verify your demo identity',
            schema: [
                {
                    uri: 'TrueIdentity',
                },
            ],
            constraints: {
                fields: [
                    {
                        path: ['$.issuer', '$.vc.issuer', '$.iss'],
                        filter: {
                            type: 'string',
                            pattern: 'did.*',
                        },
                    },
                ],
            },
        },
    ],
}
