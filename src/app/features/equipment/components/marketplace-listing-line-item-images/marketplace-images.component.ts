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

    this.sliderImages = this.images.map(image => {
      let url: string;
      let thumbnailUrl: string;

      if (UtilsService.isString(image)) {
        url = image;
        thumbnailUrl = image;
      } else if (image.hasOwnProperty("imageFile")) {
        // This is a MarketplaceImageInterface.
        url = image.imageFile;
        thumbnailUrl = image.thumbnailFile || url;
      } else {
        // This is an image coming from the file uploader.
        url = image.url.changingThisBreaksApplicationSecurity;
        thumbnailUrl = url;
      }

      return ({
        image: url,
        thumbImage: thumbnailUrl
      });
    });
  }
}
