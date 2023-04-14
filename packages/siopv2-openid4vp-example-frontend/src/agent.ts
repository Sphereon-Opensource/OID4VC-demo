import {createAgent} from '@veramo/core'
import {IQRCodeGenerator, QrCodeProvider} from "@sphereon/ssi-sdk-qr-code-generator";
import {uriWithBase} from "@sphereon/ssi-sdk-siopv2-oid4vp-common";

const agent = createAgent<IQRCodeGenerator>({
  plugins: [
    new QrCodeProvider()

  ]
})




export function createURI(path: string) {
  return uriWithBase(path, { baseURI: process.env.REACT_APP_BACKEND_BASE_URI})
}
export default agent
