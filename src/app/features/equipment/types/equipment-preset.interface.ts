import type { UserInterface } from "@core/interfaces/user.interface";
import type { AccessoryInterface } from "@features/equipment/types/accessory.interface";
import type { CameraInterface } from "@features/equipment/types/camera.interface";
import type { FilterInterface } from "@features/equipment/types/filter.interface";
import type { MountInterface } from "@features/equipment/types/mount.interface";
import type { SoftwareInterface } from "@features/equipment/types/software.interface";
import type { TelescopeInterface } from "@features/equipment/types/telescope.interface";

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
