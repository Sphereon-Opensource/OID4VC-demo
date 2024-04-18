import {
    CredentialDataSupplier,
    CredentialDataSupplierArgs,
    CredentialDataSupplierResult
} from "@sphereon/oid4vci-issuer"
import {TemplateVCGenerator} from "./templateManager"
import {getTypesFromRequest} from "@sphereon/oid4vci-common"
import {CONF_PATH, CredentialSupplierConfigWithTemplateSupport, normalizeFilePath} from "../environment"

const templateVCGenerator = new TemplateVCGenerator()

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
        const types: string[] = getTypesFromRequest(args.credentialRequest)
        const credentialSupplierConfig = args.credentialSupplierConfig as CredentialSupplierConfigWithTemplateSupport
        if (credentialSupplierConfig.template_mappings) {
            const templateMapping = credentialSupplierConfig.template_mappings
                .find(mapping => mapping.credential_types.some(type => type !== 'VerifiableCredential' && types.includes(type)))
            if (templateMapping) {
                const templatePath = normalizeFilePath(CONF_PATH, credentialSupplierConfig?.templates_base_dir, templateMapping.template_path)
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
        throw new Error(`The credential supplier could not find a match for the requested credential types ${types.join(', ')}. The issuer correlationId is ${this.issuerCorrelationId}`)
    }
}
