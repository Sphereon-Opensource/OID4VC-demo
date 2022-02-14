declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: "development" | "production"
      PORT?: string
      COOKIE_SIGNING_KEY: string
      REDIRECT_URL_BASE: string
      RP_DID: string
      RP_PRIVATE_HEX_KEY: string
      AUTH_REQUEST_EXPIRES_AFTER_SEC: string
      MOCK_AUTH_RESPONSE: string // Is only used when NODE_ENV = development
    }
  }
}

// If this file has no import/export statements (i.e. is a script)
// convert it into a module by adding an empty export statement.
export {}