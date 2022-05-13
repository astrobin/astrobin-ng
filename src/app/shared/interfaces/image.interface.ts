import { ImageThumbnailInterface } from "@shared/interfaces/image-thumbnail.interface";
import { TelescopeInterface } from "@shared/interfaces/telescope.interface";
import { CameraInterface } from "@shared/interfaces/camera.interface";
import { UserInterface } from "@shared/interfaces/user.interface";
import { FocalReducerInterface } from "@shared/interfaces/focal-reducer.interface";
import { MountInterface } from "@shared/interfaces/mount.interface";
import { AccessoryInterface } from "@shared/interfaces/accessory.interface";
import { SoftwareInterface } from "@shared/interfaces/software.interface";

import { TelescopeInterface as TelescopeInterface2 } from "@features/equipment/types/telescope.interface";
import { CameraInterface as CameraInterface2 } from "@features/equipment/types/camera.interface";
import { MountInterface as MountInterface2 } from "@features/equipment/types/mount.interface";
import { FilterInterface as FilterInterface2 } from "@features/equipment/types/filter.interface";
import { AccessoryInterface as AccessoryInterface2 } from "@features/equipment/types/accessory.interface";
import { SoftwareInterface as SoftwareInterface2 } from "@features/equipment/types/software.interface";
import { GroupInterface } from "@shared/interfaces/group.interface";

export enum AcquisitionType {
  REGULAR = "REGULAR",
  EAA = "EAA",
  LUCKY = "LUCKY",
  DRAWING = "DRAWING",
  OTHER = "OTHER"
}

export enum SubjectType {
  DEEP_SKY = "DEEP_SKY",
  SOLAR_SYSTEM = "SOLAR_SYSTEM",
  WIDE_FIELD = "WIDE_FIELD",
  STAR_TRAILS = "STAR_TRAILS",
  NORTHERN_LIGHTS = "NORTHERN_LIGHTS",
  NOCTILUCENT_CLOUDS = "NOCTILUCENT_CLOUDS",
  GEAR = "GEAR",
  OTHER = "OTHER"
}

export enum SolarSystemSubjectType {
  SUN = "SUN",
  MOON = "MOON",
  MERCURY = "MERCURY",
  VENUS = "VENUS",
  MARS = "MARS",
  JUPITER = "JUPITER",
  SATURN = "SATURN",
  URANUS = "URANUS",
  NEPTUNE = "NEPTUNE",
  MINOR_PLANET = "MINOR_PLANET",
  COMET = "COMET",
  OCCULTATION = "OCCULTATION",
  CONJUNCTION = "CONJUNCTION",
  PARTIAL_LUNAR_ECLIPSE = "PARTIAL_LUNAR_ECLIPSE",
  TOTAL_LUNAR_ECLIPSE = "TOTAL_LUNAR_ECLIPSE",
  PARTIAL_SOLAR_ECLIPSE = "PARTIAL_SOLAR_ECLIPSE",
  ANULAR_SOLAR_ECLIPSE = "ANULAR_SOLAR_ECLIPSE",
  TOTAL_SOLAR_ECLIPSE = "TOTAL_SOLAR_ECLIPSE",
  METEOR_SHOWER = "METEOR_SHOWER",
  OTHER = "OTHER"
}

export enum DataSource {
  BACKYARD = "BACKYARD",
  TRAVELLER = "TRAVELLER",
  OWN_REMOTE = "OWN_REMOTE",
  AMATEUR_HOSTING = "AMATEUR_HOSTING",
  PUBLIC_AMATEUR_DATA = "PUBLIC_AMATEUR_DATA",
  PRO_DATA = "PRO_DATA",
  MIX = "MIX",
  OTHER = "OTHER",
  UNKNOWN = "UNKNOWN"
}

export enum RemoteSource {
  AC = "AstroCamp",
  AHK = "Astro Hostel Krasnodar",
  AOWA = "Astro Observatories Western Australia",
  CS = "ChileScope",
  DSNM = "Dark Sky New Mexico",
  DSP = "Dark Sky Portal",
  DSV = "Deepsky Villa",
  DSC = "DeepSkyChile",
  DSW = "DeepSkyWest",
  eEyE = "e-EyE Extremadura",
  EITS = "Eye In The Sky",
  GFA = "Goldfield Astronomical Observatory",
  GMO = "Grand Mesa Observatory",
  HAKOS = "Hakos Astro Farm",
  HMO = "Heaven's Mirror Observatory",
  IC = "IC Astronomy Observatories",
  ITU = "Image The Universe",
  INS = "Insight Observatory",
  ITELESCO = "iTelescope",
  LGO = "Lijiang Gemini Observatory",
  MARIO = "Marathon Remote Imaging Observatory (MaRIO)",
  NMS = "New Mexico Skies",
  OES = "Observatorio El Sauce",
  PSA = "PixelSkies",
  REM = "RemoteSkies.net",
  REMSG = "Remote Skygems",
  RLD = "Riverland Dingo Observatory",
  ROBO = "RoboScopes",
  SS = "Sahara Sky",
  SPVO = "San Pedro Valley Observatory",
  SRO = "Sierra Remote Observatories",
  SRO2 = "Sky Ranch Observatory",
  SPOO = "SkyPi Remote Observatory",
  SLO = "Slooh",
  SSLLC = "Stellar Skies LLC",
  TAIYUGE = "TaiYuge Observatory",
  TELI = "Telescope Live",
  WTO = "West Texas Observatory (WTO)",
  YUNLING = "Yunling Observatory"
}

