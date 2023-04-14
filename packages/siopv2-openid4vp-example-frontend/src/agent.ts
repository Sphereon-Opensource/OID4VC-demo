import {createAgent} from '@veramo/core'
import {IQRCodeGenerator, QrCodeProvider} from "@sphereon/ssi-sdk-qr-code-generator";
import {uriWithBase} from "@sphereon/ssi-sdk-siopv2-oid4vp-common";
import {ISIOPv2OID4VPRPRestClient, SIOPv2OID4VPRPRestClient} from "@sphereon/ssi-sdk-siopv2-oid4vp-rp-rest-client";

const agent = createAgent<IQRCodeGenerator, ISIOPv2OID4VPRPRestClient>({
  plugins: [
    new QrCodeProvider(),
    new SIOPv2OID4VPRPRestClient(process.env.REACT_APP_BACKEND_BASE_URL, process.env.PRESENTATION_DEF_ID || '9449e2db-791f-407c-b086-c21cc677d2e0')
  ]
})




export function createURI(path: string) {
  return uriWithBase(path, { baseURI: process.env.REACT_APP_BACKEND_BASE_URI})
}
export default agent
