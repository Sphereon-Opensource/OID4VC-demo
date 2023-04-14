import agent from './agent'
import {ISIOPv2RPRestAPIOpts, SIOPv2RPRestAPI} from '@sphereon/ssi-sdk-siopv2-oid4vp-rp-rest-api'

import * as dotenv from "dotenv-flow";

dotenv.config()

const opts: ISIOPv2RPRestAPIOpts = {
    hostname: process.env.HOSTNAME ?? '0.0.0.0',
    port: process.env.PORT ? Number.parseInt(process.env.PORT) : 5000,
    webappBaseURI: process.env.BACKEND_BASE_URI ?? 'http://192.168.2.18:5000',
    siopBaseURI: process.env.SIOP_BASE_URI ?? 'http://192.168.2.18:5000',
}

new SIOPv2RPRestAPI({agent, opts})
