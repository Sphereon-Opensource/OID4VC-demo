import {
    CredentialDataSupplier,
    CredentialDataSupplierArgs,
    CredentialDataSupplierResult
} from "@sphereon/oid4vci-issuer"
import {TemplateVCGenerator} from "./templateManager"
import {getTypesFromRequest} from "@sphereon/oid4vci-common"
import {CONF_PATH, CredentialSupplierConfigWithTemplateSupport} from "../environment"


const templateVCGenerator = new TemplateVCGenerator()


const credentialDataSupplierDBCConference2023: CredentialDataSupplier = (args: CredentialDataSupplierArgs) => {
    const firstName = args.credentialDataSupplierInput?.firstName ?? 'Hello'
    const lastName = args.credentialDataSupplierInput?.lastName ?? 'DBC'
    const email = args.credentialDataSupplierInput?.email ?? 'dbc@example.com'

    return Promise.resolve({
        format: args.credentialRequest.format,
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
        format: args.credentialRequest.format,
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
        format: args.credentialRequest.format,
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
        format: args.credentialRequest.format,
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

const credentialDataSupplierSphereon: CredentialDataSupplier = (args: CredentialDataSupplierArgs): Promise<CredentialDataSupplierResult> => {
    const firstName = args.credentialDataSupplierInput?.firstName ?? 'Hello'
    const lastName = args.credentialDataSupplierInput?.lastName ?? 'Sphereon'
    const email = args.credentialDataSupplierInput?.email ?? 'sphereon@example.com'

    const types = getTypesFromRequest(args.credentialRequest)
    if (types.includes('VerifiedEmployee')) {
        if (args.credentialRequest.format !== 'jwt_vc_json') {
            throw Error(`Format ${args.credentialRequest.format} is not configured on this issuer`)
        }
        return Promise.resolve({
            format: args.credentialRequest.format,
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
    } else if (types.includes('MembershipExample')) {
        if (args.credentialRequest.format !== 'jwt_vc_json') {
            throw Error(`Format ${args.credentialRequest.format} is not configured on this issuer`)
        }
        return Promise.resolve({
            format: args.credentialRequest.format,
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
    } /* else {
        //  We have a template for this one now
        if (args.credentialRequest.format !== 'jwt_vc_json') {
            throw Error(`Format ${args.credentialRequest.format} is not configured on this issuer`)
        }

        const r = {
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
        } as unknown as CredentialDataSupplierResult
    } */
    return Promise.resolve({} as unknown as CredentialDataSupplierResult) // return empty result so the code will start looking for templates
}

const supplierByType = async (args: CredentialDataSupplierArgs): Promise<CredentialDataSupplierResult> => {
    const types = getTypesFromRequest(args.credentialRequest, {filterVerifiableCredential: true})
    if (types.includes('PermanentResidentCard')) {
        return credentialDataSupplierPermantResidentCard(args)
    } else if (types.includes('OpenBadgeCredential')) {
        return credentialDataSupplierOpenBadgeJwtJson(args)
    } else {
        return credentialDataSupplierSphereon(args)
    }
}


export function getCredentialDataSupplier(issuerCorrelationId: string): CredentialDataSupplier {
    const templateCredentialDataSupplier = new TemplateCredentialDataSupplier(issuerCorrelationId)
    return templateCredentialDataSupplier.generateCredentialData.bind(templateCredentialDataSupplier)
}

class TemplateCredentialDataSupplier {
    private readonly issuerCorrelationId: string

    constructor(correlationId: string) {
        this.issuerCorrelationId = correlationId
    }

    public async generateCredentialData(args: CredentialDataSupplierArgs): Promise<CredentialDataSupplierResult> {
        const hardCodedSupplierResult = await this.getHardCodedSupplierCredential(this.issuerCorrelationId, args)
        if (hardCodedSupplierResult.credential) {
            return Promise.resolve(hardCodedSupplierResult)
        }

        const types: string[] = getTypesFromRequest(args.credentialRequest)
        const credentialSupplierConfig = args.credentialSupplierConfig as CredentialSupplierConfigWithTemplateSupport
        if (credentialSupplierConfig.template_mappings) {
            const templateMapping = credentialSupplierConfig.template_mappings
                .find(mapping => mapping.credential_types.some(type => types.includes(type)))
            if (templateMapping) {
                const baseDir = credentialSupplierConfig?.templates_base_dir ? `/${credentialSupplierConfig.templates_base_dir}` : '';
                const templatePath = `${CONF_PATH}${baseDir}/${templateMapping.template_path}`;
                const credential = templateVCGenerator.generateCredential(templatePath, args.credentialDataSupplierInput)
                if(!credential) {
                    throw new Error(`Credential generation failed for template ${templatePath}`)
                }
                return Promise.resolve({
                    format: templateMapping.format || args.credentialRequest.format,
                    credential: credential
                } as unknown as CredentialDataSupplierResult)
            } else {
                throw new Error(`No template mapping could be found for types ${types.join(', ')}`)
            }
        }
        throw new Error(`No supplier credential be found for types ${types.join(', ')} and correlationId ${this.issuerCorrelationId}`)
    }

    private getHardCodedSupplierCredential(issuerCorrelationId: string, args: CredentialDataSupplierArgs) {
        let supplier: CredentialDataSupplier
        switch (true) {
            case /(future)|(fma2023)|(fmdm2023)/.test(issuerCorrelationId):
                supplier = credentialDataSupplierFMAGuest2023
                break
            case /(dbc)|(blockchain)/.test(issuerCorrelationId):
                supplier = credentialDataSupplierDBCConference2023
                break
            case /(triall)|(cix)/.test(issuerCorrelationId):
                supplier = credentialDataSupplierTriallGuest2023
                break
            case /(energy)/.test(issuerCorrelationId):
                supplier = credentialDataSupplierEnergySHRGuest2023
                break
            default:
                supplier = supplierByType
        }
        return supplier.call(this, args)
    }
}
