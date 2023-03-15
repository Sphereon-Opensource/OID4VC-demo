import {createAgent} from '@veramo/core'

import {IQRCodeGenerator, QrCodeProvider} from "@sphereon/ssi-sdk-qr-react";

const agent = createAgent<IQRCodeGenerator>({
  plugins: [
    new QrCodeProvider()

  ]
})
export default agent
