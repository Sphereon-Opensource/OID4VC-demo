import {DataFormRow} from "../ecosystem/ecosystem-config"
import {FormFieldValue} from "../types"

export const extractKeys = (data: DataFormRow[]): string[] => {
   return data.flatMap(item => item.map(field => field.key));
};

export const extractRequiredKeys = (data: DataFormRow[]): string[] => {
  return data.flatMap(item =>
      item.filter(field => field.required && !field.readonlyWhenAbsentInPayload)
      .map(field => field.key)
  );
};

export const transformFormConfigToEmptyObject = (data: DataFormRow[]): Record<string, FormFieldValue> => {
  const keyValuePairs = data.flatMap(item => item.map(field => [field.key, '']));
  return Object.fromEntries(keyValuePairs);
};