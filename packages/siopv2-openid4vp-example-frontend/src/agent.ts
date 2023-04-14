import {createAgent} from '@veramo/core'
import {IQRCodeGenerator, QrCodeProvider} from "@sphereon/ssi-sdk-qr-react";
import {ISIOPv2OID4VPRPRestClient, SIOPv2OID4VPRPRestClient} from "@sphereon/ssi-sdk-siopv2-oid4vp-rp-rest-client";

const agent = createAgent<IQRCodeGenerator, ISIOPv2OID4VPRPRestClient>({
  plugins: [
    new QrCodeProvider(),
    new SIOPv2OID4VPRPRestClient(process.env.REACT_APP_BACKEND_BASE_URL, process.env.PRESENTATION_DEF_ID || '9449e2db-791f-407c-b086-c21cc677d2e0')
  ]
})



export function uriWithBase(path: string) {
  return /*${process.env.REACT_APP_BACKEND_BASE_URL}*/`${process.env.REACT_APP_BACKEND_BASE_URL}${path.startsWith('/') ? path : '/' + path}`;
}
export default agent
