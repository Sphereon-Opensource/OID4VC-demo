import short from "short-uuid"
import {IOID4VCIClientCreateOfferUriResponse} from "@sphereon/ssi-sdk.oid4vci-issuer-rest-client"
import agent from "../agent"
import {getCurrentEcosystemGeneralConfig} from "../ecosystem-config"

const generalConfig = getCurrentEcosystemGeneralConfig()

type Payload = Record<string, string>
type QRState = Record<string, any>

type CredentialOfferState = {
    payload: Payload,
    isManualIdentification: Boolean
}
export const createCredentialOffer = async (state: CredentialOfferState): Promise<QRState> => {
    const shortUuid = short.generate()
    const uriData: IOID4VCIClientCreateOfferUriResponse = await agent.oid4vciClientCreateOfferUri({
        grants: {
            'urn:ietf:params:oauth:grant-type:pre-authorized_code': {
                'pre-authorized_code': shortUuid,
                user_pin_required: false,
            },
        },
        credentialDataSupplierInput: {
            ...state.payload
        },
        credentials: [generalConfig.issueCredentialType],
    })

    return {
        uri: uriData.uri,
        preAuthCode: shortUuid,
        isManualIdentification: state.isManualIdentification,
    } as QRState
}
