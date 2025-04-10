import { OnChanges, Component, Input } from "@angular/core";
import { MainState } from "@app/store/state";
import { UtilsService } from "@core/services/utils/utils.service";
import { MarketplaceLineItemInterface } from "@features/equipment/types/marketplace-line-item.interface";
import { Store } from "@ngrx/store";
import { TranslateService } from "@ngx-translate/core";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { IAlbum, Lightbox } from "ngx-lightbox";

@Component({
  selector: "astrobin-marketplace-listing-line-item-images",
  templateUrl: "./marketplace-images.component.html",
  styleUrls: ["./marketplace-images.component.scss"]
})
export class MarketplaceImagesComponent extends BaseComponentDirective implements OnChanges {
  readonly UtilsService = UtilsService;

  sliderImages: IAlbum[] = [];

  @Input()
  images: MarketplaceLineItemInterface["images"];

  constructor(
    public readonly store$: Store<MainState>,
    public readonly translateService: TranslateService,
    public readonly lightbox: Lightbox
  ) {
    super(store$);
  }

  ngOnChanges() {
    if (!this.images) {
      this.sliderImages = [];
      return;
    }

    this.sliderImages = this.images.map((image, index) => {
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

      return {
        src: url,
        thumb: thumbnailUrl,
        caption: this.translateService.instant("Image") + " " + (index + 1)
      };
    });
  }

  protected openImage(index: number) {
    this.lightbox.open(this.sliderImages, index);
  }
}
