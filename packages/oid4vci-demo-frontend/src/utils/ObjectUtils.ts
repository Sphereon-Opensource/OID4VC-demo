import {DataFormRow} from "../ecosystem-config";

export const extractKeys = (data: DataFormRow[]): string[] => {
    return data.flat().map(field => field.key);
};

export const extractRequiredKeys = (data: DataFormRow[]): string[] => {
  return data.flat().filter(field=> field.required).map(field => field.key);
};

export const transformDataToObject = (data: DataFormRow[]): Record<string, string> => {
    return data.flat().reduce((acc, field) => {
        acc[field.key] = '';
        return acc;
    }, {} as Record<string, string>);
};