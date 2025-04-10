import { ImageAlias } from "@core/enums/image-alias.enum";
import { BackendConfigInterface } from "@core/interfaces/backend-config.interface";

export class BackendConfigGenerator {
  static backendConfig(): BackendConfigInterface {
    return {
      i18nHash: "bc587c72ede144236ed01f2f5f8b290e",
      readOnly: false,
      PREMIUM_MAX_IMAGES_FREE: 10,
      PREMIUM_MAX_IMAGES_LITE: 12,
      PREMIUM_MAX_IMAGES_FREE_2020: 10,
      PREMIUM_MAX_IMAGES_LITE_2020: 50,
      PREMIUM_MAX_IMAGES_PREMIUM_2020: 999999,
      PREMIUM_MAX_IMAGE_SIZE_FREE_2020: 1024 * 1024 * 25,
      PREMIUM_MAX_IMAGE_SIZE_LITE_2020: 1024 * 1024 * 25,
      PREMIUM_MAX_IMAGE_SIZE_PREMIUM_2020: 1024 * 1024 * 50,
      PREMIUM_MAX_REVISIONS_FREE_2020: 0,
      PREMIUM_MAX_REVISIONS_LITE_2020: 1,
      PREMIUM_MAX_REVISIONS_PREMIUM_2020: 5,
      PREMIUM_PRICE_FREE_2020: 0,
      PREMIUM_PRICE_LITE_2020: 20,
      PREMIUM_PRICE_PREMIUM_2020: 40,
      PREMIUM_PRICE_ULTIMATE_2020: 60,
      MAX_IMAGE_PIXELS: 16536 * 16536,
      MAX_FILE_SIZE: 2147483647,
      GOOGLE_ADS_ID: "GOOGLE_ADS_1234",
      IMAGE_CONTENT_TYPE_ID: 1,
      THUMBNAIL_ALIASES: {
        [ImageAlias.REGULAR]: {
          size: [620, 0]
        },
        [ImageAlias.GALLERY]: {
          size: [130, 130]
        }
      },
      IOTD_JUDGEMENT_WINDOW_DAYS: 2,
      IOTD_SUBMISSION_MAX_PER_DAY: 3,
      IOTD_REVIEW_WINDOW_DAYS: 5,
      IOTD_REVIEW_MAX_PER_DAY: 3,
      IOTD_SUBMISSION_WINDOW_DAYS: 7,
      IOTD_JUDGEMENT_MAX_PER_DAY: 1,
      IOTD_JUDGEMENT_MAX_FUTURE_DAYS: 7,
      IOTD_QUEUES_PAGE_SIZE: 10,
      IOTD_MAX_DISMISSALS: 5,
      IOTD_SUBMISSION_MIN_PROMOTIONS: 3,
      IOTD_REVIEW_MIN_PROMOTIONS: 3,
      IOTD_DESIGNATED_SUBMITTERS_PERCENTAGE: 50,
      IMAGE_UPLOAD_ENDPOINT: "/api/v2/images/image-upload/",
      IMAGE_REVISION_UPLOAD_ENDPOINT: "/api/v2/images/image-revision-upload/",
      DATA_UPLOAD_MAX_MEMORY_SIZE: 10 * 1024 * 1024,
      STRIPE_CUSTOMER_PORTAL_KEY: "abc123"
    };
  }
}
