import { ExpressBuilder, ExpressCorsConfigurer, IExpressServerOpts } from '@sphereon/ssi-express-support'
import { InitializeOptions } from 'passport'
import { Enforcer } from 'casbin'
import { AUTHENTICATION_ENABLED, ENV_VAR_PREFIX, INTERNAL_HOSTNAME_OR_IP, INTERNAL_PORT } from '../environment'

/**
 * Return an Express JS builder from provided Options. Takes into account several environment variables
 *
 * Typically used to create common settings for REST API and to provide settings like port and ip address/hostname,
 * whether authentication/authorization should be used etc.
 *
 * @param opts The global configuration options for REST APIs
 */
export function expressBuilder(opts?: {
  server?: IExpressServerOpts
  envVarPrefix?: string
  auth?: {
    authentication: {
      usePassport: boolean
      initializeOptions?: InitializeOptions
    }
    authorization?: {
      globalUserIsInRole?: string | string[]
      enforcer: Enforcer
    }
  }
}): ExpressBuilder {
  //todo: move some env vars over to environment.ts
  const envVarPrefix = opts?.envVarPrefix ?? ENV_VAR_PREFIX ?? ''
  const port = opts?.server?.port ?? INTERNAL_PORT
  const cookieSigningKey = opts?.server?.cookieSigningKey ?? process.env.COOKIE_SIGNING_KEY
  const hostname = opts?.server?.hostname ?? INTERNAL_HOSTNAME_OR_IP
  const basePath = opts?.server?.basePath ?? process.env.BASE_PATH ?? ''
  const usePassport = opts?.auth?.authentication?.usePassport ?? AUTHENTICATION_ENABLED
  const serverOpts: IExpressServerOpts = {
    ...opts?.server,
    port: port as number,
    cookieSigningKey,
    hostname,
    basePath,
    // We copy these directly as these are complex objects or functions
    existingExpress: opts?.server?.existingExpress,
    listenCallback: opts?.server?.listenCallback,
  }
  const builder = ExpressBuilder.fromServerOpts({ ...serverOpts, envVarPrefix })
    .withMorganLogging({ format: 'dev' })
    .withCorsConfigurer(
      new ExpressCorsConfigurer({
        existingExpress: opts?.server?.existingExpress,
        envVarPrefix,
      }).allowOrigin('*'),
    )
    .withPassportAuth(usePassport, opts?.auth?.authentication?.initializeOptions)

  if (opts?.auth?.authorization?.globalUserIsInRole) {
    builder.withGlobalUserIsInRole(opts?.auth.authorization.globalUserIsInRole)
  }
  if (opts?.auth?.authorization?.enforcer) {
    builder.withEnforcer(opts?.auth.authorization.enforcer)
  }

  return builder
}
