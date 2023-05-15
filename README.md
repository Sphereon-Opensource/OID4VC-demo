<h2 style="text-align: center; vertical-align: middle">
    <center><a href="https://www.sphereon.com"><img src="https://sphereon.com/content/themes/sphereon/assets/img/logo.svg" alt="Sphereon" width="320" style="vertical-align: middle" ></a></center>

<br>SIOPv2 and OID4VP Example/Demo Environment      
<br>
<br>
</h2>

#### This is a demo to showcase our ["Self Issued OpenID Provider v2 and OID4VP" library](https://github.com/Sphereon-Opensource/siopv2-openid4vp).

**NOTE: Please note, this is not intended as production code.
It is a quite simple implementation to show how the SIOPv2 and OpenID4VP technology works.**

### Getting started

#### Configure environment

In the `./packages/agent folder`, update the file called .env and populate it using .env as example. A valid
config will look like this

```dotenv
NODE_ENV=development
PORT=3002
COOKIE_SIGNING_KEY=8E5er6YyAO6dIrDTm7BXYWsafBSLxzjb
BACKEND_BASE_URI=https://backend.example.com
SIOP_BASE_URI=https://backend.example.com
AUTH_REQUEST_EXPIRES_AFTER_SEC=180
```

Except for the IP address/hostname in the `BACKEND_BASE_URI` and `SIOP_BASE_URI` this is a valid configuration to test with. You will need to replace it with the public IP
interface/address or ideally hostname where the
backend will be running and make sure it is accessible from your phone and the port is open in the firewall.

#### Update REACT_APP_BACKEND_BASE_URI in frontend .env
Update the REACT_APP_BACKEND_BASE_URI value in .env or a new .env.local file in the `packages/frontend` directory
It should have the same value as the `BACKEND_BASE_URI` above

#### Build & start
We use pnpm. Currently you cannot use regular npm or yarn to build this project!
install pnpm globally using `npm -g install pnpm`

From the root directory
- pnpm install
- pnpm build
- pnpm start:dev

The server will start on port 5000, the client will start & open a browser on http://localhost:3000/

#### Usage

Once the demo site has loaded, you should see the following screen:

![/resources/start-screen.png](/resources/start-screen.png)

Click "Sign in"
A QR code will appear which can be scanned with the mobile OP authenticator module from our SSI-SDK.

![login-qr-screen.png](resources/login-qr-screen.png)

Once the SIOP accepts the receipt of the Presentation Definition the screen will change to:
![login-wait-def-screen.png](resources/login-wait-def-screen.png)

As soon as the SIOP sends in the Verifiable Presentation that conforms to the definition the SIOP will be authenticated:
![login-wait-def-screen.png](resources/vp-received-screen.png)

Note the Information in the top left corner which actually comes from the Verifiable Credential sent by the SIOP.

app "[rn-did-siop-example-app](https://github.com/Sphereon-OpenSource/rn-did-siop-example-app)"
After a successful login two extra page will appear in the menu navigation.

#### Docker

From the root folder run:

```bash
docker build -t siopv2-oid4vp-example .
docker run -it -p 5001:5001 -p 3000:3000 onto-web-demo
```

### Docker compose

From the root folder run:

```bash
docker-compose up
```

