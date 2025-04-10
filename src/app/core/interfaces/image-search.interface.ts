import { ImageInterface } from "@core/interfaces/image.interface";

export interface ImageSearchInterface {
  objectId: ImageInterface["pk"];
  hash: string | null;
  title: string | null;
  description: string | null;
  published: string;
  squareCropping: string | null;

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
  bookmarks: number;
  comments: number;
  views: number;
  integration: number;
  fieldRadius: number;
  pixelScale: number;
  coordRaMin: number;
  coordRaMax: number;
  coordDecMin: number;
  coordDecMax: number;
  w: number;
  h: number;
  finalW: number;
  finalH: number;
  galleryThumbnail: string;
  regularThumbnail: string;
  hdThumbnail: string;

  video: boolean;
  animated: boolean;
  isIotd: boolean;
  isTopPick: boolean;
  isTopPickNomination: boolean;
  username: string;
  userDisplayName: string;
  collaboratorIds: number[];
}
