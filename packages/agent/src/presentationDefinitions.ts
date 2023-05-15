import { IPresentationDefinition } from '@sphereon/pex'
import { Rules } from '@sphereon/pex-models'

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
    } ,
    {
      name: 'Accademic Award',
      rule: Rules.Pick,
      min: 1,
      max: 1,
      from: 'B',
    },
  ],
  input_descriptors: [
    {
      id: 'SphereonWalletId',
      purpose: 'Checking your Sphereon Wallet information',
      name: 'Wallet Identity',
      group: ['A'],
      schema: [{ uri: 'https://sphereon-opensource.github.io/ssi-mobile-wallet/context/sphereon-wallet-identity-v1.jsonld' }],
    },
    {
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
    },
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
