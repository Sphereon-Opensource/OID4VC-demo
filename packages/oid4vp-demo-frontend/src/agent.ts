import {createAgent} from '@veramo/core'
import {IQRCodeGenerator, QrCodeProvider} from "@sphereon/ssi-sdk.qr-code-generator";
import {ISIOPv2OID4VPRPRestClient, SIOPv2OID4VPRPRestClient} from "@sphereon/ssi-sdk.siopv2-oid4vp-rp-rest-client";




const agent = createAgent<IQRCodeGenerator & ISIOPv2OID4VPRPRestClient>({
    plugins: [
        new QrCodeProvider(),
        new SIOPv2OID4VPRPRestClient({
            baseUrl: process.env.REACT_APP_BACKEND_BASE_URI,
            definitionId: process.env.REACT_APP_PRESENTATION_DEF_ID ?? 'sphereonGuest',
            authentication: {
                enabled: process.env.REACT_APP_AUTHENTICATION_ENABLED === "true" || process.env.REACT_APP_AUTHENTICATION_STATIC_TOKEN !== undefined,
                bearerToken: process.env.REACT_APP_AUTHENTICATION_STATIC_TOKEN
            }
        })
    ]
})
export default agent
