import { createAgent } from '@veramo/core'

import {WaciQrCodeProvider, WaciTypes} from "@sphereon/ssi-sdk-waci-pex-qr-react";

const agent = createAgent<WaciTypes>({
  plugins: [
    new WaciQrCodeProvider()
  ]
})

export const createOobQrCode = agent.createOobQrCode
export default agent