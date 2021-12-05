import { UserInterface } from "@shared/interfaces/user.interface";
import { TelescopeInterface } from "@features/equipment/types/telescope.interface";
import { CameraInterface } from "@features/equipment/types/camera.interface";
import { MountInterface } from "@features/equipment/types/mount.interface";
import { FilterInterface } from "@features/equipment/types/filter.interface";
import { AccessoryInterface } from "@features/equipment/types/accessory.interface";
import { SoftwareInterface } from "@features/equipment/types/software.interface";

export interface EquipmentPresetInterface {
  id: number;
  deleted?: string;
  created: string;
  updated: string;
  user: UserInterface["id"];
  remoteSource: string;
  name: string;
  imagingTelescopes: TelescopeInterface["id"][];
  guidingTelescopes: TelescopeInterface["id"][];
  imagingCameras: CameraInterface["id"][];
  guidingCameras: CameraInterface["id"][];
  mounts: MountInterface["id"][];
  filters: FilterInterface["id"][];
  accessories: AccessoryInterface["id"][];
  software: SoftwareInterface["id"][];
}
