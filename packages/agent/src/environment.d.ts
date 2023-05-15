declare global {
    namespace NodeJS {
        interface ProcessEnv {
            NODE_ENV: "development" | "production"
            PORT?: string
            HOSTNAME?: string
            BACKEND_BASE_URI: string
            SIOP_BASE_URI: string
            COOKIE_SIGNING_KEY: string
        }
    }
}

// If this file has no import/export statements (i.e. is a script)
// convert it into a module by adding an empty export statement.
export {}
