import { Component, Input, OnChanges } from "@angular/core";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { MarketplaceLineItemInterface } from "@features/equipment/types/marketplace-line-item.interface";
import { Store } from "@ngrx/store";
import { State } from "@app/store/state";
import { UtilsService } from "@shared/services/utils/utils.service";

@Component({
  selector: "astrobin-marketplace-listing-line-item-images",
  templateUrl: "./marketplace-images.component.html",
  styleUrls: ["./marketplace-images.component.scss"]
})
export class MarketplaceImagesComponent extends BaseComponentDirective implements OnChanges {
  readonly UtilsService = UtilsService;

  sliderImages: Array<object> = [];

  @Input()
  images: MarketplaceLineItemInterface["images"];

  constructor(public readonly store$: Store<State>) {
    super(store$);
  }

  ngOnChanges() {
    if (!this.images) {
      this.sliderImages = [];
      return;
    }

    if (UtilsService.isObject(this.images)) {
      const keys = Object.keys(this.images);

      if (keys.length === 0) {
        this.sliderImages = [];
        return;
      }

      for (const key of Object.keys(this.images)) {
        if (this.images[key] === undefined) {
          continue;
        }

        let url: string;

        if (UtilsService.isString(this.images[key])) {
          // The image is coming from the initialized form.
          url = this.images[key];
        } else {
          // The image is coming from the uploader.
          url = this.images[key][0].url.changingThisBreaksApplicationSecurity;
        }

        this.sliderImages.push({
          image: url,
          thumbImage: url
        });
      }
    }
  }
}
