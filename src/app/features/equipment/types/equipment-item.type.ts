import type { AccessoryInterface } from "@features/equipment/types/accessory.interface";
import type { CameraInterface } from "@features/equipment/types/camera.interface";
import type { FilterInterface } from "@features/equipment/types/filter.interface";
import type { MountInterface } from "@features/equipment/types/mount.interface";
import type { SensorInterface } from "@features/equipment/types/sensor.interface";
import type { SoftwareInterface } from "@features/equipment/types/software.interface";
import type { TelescopeInterface } from "@features/equipment/types/telescope.interface";

export type EquipmentItem =
  | CameraInterface
  | SensorInterface
  | TelescopeInterface
  | MountInterface
  | FilterInterface
  | AccessoryInterface
  | SoftwareInterface;
