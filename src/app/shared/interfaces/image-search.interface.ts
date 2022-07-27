import { ImageInterface } from "@shared/interfaces/image.interface";

export interface ImageSearchInterface {
  objectId: ImageInterface["pk"];
  hash: string | null;
  title: string | null;
  description: string | null;
  published: string;
  imagingTelescopes2: string[];
  guidingTelescopes2: string[];
  mounts2: string[];
  filters2: string[];
  accessories2: string[];
  software2: string[];
  imagingCameras2: string[];
  guidingCameras2: string[];
  likes: number;
  w: number;
  h: number;
  galleryThumbnail: string;
}
