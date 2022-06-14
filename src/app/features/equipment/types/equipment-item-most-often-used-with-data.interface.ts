// This interface represents how many times a certain equipment item has been used.
//
// {
//   "TELESCOPE-1": 10,
//   "TELESCOPE-2": 5
// }
export interface EquipmentItemMostOftenUsedWith {
  key: string;
  imageCount: number;
}

// This interface represents how many times a certain equipment item has been used, on a per-equipment-item basis.
//
// {
//   "TELESCOPE-1": {
//     "CAMERA-1": 10,
//     "CAMERA-2": 5,
//   }
//   "TELESCOPE-2": {}
// }
export interface EquipmentItemMostOftenUsedWithData {
  key: string;
  data: EquipmentItemMostOftenUsedWith;
}
