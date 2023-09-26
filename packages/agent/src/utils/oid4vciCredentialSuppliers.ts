import {
    CredentialDataSupplier,
    CredentialDataSupplierArgs,
    CredentialDataSupplierResult
} from "@sphereon/oid4vci-issuer"
import {CredentialRequestJwtVcJson} from "@sphereon/oid4vci-common"
import {TemplateVCGenerator} from "./template-manager"
import {CONF_PATH} from "../index"


// TODO: Create generic supplier with template support.

const credentialDataSupplierDBCConference2023: CredentialDataSupplier = (args: CredentialDataSupplierArgs) => {
    const firstName = args.credentialDataSupplierInput?.firstName ?? 'Hello'
    const lastName = args.credentialDataSupplierInput?.lastName ?? 'DBC'
    const email = args.credentialDataSupplierInput?.email ?? 'dbc@example.com'

    return Promise.resolve({
        format: 'jwt_vc_json',
        credential: {
            '@context': ['https://www.w3.org/2018/credentials/v1'],
            type: ['VerifiableCredential', 'DBCConferenceAttendee'],
            expirationDate: '2023-07-26T00:00:00Z',
            credentialSubject: {
                firstName,
                lastName,
                email,
                event: {
                    name: 'DBC Conference 2023',
                    date: '2023-06-26',
                },
            },
        },
    } as unknown as CredentialDataSupplierResult)
}

const credentialDataSupplierFMAGuest2023: CredentialDataSupplier = (args: CredentialDataSupplierArgs) => {
    const firstName = args.credentialDataSupplierInput?.firstName ?? 'Hello'
    const lastName = args.credentialDataSupplierInput?.lastName ?? 'FMA'
    const email = args.credentialDataSupplierInput?.email ?? 'fma@example.com'

    return Promise.resolve({
        format: 'jwt_vc_json',
        credential: {
            '@context': ['https://www.w3.org/2018/credentials/v1'],
            type: ['VerifiableCredential', 'GuestCredential'],
            expirationDate: new Date(+new Date() + 24 * 60 * 60 * 3600).toISOString(),
            credentialSubject: {
                firstName,
                lastName,
                email,
                type: 'Future Mobility Alliance Guest',
            },
        },
    } as unknown as CredentialDataSupplierResult)
}

const credentialDataSupplierTriallGuest2023: CredentialDataSupplier = (args: CredentialDataSupplierArgs) => {
    const firstName = args.credentialDataSupplierInput?.firstName ?? 'Hello'
    const lastName = args.credentialDataSupplierInput?.lastName ?? 'Triall'
    const email = args.credentialDataSupplierInput?.email ?? 'triall@example.com'

    return Promise.resolve({
        format: 'jwt_vc_json',
        credential: {
            '@context': ['https://www.w3.org/2018/credentials/v1'],
            type: ['VerifiableCredential', 'GuestCredential'],
            expirationDate: new Date(+new Date() + 24 * 60 * 60 * 3600).toISOString(),
            credentialSubject: {
                firstName,
                lastName,
                email,
                type: 'Triall Guest',
            },
        },
    } as unknown as CredentialDataSupplierResult)
}

const credentialDataSupplierEnergySHRGuest2023: CredentialDataSupplier = (args: CredentialDataSupplierArgs) => {
    const firstName = args.credentialDataSupplierInput?.firstName ?? 'Hello'
    const lastName = args.credentialDataSupplierInput?.lastName ?? 'EnergySHR'
    const email = args.credentialDataSupplierInput?.email ?? 'energyshr@example.com'

    return Promise.resolve({
        format: 'jwt_vc_json',
        credential: {
            '@context': ['https://www.w3.org/2018/credentials/v1'],
            type: ['VerifiableCredential', 'GuestCredential'],
            expirationDate: new Date(+new Date() + 24 * 60 * 60 * 3600).toISOString(),
            credentialSubject: {
                firstName,
                lastName,
                email,
                type: 'EnergySHR Guest',
            },
        },
    } as unknown as CredentialDataSupplierResult)
}


