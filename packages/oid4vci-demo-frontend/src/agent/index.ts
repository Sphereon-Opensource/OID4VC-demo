import { createAgent } from '@veramo/core'
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
import {getCurrentEcosystemGeneralConfig} from "../ecosystem-config"

const generalConfig = getCurrentEcosystemGeneralConfig()

const buildAuthentication = {
  enabled: generalConfig.authenticationEnabled === true || generalConfig.authenticationStaticToken !== undefined,
  staticBearerToken: generalConfig.authenticationStaticToken ?? ''
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

export default agent
