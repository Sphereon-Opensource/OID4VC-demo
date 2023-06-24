import * as dotenv from "dotenv-flow";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";

import express, {Express, Response} from 'express'

export function setupExpress() {
    const exp: Express = express()
    dotenv.config()

    const port = process.env.PORT || 5000
    const secret = process.env.COOKIE_SIGNING_KEY
    const hostname = process.env.INTERNAL_HOSTNAME_OR_IP ?? '0.0.0.0'
    exp.use((req, res, next) => {
        res.header('Access-Control-Allow-Origin', '*')
        // Request methods you wish to allow
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE')

        // Request headers you wish to allow
        res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type')

        // Set to true if you need the website to include cookies in the requests sent
        // to the API (e.g. in case you use sessions)
        res.setHeader('Access-Control-Allow-Credentials', 'true')
        next()
    })
    // this.express.use(cors({ credentials: true }));
    // this.express.use('/proxy', proxy('www.gssoogle.com'));
    exp.use(bodyParser.urlencoded({extended: true}))
    exp.use(bodyParser.json())
    exp.use(cookieParser(secret))
    exp.listen(port as number, hostname, () => console.log(`Listening on ${hostname}, port ${port}`))
    return exp
}