const templateVCGenerator = new TemplateVCGenerator()

class TemplateCredentialDataSupplier {
    private templateId: string

    constructor(templateId: string) {
        this.templateId = templateId
    }

    public async generateCredentialData(args: CredentialDataSupplierArgs): Promise<CredentialDataSupplierResult> {
        if (args.credentialRequest.format !== 'jwt_vc_json') {
            throw Error(`Format ${args.credentialRequest.format} is not configured on this issuer`)
        }

        const templatePath = `${CONF_PATH}/templates/${this.templateId}.hbs`
        const credential = templateVCGenerator.generateCredential(templatePath, args.credentialDataSupplierInput)
        return Promise.resolve({
            format: args.credentialRequest.format,
            credential: credential
        } as unknown as CredentialDataSupplierResult)
    }
}

/*  const request = args.credentialRequest as CredentialRequestJwtVcJson
  if (request.types.includes('VerifiedEmployee')) {
      return Promise.resolve({
          format: 'jwt_vc_json',
          credential: {
              '@context': ['https://www.w3.org/2018/credentials/v1'],
              type: ['VerifiableCredential', 'VerifiedEmployee'],
              expirationDate: new Date(+new Date() + 48 * 60 * 60 * 3600).toISOString(),
              credentialSubject: {
                  givenName: firstName,
                  surname: lastName,
                  mail: email,
                  displayName: `${firstName} ${lastName}`,
                  jobTitle: 'Chief Credential Issuer',
                  preferredLanguage: 'en_US',
              },
          },
      } as unknown as CredentialDataSupplierResult)
  } else if (request.types.includes('MembershipExample')) {
      return Promise.resolve({
          format: 'jwt_vc_json',
          credential: {
              '@context': ['https://www.w3.org/2018/credentials/v1'],
              type: ['VerifiableCredential', 'MembershipExample'],
              expirationDate: new Date(+new Date() + 48 * 60 * 60 * 3600).toISOString(),
              credentialSubject: {
                  firstName,
                  lastName,
                  email,
                  type: 'Membership Example',
              },
          },
      } as unknown as CredentialDataSupplierResult)
  } else {
      return Promise.resolve({
          format: 'jwt_vc_json',
          credential: {
              '@context': ['https://www.w3.org/2018/credentials/v1'],
              type: ['VerifiableCredential', 'GuestCredential'],
              expirationDate: new Date(+new Date() + 24 * 60 * 60 * 3600).toISOString(),
              credentialSubject: {
                  firstName,
                  lastName,
                  email,
                  type: 'Sphereon Guest',
              },
          },
      } as unknown as CredentialDataSupplierResult)
  }

  */

export const allCredentialDataSupliers: Record<string, CredentialDataSupplier> = {
    'https://ssi.dutchblockchaincoalition.org/issuer': credentialDataSupplierDBCConference2023,
    'http://localhost:5000/niels': credentialDataSupplierDBCConference2023
}

export function getCredentialDataSupplier(id: string): CredentialDataSupplier {

    // Yes we really need to create templates, so we do not have to use this hardcoding
    let supplier = allCredentialDataSupliers[id]
    if (typeof supplier !== 'function') {
        if (id.match(/(future)|(fma2023)|(fmdm2023)/)) {
            supplier = credentialDataSupplierFMAGuest2023
        } else if (id.match(/(dbc)|(blockchain)/)) {
            supplier = credentialDataSupplierDBCConference2023
        } else if (id.match(/(triall)|(cix)/)) {
            return credentialDataSupplierTriallGuest2023
        } else if (id.match(/(energy)/)) {
            return credentialDataSupplierEnergySHRGuest2023
        } else {
            const templateCredentialDataSupplier = new TemplateCredentialDataSupplier(id)
            supplier = templateCredentialDataSupplier.generateCredentialData.bind(templateCredentialDataSupplier)
        }
    }
    return supplier
}
