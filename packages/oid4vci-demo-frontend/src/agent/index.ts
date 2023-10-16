import {createAgent} from '@veramo/core'
import {IQRCodeGenerator, QrCodeProvider} from '@sphereon/ssi-sdk.qr-code-generator'
import {ISIOPv2OID4VPRPRestClient, SIOPv2OID4VPRPRestClient} from '@sphereon/ssi-sdk.siopv2-oid4vp-rp-rest-client'
import {IOID4VCIRestClient, OID4VCIRestClient} from '@sphereon/ssi-sdk.oid4vci-issuer-rest-client'
import {TAgent} from "@veramo/core/src/types/IAgent"
import {
    Siopv2RestClientAuthenticationOpts
} from "@sphereon/ssi-sdk.siopv2-oid4vp-rp-rest-client/src/types/ISIOPv2OID4VPRPRestClient"
import {EcosystemGeneralConfig} from "../ecosystem/ecosystem-config"

export type VCIAgentType = TAgent<IQRCodeGenerator & ISIOPv2OID4VPRPRestClient & IOID4VCIRestClient>
type AgentMap = { [key: string]: VCIAgentType };

const agentByEcosystemId: AgentMap = {}


const buildAuthentication = (generalConfig: EcosystemGeneralConfig): Siopv2RestClientAuthenticationOpts => ({
    enabled: !!generalConfig.authenticationEnabled || generalConfig.authenticationStaticToken !== undefined,
    ...(generalConfig.authenticationStaticToken && { staticBearerToken: generalConfig.authenticationStaticToken })
})

const getOrCreateAgent = (ecoSystemId: string, generalConfig: EcosystemGeneralConfig): VCIAgentType => {
    if (ecoSystemId in agentByEcosystemId) {
        return agentByEcosystemId[ecoSystemId]
    }

    const agent = createAgent<IQRCodeGenerator & ISIOPv2OID4VPRPRestClient & IOID4VCIRestClient>({
        plugins: [
            new QrCodeProvider(),
            new SIOPv2OID4VPRPRestClient({
                baseUrl: generalConfig.oid4vpAgentBaseUrl ?? 'https://ssi.sphereon.com/agent',
                authentication: buildAuthentication(generalConfig)
            }),
            new OID4VCIRestClient({
                baseUrl: generalConfig.oid4vciAgentBaseUrl ?? 'https://ssi.sphereon.com/issuer',
                authentication: buildAuthentication(generalConfig)
            }),
        ]
    })
    agentByEcosystemId[ecoSystemId] = agent
    return agent
}

export default getOrCreateAgent
