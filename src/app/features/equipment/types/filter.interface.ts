import { EquipmentItemBaseInterface, EquipmentItemType } from "@features/equipment/types/equipment-item-base.interface";

export enum FilterType {
  H_ALPHA = "H_ALPHA",
  H_BETA = "H_BETA",
  SII = "SII",
  OIII = "OIII",
  NII = "NII",
  UV = "UV",
  IR = "IR",
  MULTIBAND = "MULTIBAND",
  LP = "LP",
  L = "L",
  R = "R",
  G = "G",
  B = "B",
  ND = "ND",
  UHC = "UHC",
  SKY_GLOW = "SKY_GLOW",
  SOLAR = "SOLAR",
  LUNAR = "LUNAR",
  COMETARY = "COMETARY",
  PHOTOMETRIC_U = "PHOTOMETRIC_U",
  PHOTOMETRIC_B = "PHOTOMETRIC_B",
  PHOTOMETRIC_V = "PHOTOMETRIC_V",
  PHOTOMETRIC_R = "PHOTOMETRIC_R",
  PHOTOMETRIC_I = "PHOTOMETRIC_I",
  OTHER = "OTHER"
}

export interface FilterInterface extends EquipmentItemBaseInterface {
  type: FilterType;
  bandwidth: number;
  size: number;
}

export function instanceOfFilter(object: EquipmentItemBaseInterface): object is FilterInterface {
  return !!object && object.klass === EquipmentItemType.FILTER;
}
