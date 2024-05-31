import { Entities as VeramoDataStoreEntities, migrations as VeramoDataStoreMigrations } from '@veramo/data-store'
import {
  DataStoreContactEntities,
  DataStoreMigrations,
  DataStorePresentationDefinitionItemEntities
} from '@sphereon/ssi-sdk.data-store'
import { SqliteConnectionOptions } from 'typeorm/driver/sqlite/SqliteConnectionOptions'
import { KeyValueStoreEntity, kvStoreMigrations } from '@sphereon/ssi-sdk.kv-store-temp'
import {DB_SQLITE_FILE} from "../environment";

if (!process.env.DB_ENCRYPTION_KEY) {
  console.warn(`Please provide a DB_ENCRYPTION_KEY env var. Now we will use a pre-configured one. When you change to the var you will have to replace your DB`)
}

const sqliteConfig: SqliteConnectionOptions = {
  type: 'sqlite',
  database: DB_SQLITE_FILE,
  entities: [
      ...VeramoDataStoreEntities,
    ...DataStoreContactEntities,
    ...DataStorePresentationDefinitionItemEntities,
    KeyValueStoreEntity
  ],
  migrations: [
    ...VeramoDataStoreMigrations,
    ...DataStoreMigrations,
    ...kvStoreMigrations
  ],
  migrationsRun: false, // We run migrations from code to ensure proper ordering with Redux
  synchronize: false, // We do not enable synchronize, as we use migrations from code
  migrationsTransactionMode: 'each', // protect every migration with a separate transaction
  logging: ['info', 'error'], // 'all' means to enable all logging
  logger: 'advanced-console',
}

export { sqliteConfig }
