import { Injectable } from "@angular/core";
import { PayableProductInterface } from "@features/subscriptions/interfaces/payable-product.interface";
import { TranslateService } from "@ngx-translate/core";
import { SubscriptionName } from "@shared/types/subscription-name.type";

@Injectable({
  providedIn: "root"
})
export class SubscriptionsService {
  constructor(public readonly translate: TranslateService) {}

  getName(product: PayableProductInterface): string {
    const resultMap = {
      [PayableProductInterface.LITE]: "AstroBin Lite",
      [PayableProductInterface.PREMIUM]: "AstroBin Premium",
      [PayableProductInterface.ULTIMATE]: "AstroBin Ultimate"
    };

    return resultMap[product];
  }

  getPrice(product: PayableProductInterface): number {
    const resultMap = {
      [PayableProductInterface.LITE]: 20,
      [PayableProductInterface.PREMIUM]: 40,
      [PayableProductInterface.ULTIMATE]: 60
    };

    return resultMap[product];
  }

  getApplicableSubscriptionNames(product: PayableProductInterface): SubscriptionName[] {
    const resultMap = {
      [PayableProductInterface.LITE]: [
        SubscriptionName.ASTROBIN_LITE,
        SubscriptionName.ASTROBIN_LITE_AUTORENEW,
        SubscriptionName.ASTROBIN_LITE_2020
      ],
      [PayableProductInterface.PREMIUM]: [
        SubscriptionName.ASTROBIN_PREMIUM,
        SubscriptionName.ASTROBIN_PREMIUM_AUTORENEW,
        SubscriptionName.ASTROBIN_PREMIUM_2020
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
