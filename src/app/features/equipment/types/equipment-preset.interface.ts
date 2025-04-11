import { UserInterface } from "@core/interfaces/user.interface";
import { AccessoryInterface } from "@features/equipment/types/accessory.interface";
import { CameraInterface } from "@features/equipment/types/camera.interface";
import { FilterInterface } from "@features/equipment/types/filter.interface";
import { MountInterface } from "@features/equipment/types/mount.interface";
import { SoftwareInterface } from "@features/equipment/types/software.interface";
import { TelescopeInterface } from "@features/equipment/types/telescope.interface";

export interface EquipmentPresetInterface {
  id?: number;
  deleted?: string;
  created?: string;
  updated?: string;
  user?: UserInterface["id"];
  remoteSource?: string;
  name: string;
  description: string;
  imagingTelescopes: TelescopeInterface["id"][];
  guidingTelescopes: TelescopeInterface["id"][];
  imagingCameras: CameraInterface["id"][];
  guidingCameras: CameraInterface["id"][];
  mounts: MountInterface["id"][];
  filters: FilterInterface["id"][];
  accessories: AccessoryInterface["id"][];
  software: SoftwareInterface["id"][];
  imageFile?: string | { file: File; url: string }[];
  thumbnail?: string;
  imageCount?: number;
  totalIntegration?: number;
}
