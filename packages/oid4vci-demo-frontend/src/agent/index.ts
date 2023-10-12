import {createAgent} from '@veramo/core'
import {
    IQRCodeGenerator,
    QrCodeProvider
} from '@sphereon/ssi-sdk.qr-code-generator'
import {
    ISIOPv2OID4VPRPRestClient,
    SIOPv2OID4VPRPRestClient
} from '@sphereon/ssi-sdk.siopv2-oid4vp-rp-rest-client'
import {
    IOID4VCIRestClient,
    OID4VCIRestClient
} from '@sphereon/ssi-sdk.oid4vci-issuer-rest-client'
import {EcosystemGeneralConfig, getCurrentEcosystemGeneralConfig, VCIConfigRouteStep} from "../ecosystem-config"
import {TAgent} from "@veramo/core/src/types/IAgent"
import {
    Siopv2RestClientAuthenticationOpts
} from "@sphereon/ssi-sdk.siopv2-oid4vp-rp-rest-client/src/types/ISIOPv2OID4VPRPRestClient"

type VCIAgentType = TAgent<IQRCodeGenerator & ISIOPv2OID4VPRPRestClient & IOID4VCIRestClient>
type AgentMap = { [key: string]: VCIAgentType };

const agentByEcosystemId: AgentMap = {}


const buildAuthentication = (generalConfig: EcosystemGeneralConfig): Siopv2RestClientAuthenticationOpts => ({
    enabled: generalConfig.authenticationEnabled === true || generalConfig.authenticationStaticToken !== undefined,
    staticBearerToken: generalConfig.authenticationStaticToken ?? ''
})

const getAgent = (ecoSystemId?: string): VCIAgentType => {
    if(!ecoSystemId) {
        ecoSystemId = 'sphereon'
    }
    if (ecoSystemId in agentByEcosystemId) {
        return agentByEcosystemId[ecoSystemId]
    }

    const generalConfig = getCurrentEcosystemGeneralConfig(ecoSystemId)
    const agent = createAgent<IQRCodeGenerator & ISIOPv2OID4VPRPRestClient & IOID4VCIRestClient>({
        plugins: [
            new QrCodeProvider(),
            new SIOPv2OID4VPRPRestClient({
                baseUrl: generalConfig.agentVpBaseUrl ?? 'https://ssi.sphereon.com/agent',
                authentication: buildAuthentication(generalConfig)
            }),
            new OID4VCIRestClient({
                baseUrl: generalConfig.agentVciBaseUrl ?? 'https://ssi.sphereon.com/issuer',
                authentication: buildAuthentication(generalConfig)
            }),
        ]
    })
    agentByEcosystemId[agentByEcosystemId] = agent
    return agent
}

export default getAgent
