import {createAgent} from '@veramo/core'
import {IQRCodeGenerator, QrCodeProvider} from "@sphereon/ssi-sdk-qr-react";

const agent = createAgent<IQRCodeGenerator>({
  plugins: [
    new QrCodeProvider()

  ]
})



export function uriWithBase(path: string) {
  return /*${process.env.REACT_APP_BACKEND_BASE_URL}*/`${process.env.REACT_APP_BACKEND_BASE_URL}${path.startsWith('/') ? path : '/' + path}`;
}
export default agent
