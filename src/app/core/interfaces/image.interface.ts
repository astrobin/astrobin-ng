import type { AccessoryInterface } from "@core/interfaces/accessory.interface";
import type { CameraInterface } from "@core/interfaces/camera.interface";
import type { CollectionInterface } from "@core/interfaces/collection.interface";
import type { DeepSkyAcquisitionInterface } from "@core/interfaces/deep-sky-acquisition.interface";
import type { FilterInterface } from "@core/interfaces/filter.interface";
import type { FocalReducerInterface } from "@core/interfaces/focal-reducer.interface";
import type { GroupInterface } from "@core/interfaces/group.interface";
import type { ImageThumbnailInterface } from "@core/interfaces/image-thumbnail.interface";
import type { LocationInterface } from "@core/interfaces/location.interface";
import type { MountInterface } from "@core/interfaces/mount.interface";
import type { SoftwareInterface } from "@core/interfaces/software.interface";
import type { SolarSystemAcquisitionInterface } from "@core/interfaces/solar-system-acquisition.interface";
import type { SolutionInterface } from "@core/interfaces/solution.interface";
import type { TelescopeInterface } from "@core/interfaces/telescope.interface";
import type { UserInterface } from "@core/interfaces/user.interface";
import type { AccessoryInterface as AccessoryInterface2 } from "@features/equipment/types/accessory.interface";
import type { CameraInterface as CameraInterface2 } from "@features/equipment/types/camera.interface";
import type { FilterInterface as FilterInterface2 } from "@features/equipment/types/filter.interface";
import type { MountInterface as MountInterface2 } from "@features/equipment/types/mount.interface";
import type { SoftwareInterface as SoftwareInterface2 } from "@features/equipment/types/software.interface";
import type { TelescopeInterface as TelescopeInterface2 } from "@features/equipment/types/telescope.interface";

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
  LANDSCAPE = "LANDSCAPE",
  ARTIFICIAL_SATELLITE = "ARTIFICIAL_SATELLITE",
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
  AAAN = "AAA Gateway North",
  AAAS = "AAA Gateway South",
  ALNI = "Alnitak Remote Observatories",
  AC = "AstroCamp",
  AHK = "Astro Hostel Krasnodar",
  ACRES = "Astronomy Acres",
  AOWA = "Astro Observatories Western Australia",
  ATLA = "Atlaskies Observatory",
  CS = "ChileScope",
  DMA = "Dark Matters Astrophotography",
  DSNM = "Dark Sky New Mexico",
  DSP = "Dark Sky Portal",
  DSV = "Deepsky Villa",
  DSC = "DeepSkyChile",
  DSPR = "Deep Space Products Remote",
  DSW = "DeepSkyWest",
  eEyE = "e-EyE Extremadura",
  EITS = "Eye In The Sky",
  GFA = "Goldfield Astronomical Observatory",
  GMO = "Grand Mesa Observatory",
  HAKOS = "Hakos Astro Farm",
  HAWK = "HAWK Observatory",
  HELLAS = "Hellas-Sky",
  HCRO = "Howling Coyote Remote Observatories (HCRO)",
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
  SADR = "Sadr Astro Remote Observatory",
  SS = "Sahara Sky",
  SPVO = "San Pedro Valley Observatory",
  SRO = "Sierra Remote Observatories",
  SRO2 = "Sky Ranch Observatory",
  SPOO = "SkyPi Remote Observatory",
  SLO = "Slooh",
  SPI = "Spica",
  SSLLC = "Stellar Skies LLC",
  SKIESAWAY = "SkiesAway Remote Observatories",
  STARFRONT = "Starfront Observatories",
  TAIYUGE = "TaiYuge Observatory",
  TELI = "Telescope Live",
  TREV = "Trevinca Skies",
  UDRO = "Utah Desert Remote Observatories",
  WTO = "West Texas Observatory (WTO)",
  YINHE = "YinHe Observatory",
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

export enum CelestialHemisphere {
  NORTHERN = "N",
  SOUTHERN = "S"
}

export type ImageMaxZoom = 8 | 4 | 2 | 1;

export interface ImageInterface {
  pk: number;
  user: UserInterface["id"];
  username: UserInterface["username"];
  userDisplayName: UserInterface["displayName"];
  userAvatar: UserInterface["avatar"];
  allowAds?: boolean;
  pendingCollaborators: UserInterface["id"][] | null;
  collaborators: UserInterface[] | null;
  hash: string;
  title: string;
  imageFile?: string | null;
  videoFile?: string | null;
  encodedVideoFile: string | null;
  loopVideo: string | null;
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
  filters: FilterInterface[];
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
  uploaded: string;
  deleted: string | null;
  license: LicenseOptions;
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
  collections: CollectionInterface["id"][];
  mouseHoverImage: MouseHoverImageOptions | ImageRevisionInterface["label"];
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
  locationObjects: LocationInterface[];
  fullSizeDisplayLimitation: FullSizeLimitationDisplayOptions;
  maxZoom: ImageMaxZoom;
  defaultMaxZoom?: ImageMaxZoom;
  downloadLimitation: DownloadLimitationOptions;
  allowImageAdjustmentsWidget: boolean;
  defaultAllowImageAdjustmentsWidget?: boolean;
  thumbnails: ImageThumbnailInterface[];
  submittedForIotdTpConsideration: string | null;
  deepSkyAcquisitions: DeepSkyAcquisitionInterface[];
  solarSystemAcquisitions: SolarSystemAcquisitionInterface[];
  solution: SolutionInterface | null;
  revisions: ImageRevisionInterface[];
  constellation: string;
  isFinal: boolean;
  likeCount: number;
  bookmarkCount: number;
  commentCount: number;
  viewCount?: number;
  userFollowerCount: number;
  uploaderUploadLength?: number;
  uploaderName?: string;
  iotdDate?: string;
  isIotd?: boolean;
  isTopPick?: boolean;
  isTopPickNomination?: boolean;
  isInIotdQueue?: boolean;
  averageMoonAge?: number;
  averageMoonIllumination?: number;
  uncompressedSourceFile?: string;
  finalGalleryThumbnail?: string;
  isPlayable?: boolean; // Only set by the gallery serializer.
  detectedLanguage?: string;

  // Ephemeral form fields
  showGuidingEquipment?: boolean;
}

export interface ImageRevisionInterface {
  pk: number;
  uploaded: string;
  image: ImageInterface["pk"];
  imageFile: string | null;
  videoFile: string | null;
  encodedVideoFile: string | null;
  loopVideo: string | null;
  title: string;
  description: string;
  skipNotifications: boolean;
  label: string;
  isFinal: boolean;
  w: number;
  h: number;
  uploaderInProgress: boolean;
  uploaderUploadLength?: number;
  solution: SolutionInterface | null;
  constellation: string;
  thumbnails: ImageThumbnailInterface[];
  mouseHoverImage: MouseHoverImageOptions | ImageRevisionInterface["label"];
  squareCropping: string;
}

export const ORIGINAL_REVISION_LABEL = "0";
export const FINAL_REVISION_LABEL = "final";
