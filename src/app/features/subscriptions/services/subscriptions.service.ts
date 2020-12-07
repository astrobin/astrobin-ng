import { Injectable } from "@angular/core";
import { PayableProductInterface } from "@features/subscriptions/interfaces/payable-product.interface";
import { TranslateService } from "@ngx-translate/core";
import { JsonApiService } from "@shared/services/api/classic/json/json-api.service";
import { SubscriptionName } from "@shared/types/subscription-name.type";
import * as countryJs from "country-js";
import { take } from "rxjs/operators";

@Injectable({
  providedIn: "root"
})
export class SubscriptionsService {
  currency: string;

  constructor(public readonly translate: TranslateService, public readonly jsonApiService: JsonApiService) {
    this.jsonApiService
      .getBackendConfig$()
      .pipe(take(1))
      .subscribe(config => {
        const country = config.REQUEST_COUNTRY;
        const results = countryJs.search(country);
        const defaultCurrency = "USD";

        if (results.length === 0) {
          this.currency = defaultCurrency;
        } else {
          this.currency = results[0].currency.currencyCode;
        }

        if (["USD", "EUR", "GBP", "CAD", "AUD", "CHF"].indexOf(this.currency) === -1) {
          this.currency = defaultCurrency;
        }
      });
  }

  getName(product: PayableProductInterface): string {
    const resultMap = {
      [PayableProductInterface.LITE]: "Lite",
      [PayableProductInterface.PREMIUM]: "Premium",
      [PayableProductInterface.ULTIMATE]: "Ultimate"
    };

    return resultMap[product];
  }

  getPrice(product: PayableProductInterface): number {
    const lite = {
      USD: 22.4,
      EUR: 18.6,
      GBP: 17,
      CAD: 28.8,
      AUD: 30.4,
      CHF: 20
    };

    const premium = {
      USD: 44.8,
      EUR: 37.2,
      GBP: 34,
      CAD: 57.6,
      AUD: 60.8,
      CHF: 40
    };

    const ultimate = {
      USD: 67.2,
      EUR: 55.8,
      GBP: 51,
      CAD: 86.4,
      AUD: 91.2,
      CHF: 60
    };

    const resultMap = {
      [PayableProductInterface.LITE]: lite[this.currency],
      [PayableProductInterface.PREMIUM]: premium[this.currency],
      [PayableProductInterface.ULTIMATE]: ultimate[this.currency]
    };

    return resultMap[product];
  }

  getSameTierOrAbove(product: PayableProductInterface): SubscriptionName[] {
    const resultMap = {
      [PayableProductInterface.LITE]: [
        SubscriptionName.ASTROBIN_LITE,
        SubscriptionName.ASTROBIN_LITE_AUTORENEW,
        SubscriptionName.ASTROBIN_LITE_2020,
        SubscriptionName.ASTROBIN_PREMIUM,
        SubscriptionName.ASTROBIN_PREMIUM_AUTORENEW,
        SubscriptionName.ASTROBIN_PREMIUM_2020,
        SubscriptionName.ASTROBIN_ULTIMATE_2020
      ],
      [PayableProductInterface.PREMIUM]: [
        SubscriptionName.ASTROBIN_PREMIUM,
        SubscriptionName.ASTROBIN_PREMIUM_AUTORENEW,
        SubscriptionName.ASTROBIN_PREMIUM_2020,
        SubscriptionName.ASTROBIN_ULTIMATE_2020
      ],
      [PayableProductInterface.ULTIMATE]: [SubscriptionName.ASTROBIN_ULTIMATE_2020]
    };

    return resultMap[product];
  }

  getConversionId(product: PayableProductInterface): string {
    const resultMap = {
      [PayableProductInterface.LITE]: "LddRCIuvv-EBEJS5qawC",
      [PayableProductInterface.PREMIUM]: "-0o-CKetv-EBEJS5qawC",
      [PayableProductInterface.ULTIMATE]: "pDXJCMvpo-EBEJS5qawC"
    };

    return resultMap[product];
  }

  maxUploadsMessage(max: number): string {
    return this.translate.instant("Max. {{ max }} uploads", { max });
  }

  maxImagesMessage(max: number): string {
    return this.translate.instant("Max. {{ max }} total images", { max });
  }

  maxSizeMessage(max: number): string {
    return this.translate.instant("Max. {{ max }} MB / image", { max });
  }

  maxRevisionsMessage(max: number): string {
    return this.translate.instant("{{ max }} revisions / image", { max });
  }
}
