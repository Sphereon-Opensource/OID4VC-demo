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

export type FormData = Record<string, FormFieldValue>
export type FormFieldValue = string | number | ReadonlyArray<string> | boolean | undefined
