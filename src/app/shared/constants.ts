export class Constants {
  static readonly AUTO_REFRESH_INTERVAL = 30000;
  static readonly ALLOWED_UPLOAD_EXTENSIONS = [
    ".jpg",
    ".jpeg",
    ".png",
    ".gif",
    ".tif",
    ".tiff",
    ".mov",
    ".mpg",
    ".mpeg",
    ".mp4",
    ".avi",
    ".wmv",
    ".webm"
  ];
  static readonly ALLOWED_UNCOMPRESSED_SOURCE_UPLOAD_EXTENSIONS = [
    ".xisf",
    ".fits",
    ".fit",
    ".fts",
    ".tif",
    ".tiff",
    ".psd"
  ];
  static readonly NO_VALUE = "NO_VALUE";
  static readonly ORIGINAL_REVISION = "0";
  static readonly SUPPORTED_CURRENCIES = ["USD", "EUR", "GBP", "CAD", "AUD", "CHF", "CNY"];
  static readonly USE_HIGH_CONTRAST_THEME_COOKIE = "astrobin_use_high_contrast_theme";
  static readonly OWN_EQUIPMENT_MIGRATORS_GROUP = "own_equipment_migrators";
  static readonly EQUIPMENT_MODERATORS_GROUP = "equipment_moderators";
  static readonly COOKIE_CONSENT_COOKIE = "astrobin_cookie_consent";
  static readonly COOKIE_CONSENT_DECLINE = "-1";
  static readonly GOOGLE_ANALYTICS_ID = "UA-844985-10";
  static readonly GOOGLE_TAG_MANAGER_ID = "GTM-KFP9R82";
}
