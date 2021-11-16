import { CameraInterface } from "@features/equipment/types/camera.interface";
import { SensorInterface } from "@features/equipment/types/sensor.interface";
import { TelescopeInterface } from "@features/equipment/types/telescope.interface";
import { MountInterface } from "@features/equipment/types/mount.interface";
import { FilterInterface } from "@features/equipment/types/filter.interface";
import { AccessoryInterface } from "@features/equipment/types/accessory.interface";

// TODO: complete
export type EquipmentItem =
  | CameraInterface
  | SensorInterface
  | TelescopeInterface
  | MountInterface
  | FilterInterface
  | AccessoryInterface;
