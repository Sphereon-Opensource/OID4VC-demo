import short from "short-uuid"
import {IOID4VCIClientCreateOfferUriResponse, IOID4VCIRestClient} from "@sphereon/ssi-sdk.oid4vci-issuer-rest-client"
import {Ecosystem, useEcosystem} from "../../ecosystem/ecosystem"
import {
    ComponentConfig,
    EcosystemGeneralConfig,
    PageConfig,
    VCIConfig,
    VCIConfigRoute
} from "../../ecosystem/ecosystem-config"
import {IAgent, RemoveContext} from "@veramo/core"
import {IQRCodeGenerator} from "@sphereon/ssi-sdk.qr-code-generator"
import {ISIOPv2OID4VPRPRestClient} from "@sphereon/ssi-sdk.siopv2-oid4vp-rp-rest-client"


type Payload = Record<string, string>
type QRState = Record<string, any>

type CredentialOfferState = {
    payload: Payload,
    credentialType?: string
}
export const createCredentialOffer = async (actionParams: Record<string, any>, state: CredentialOfferState, ecosystem: Ecosystem): Promise<QRState> => {
    const generalConfig = ecosystem.getGeneralConfig() // TODO delete me after all configs use actionParams.issueCredentialType
    if(!generalConfig.oid4vciAgentBaseUrl) {
        throw new Error('VCI is not enabled because oid4vciAgentBaseUrl is not set in the ecosystem config')
    }

    const shortUuid = short.generate()
    const uriData: IOID4VCIClientCreateOfferUriResponse = await ecosystem.getAgent().oid4vciClientCreateOfferUri({
        grants: {
            'urn:ietf:params:oauth:grant-type:pre-authorized_code': {
                'pre-authorized_code': shortUuid
            },
        },
        credentialDataSupplierInput: {
            ...state.payload
        },
        credential_configuration_ids: [state.credentialType ?? ("issueCredentialType" in actionParams ? actionParams.issueCredentialType : generalConfig.issueCredentialType)],
        credential_issuer: generalConfig.oid4vciAgentBaseUrl
    })

    return {
        uri: uriData.uri,
        preAuthCode: shortUuid,
    } as QRState
}
