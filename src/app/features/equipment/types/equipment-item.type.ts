import { AccessoryInterface } from "@features/equipment/types/accessory.interface";
import { CameraInterface } from "@features/equipment/types/camera.interface";
import { FilterInterface } from "@features/equipment/types/filter.interface";
import { MountInterface } from "@features/equipment/types/mount.interface";
import { SensorInterface } from "@features/equipment/types/sensor.interface";
import { SoftwareInterface } from "@features/equipment/types/software.interface";
import { TelescopeInterface } from "@features/equipment/types/telescope.interface";

export type EquipmentItem =
  | CameraInterface
  | SensorInterface
  | TelescopeInterface
  | MountInterface
  | FilterInterface
  | AccessoryInterface
  | SoftwareInterface;