export enum LicenseOptions {
  ALL_RIGHTS_RESERVED = "ALL_RIGHTS_RESERVED",
  ATTRIBUTION_NON_COMMERCIAL_SHARE_ALIKE = "ATTRIBUTION_NON_COMMERCIAL_SHARE_ALIKE",
  ATTRIBUTION_NON_COMMERCIAL = "ATTRIBUTION_NON_COMMERCIAL",
  ATTRIBUTION_NON_COMMERCIAL_NO_DERIVS = "ATTRIBUTION_NON_COMMERCIAL_NO_DERIVS",
  ATTRIBUTION = "ATTRIBUTION",
  ATTRIBUTION_SHARE_ALIKE = "ATTRIBUTION_SHARE_ALIKE",
  ATTRIBUTION_NO_DERIVS = "ATTRIBUTION_NO_DERIVS"
}

export enum MouseHoverImageOptions {
  NOTHING = "NOTHING",
  SOLUTION = "SOLUTION",
  INVERTED = "INVERTED"
}

export enum WatermarkPositionOptions {
  CENTER,
  TOP_LEFT,
  TOP_CENTER,
  TOP_RIGHT,
  BOTTOM_LEFT,
  BOTTOM_CENTER,
  BOTTOM_RIGHT
}

export enum WatermarkSizeOptions {
  SMALL = "S",
  MEDIUM = "M",
  LARGE = "L"
}

export enum FullSizeLimitationDisplayOptions {
  EVERYBODY = "EVERYBODY",
  PAYING = "PAYING",
  MEMBERS = "MEMBERS",
  ME = "ME",
  NOBODY = "NOBODY"
}

export enum DownloadLimitationOptions {
  EVERYBODY = "EVERYBODY",
  ME_ONLY = "ME"
}

export interface ImageInterface {
  pk: number;
  user: UserInterface["id"];
  hash: string;
  title: string;
  imageFile: string;
  isWip: boolean;
  skipNotifications: boolean;
  w: number;
  h: number;
  imagingTelescopes: TelescopeInterface[];
  imagingCameras: CameraInterface[];
  guidingTelescopes: TelescopeInterface[];
  guidingCameras: CameraInterface[];
  focalReducers: FocalReducerInterface[];
  mounts: MountInterface[];
  accessories: AccessoryInterface[];
  software: SoftwareInterface[];
  imagingTelescopes2: TelescopeInterface2[];
  imagingCameras2: CameraInterface2[];
  guidingTelescopes2: TelescopeInterface2[];
  guidingCameras2: CameraInterface2[];
  mounts2: MountInterface2[];
  filters2: FilterInterface2[];
  accessories2: AccessoryInterface2[];
  software2: SoftwareInterface2[];
  published: string;
  license: string;
  description?: string;
  descriptionBbcode?: string;
  link?: string;
  linkToFits?: string;
  acquisitionType: AcquisitionType;
  subjectType: SubjectType;
  solarSystemMainSubject?: SolarSystemSubjectType;
  dataSource: DataSource;
  remoteSource?: string;
  partOfGroupSet: GroupInterface["id"][];
  mouseHoverImage: MouseHoverImageOptions;
  allowComments: boolean;
  squareCropping: string;
  watermark: boolean;
  watermarkText?: string;
  watermarkPosition?: WatermarkPositionOptions;
  watermarkSize?: WatermarkSizeOptions;
  watermarkOpacity?: number;
  sharpenThumbnails: boolean;
  keyValueTags: string;
  locations: number[];
  fullSizeDisplayLimitation: FullSizeLimitationDisplayOptions;
  downloadLimitation: DownloadLimitationOptions;
  thumbnails: ImageThumbnailInterface[];

  // Ephemeral form fields
  showGuidingEquipment?: boolean;
}

export interface ImageRevisionInterface {
  pk: number;
  uploaded: string;
  image: ImageInterface["pk"];
  imageFile: string;
  title: string;
  description: string;
  skipNotifications: boolean;
  label: string;
  isFinal: boolean;
  w: number;
  h: number;
  uploaderInProgress: boolean;
}
