import { ImageInterface } from "@shared/interfaces/image.interface";
import { TelescopeInterface as TelescopeInterface2 } from "@features/equipment/types/telescope.interface";
import { CameraInterface as CameraInterface2 } from "@features/equipment/types/camera.interface";

export interface BaseQueueEntryImageInterface extends Omit<ImageInterface, "imagingTelescopes2" | "imagingCameras2"> {
  imagingTelescopes2: TelescopeInterface2["id"][];
  imagingCameras2: CameraInterface2["id"][];
}
