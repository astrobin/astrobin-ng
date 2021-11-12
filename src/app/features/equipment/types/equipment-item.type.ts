import { CameraInterface } from "@features/equipment/types/camera.interface";
import { SensorInterface } from "@features/equipment/types/sensor.interface";
import { TelescopeInterface } from "@features/equipment/types/telescope.interface";
import { MountInterface } from "@features/equipment/types/mount.interface";

// TODO: complete
export type EquipmentItem = CameraInterface | SensorInterface | TelescopeInterface | MountInterface;
