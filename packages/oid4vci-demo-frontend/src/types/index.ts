export interface IButton {
  caption: string;
  onClick: () => Promise<void>;
  disabled?: boolean;
  type?: ButtonType;
}

export enum ButtonType {
  PRIMARY = 'primary',
  SECONDARY = 'secondary'
}

export interface ImageProperties {
  src: string
  alt: string
  width?: number
  height?: number
}

export interface LogoProperties {
  src: string
  alt: string
  width?: string
  height?: string
  justifyContent?: string
}

export type FormOutputData = Record<string, FormFieldValue>
export type FormFieldValue = string | number | ReadonlyArray<string> | boolean | undefined
export type ImmutableRecord = Readonly<Record<string, ImmutableValue>>;
export type ImmutableValue = Readonly<string | number | ReadonlyArray<string> | boolean | undefined>;

export type UniformCredential = {
  //fixme: after updating to the latest ssi-types we should be able strictly type this
  original: any
  //original claims that can be found in the credential
  subjectClaim: Record<string, any>
  //transformed claims. altered form of the subject claim
  transformedClaims: Record<string, string>
}