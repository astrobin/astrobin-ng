import { ImageInterface } from "@shared/interfaces/image.interface";

export interface ImageSearchInterface {
  objectId: ImageInterface["pk"];
  hash: string | null;
  title: string | null;
  description: string | null;
  published: string;

  allSensors: string[];
  imagingSensors: string[];
  guidingSensors: string[];
  allTelescopes2: string[];
  imagingTelescopes2: string[];
  guidingTelescopes2: string[];
  mounts2: string[];
  filters2: string[];
  accessories2: string[];
  software2: string[];
  allCameras2: string[];
  imagingCameras2: string[];
  guidingCameras2: string[];

  allSensorsId: string[];
  imagingSensorsId: string[];
  guidingSensorsId: string[];
  allTelescopes2Id: string[];
  imagingTelescopes2Id: string[];
  guidingTelescopes2Id: string[];
  mounts2Id: string[];
  filters2Id: string[];
  accessories2Id: string[];
  software2Id: string[];
  allCameras2Id: string[];
  imagingCameras2Id: string[];
  guidingCameras2Id: string[];

  likes: number;
  w: number;
  h: number;
  galleryThumbnail: string;
}
