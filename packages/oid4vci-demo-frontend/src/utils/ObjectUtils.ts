import {DataFormRow} from "../ecosystem/ecosystem-config"

export const extractKeys = (data: DataFormRow[]): string[] => {
   return data.flatMap(item => item.map(field => field.key));
};

export const extractRequiredKeys = (data: DataFormRow[]): string[] => {
  return data.flatMap(item =>
      item.filter(field => field.required)
      .map(field => field.key)
  );
};

export const transformFormConfigToEmptyObject = (data: DataFormRow[]): Record<string, string> => {
  const keyValuePairs = data.flatMap(item => item.map(field => [field.key, '']));
  return Object.fromEntries(keyValuePairs);
};