import { AppState } from "@app/store/reducers/app.reducers";
import { BackendConfigGenerator } from "@shared/generators/backend-config.generator";
import { SubscriptionGenerator } from "@shared/generators/subscription.generator";
import { TestConstants } from "@shared/test-constants";
import { SubscriptionName } from "@core/types/subscription-name.type";

export class AppStateGenerator {
  static default(): AppState {
    return {
      initialized: true,
      breadcrumb: [],
      language: "en",
      subscriptions: [
        SubscriptionGenerator.subscription(
          TestConstants.ASTROBIN_ULTIMATE_2020_ID,
          SubscriptionName.ASTROBIN_ULTIMATE_2020
        ),
        SubscriptionGenerator.subscription(
          TestConstants.ASTROBIN_PREMIUM_2020_ID,
          SubscriptionName.ASTROBIN_PREMIUM_2020
        ),
        SubscriptionGenerator.subscription(TestConstants.ASTROBIN_PREMIUM_ID, SubscriptionName.ASTROBIN_PREMIUM),
        SubscriptionGenerator.subscription(
          TestConstants.ASTROBIN_PREMIUM_AUTORENEW_ID,
          SubscriptionName.ASTROBIN_PREMIUM_AUTORENEW
        ),
        SubscriptionGenerator.subscription(TestConstants.ASTROBIN_LITE_2020_ID, SubscriptionName.ASTROBIN_LITE_2020),
        SubscriptionGenerator.subscription(TestConstants.ASTROBIN_LITE_ID, SubscriptionName.ASTROBIN_LITE),
        SubscriptionGenerator.subscription(
          TestConstants.ASTROBIN_LITE_AUTORENEW_ID,
          SubscriptionName.ASTROBIN_LITE_AUTORENEW
        )
      ],
      backendConfig: BackendConfigGenerator.backendConfig(),
      requestCountry: "us",
      currentFullscreenImage: null,
      currentFullscreenImageEvent: null,
      contentTypes: [],
      images: [],
      thumbnails: [],
      solutions: [],
      telescopes: [],
      cameras: [],
      createLocationAddTag: null,
      nestedComments: null,
      toggleProperties: [],
      remoteSourceAffiliates: [],
      groups: [],
      collections: [],
      solutionMatrices: {},
      solutionMatricesLoading: new Set<number>(),
    };
  }
}
