import {config as dotenvConfig} from "dotenv-flow";
import {resolve} from "path";
import {loadJsonFiles} from "./utils";
import {IPresentationDefinition} from "@sphereon/pex";
import {IDIDOpts, OID4VPInstanceOpts} from "./types";
import {
    IIssuerOptsImportArgs,
    IMetadataImportArgs
} from "@sphereon/ssi-sdk.oid4vci-issuer-store";


dotenvConfig()

export const DB_CONNECTION_NAME = process.env.DB_CONNECTION_NAME ?? 'default'
export const DB_SQLITE_FILE = process.env.DB_SQLITE_FILE ?? 'database/agent_default.sqlite'

export const DB_ENCRYPTION_KEY = process.env.DB_ENCRYPTION_KEY ?? '29739248cad1bd1a0fc4d9b75cd4d2990de535baf5caadfdf8d8f86664aa830c'
export const INTERNAL_PORT = process.env.PORT ? Number.parseInt(process.env.PORT) : 5000

export const INTERNAL_HOSTNAME_OR_IP = process.env.INTERNAL_HOSTNAME_OR_IP ?? '0.0.0.0'
export const EXTERNAL_HOSTNAME = process.env.EXTERNAL_HOSTNAME ?? 'dbc2023.test.sphereon.com'
export const DID_PREFIX = 'did'
export const CONF_PATH = process.env.CONF_PATH ? resolve(process.env.CONF_PATH) : resolve('../../conf')
export const DID_OPTIONS_PATH = `${CONF_PATH}/dids`
export const OID4VP_DEFINITIONS: string[] = process.env.OID4VP_DEFINITIONS ? process.env.OID4VP_DEFINITIONS.split(/[, ]/).map(val => val.trim()) : []
export const OID4VP_PRESENTATION_DEFINITION_PATH = `${CONF_PATH}/presentation_definitions`;
export const OID4VP_RP_OPTIONS_PATH = `${CONF_PATH}/oid4vp_options`;

export const OID4VCI_ISSUER_OPTIONS_PATH = `${CONF_PATH}/oid4vci_options`;
export const OID4VCI_ISSUER_METADATA_PATH = `${CONF_PATH}/oid4vci_metadata`;
export const UNIVERSAL_RESOLVER_RESOLVE_URL = process.env.UNIVERSAL_RESOLVER_RESOLVE_URL ?? 'https://dev.uniresolver.io/1.0/identifiers'

export const oid4vpInstanceOpts = loadJsonFiles<OID4VPInstanceOpts>({path: OID4VP_RP_OPTIONS_PATH})

export const oid4vciInstanceOpts = loadJsonFiles<IIssuerOptsImportArgs>({path: OID4VCI_ISSUER_OPTIONS_PATH})
export const oid4vciMetadataOpts = loadJsonFiles<IMetadataImportArgs>({path: OID4VCI_ISSUER_METADATA_PATH})
export const syncDefinitionsOpts = loadJsonFiles<IPresentationDefinition>({path: OID4VP_PRESENTATION_DEFINITION_PATH})
export const didOptConfigs = loadJsonFiles<IDIDOpts>({path: DID_OPTIONS_PATH})
export const IS_OID4VP_ENABLED = process.env.OID4VP_ENABLED === undefined || process.env.OID4VP_ENABLED
export const IS_OID4VCI_ENABLED = process.env.OID4VCI_ENABLED === undefined || process.env.OID4VCI_ENABLED

export * from './types'
export * from './utils'
export * from './database'
export * from './agent'
