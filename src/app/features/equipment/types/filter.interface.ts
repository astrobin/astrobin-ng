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
  PLANETARY = "PLANETARY",
  COMETARY = "COMETARY",
  PHOTOMETRIC_U = "PHOTOMETRIC_U",
  PHOTOMETRIC_B = "PHOTOMETRIC_B",
  PHOTOMETRIC_V = "PHOTOMETRIC_V",
  PHOTOMETRIC_R = "PHOTOMETRIC_R",
  PHOTOMETRIC_I = "PHOTOMETRIC_I",
  OTHER = "OTHER"
}

export enum FilterSize {
  ROUND_1_25_IN = "ROUND_1_25_IN",
  ROUND_2_IN = "ROUND_2_IN",
  ROUND_31_MM = "ROUND_31_MM",
  ROUND_27_MM = "ROUND_27_MM",
  ROUND_36_MM = "ROUND_36_MM",
  ROUND_42_MM = "ROUND_42_MM",
  ROUND_46_MM = "ROUND_46_MM",
  ROUND_50_MM = "ROUND_50_MM",
  ROUND_52_MM = "ROUND_52_MM",
  ROUND_72_MM = "ROUND_72_MM",
  SQUARE_50_MM = "SQUARE_50_MM",
  SQUARE_65_MM = "SQUARE_65_MM",
  SQUARE_100_MM = "SQUARE_100_MM",
  RECT_101_143_MM = "RECT_101_143_MM",
  EOS_APS_C = "EOS_APS_C",
  EOS_FULL = "EOS_FULL",
  EOS_M = "EOS_M",
  EOS_R = "EOS_R",
  SONY = "SONY",
  SONY_FULL = "SONY_FULL",
  NIKON = "NIKON",
  NIKON_Z = "NIKON_Z",
  NIKON_FULL = "NIKON_FULL",
  PENTAX = "PENTAX",
  T_THREAD_CELL_M42 = "T_THREAD_CELL_M42",
  M_52 = "M52",
  SCT = "SCT",
  OTHER = "OTHER"
}

export interface FilterInterface extends EquipmentItemBaseInterface {
  type: FilterType;
  bandwidth: number;
  size: FilterSize;
  otherSize: number;
}

export function instanceOfFilter(object: EquipmentItemBaseInterface): object is FilterInterface {
  return !!object && object.klass === EquipmentItemType.FILTER;
}
