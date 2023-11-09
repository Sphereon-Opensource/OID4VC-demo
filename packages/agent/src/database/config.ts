import { Entities as VeramoDataStoreEntities, migrations as VeramoDataStoreMigrations } from '@veramo/data-store'
import { DataStoreContactEntities, DataStoreMigrations } from '@sphereon/ssi-sdk.data-store'
import { SqliteConnectionOptions } from 'typeorm/driver/sqlite/SqliteConnectionOptions'
import { KeyValueStoreEntity, kvStoreMigrations } from '@sphereon/ssi-sdk.kv-store-temp'

// Function to get the SQLite configuration
export function getSqliteConfig() {
  // Check for DB_ENCRYPTION_KEY inside the function to ensure it's only checked when needed
  if (!process.env.DB_ENCRYPTION_KEY) {
    console.warn(`Please provide a DB_ENCRYPTION_KEY env var. Now we will use a pre-configured one. When you change to the var you will have to replace your DB`)
  }

  // Access environment variables inside the function
  const DB_SQLITE_FILE = process.env.DB_SQLITE_FILE

  // Define the config inside the function to ensure it uses the current environment variables
  const sqliteConfig: SqliteConnectionOptions = {
    type: 'sqlite',
    database: DB_SQLITE_FILE || 'default.sqlite', // Provide a default value if DB_SQLITE_FILE is not set
    entities: [...VeramoDataStoreEntities, ...DataStoreContactEntities, KeyValueStoreEntity],
    migrations: [...VeramoDataStoreMigrations, ...DataStoreMigrations, ...kvStoreMigrations],
    migrationsRun: false,
    synchronize: false,
    migrationsTransactionMode: 'each',
    logging: ['info', 'error'],
    logger: 'advanced-console',
  }

  return sqliteConfig
}
