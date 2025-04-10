import type { ImageMaxZoom, WatermarkPositionOptions, WatermarkSizeOptions } from "@core/interfaces/image.interface";
import type { LocationInterface } from "@core/interfaces/location.interface";

export enum FrontpageSection {
  GLOBAL = "global",
  PERSONAL = "personal",
  RECENT = "recent",
  FOLLOWED = "followed"
}

export enum DefaultGallerySortingOption {
  PUBLICATION,
  ACQUISITION,
  SUBJECT_TYPE,
  YEAR,
  GEAR,
  COLLECTIONS,
  TITLE,
  CONSTELLATION
}

export interface UserProfileInterface {
  id: number;
  deleted: Date;
  updated: Date;
  username: string;
  realName: string;
  website: string;
  job: string;
  hobbies: string;
  timezone: string;
  about: string;
  premiumOffer: string;
  premiumOfferExpiration: Date;
  premiumOfferSent: Date;
  companyName: string;
  companyDescription: string;
  companyWebsite: string;
  retailerCountry: string;
  avatar: string;
  excludeFromCompetition: boolean;
  defaultFrontpageSection: FrontpageSection;
  defaultGallerySorting: DefaultGallerySortingOption;
  defaultLicense: number;
  defaultWatermarkText: string;
  defaultWatermark: boolean;
  defaultWatermarkSize: WatermarkSizeOptions;
  defaultWatermarkPosition: WatermarkPositionOptions;
  defaultWatermarkOpacity: number;
  defaultMaxZoom: ImageMaxZoom | null;
  defaultAllowImageAdjustmentsWidget: boolean | null;
  acceptTos: boolean;
  openNotificationsInNewTab: boolean | null;
  receiveNewsletter: boolean;
  receiveImportantCommunications: boolean;
  receiveMarketingAndCommercialMaterial: boolean;
  allowAstronomyAds: boolean;
  allowRetailerIntegration: boolean;
  inactiveAccountReminderSent: Date;
  language: string;
  seenRealName: boolean;
  seenEmailPermissions: boolean;
  signature: string;
  signatureHtml: string;
  showSignatures: boolean;
  postCount: number;
  autoSubscribe: boolean;
  receiveForumEmails: boolean;
  user: number;
  telescopes: number[];
  mounts: number[];
  cameras: number[];
  focalReducers: number[];
  software: number[];
  filters: number[];
  accessories: number[];
  astroBinIndex?: number;
  contributionIndex?: number;
  followers?: number;
  premiumCounter: number;
  locations: LocationInterface[];
  email?: string;
  signUpCountry?: string;
  agreedToMarketplaceTerms?: string;
  enableNewSearchExperience?: boolean;
  enableNewGalleryExperience?: boolean;
  agreedToIotdTpRulesAndGuidelines?: boolean;
  galleryHeaderImage?: string;
  imageCount: number;
  wipImageCount: number;
  followersCount: number;
  followingCount: number;
  displayCollectionsOnPublicGallery?: boolean;
  displayWipImagesOnPublicGallery?: boolean;
  allowAds?: boolean;
  suspended?: string;
  suspensionReason?: string;
  shadowBans: number[];
}

export interface UserProfileStatsInterface {
  stats: { 0: string; 1: string; 2?: string }[];
}
