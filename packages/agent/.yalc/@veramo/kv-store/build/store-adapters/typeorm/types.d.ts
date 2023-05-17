import { OrPromise } from '@veramo/utils';
import { DataSource } from 'typeorm';
import { KeyvDeserializedData } from '../../keyv/keyv-types';
export type KeyValueTypeORMOptions = {
    dbConnection: OrPromise<DataSource>;
    namespace?: string;
};
export type Options_<Value> = {
    validator: (value: any, key: string) => boolean;
    dialect: string;
    serialize: (data: KeyvDeserializedData<Value>) => OrPromise<string | undefined>;
    /** A custom deserialization function. */
    deserialize: (data: any) => OrPromise<KeyvDeserializedData<Value> | undefined>;
};
//# sourceMappingURL=types.d.ts.map