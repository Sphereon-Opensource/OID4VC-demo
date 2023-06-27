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
  width?: string | number
  height?: string | number
}

export enum VCIEcosystem {
  dbc = 'dbc',
  sphereon = 'sphereon',
  fmdm = 'fmdm',
  triall = 'triall',
  energy_shr = 'energy_shr'
}
