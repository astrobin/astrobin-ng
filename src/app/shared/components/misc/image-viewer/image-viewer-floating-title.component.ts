import { Component } from "@angular/core";
import { ImageViewerSectionBaseComponent } from "@shared/components/misc/image-viewer/image-viewer-section-base.component";
import { Store } from "@ngrx/store";
import { MainState } from "@app/store/state";
import { SearchService } from "@features/search/services/search.service";
import { Router } from "@angular/router";
import { ImageViewerService } from "@shared/services/image-viewer.service";
import { WindowRefService } from "@shared/services/window-ref.service";
import { DeviceService } from "@shared/services/device.service";

@Component({
  selector: "astrobin-image-viewer-floating-title",
  template: `
    <div class="
      d-flex
      flex-nowrap
      gap-3
      justify-content-between
      align-items-center
    ">
      <div class="image-title">
        {{ image.title }}
      </div>
      <astrobin-image-viewer-social-buttons
        [image]="image"
        [showShare]="deviceService.mdMin()"
      ></astrobin-image-viewer-social-buttons>
    </div>
  `,
  styleUrls: ["./image-viewer-floating-title.component.scss"]
})
export class ImageViewerFloatingTitleComponent extends ImageViewerSectionBaseComponent {
  public constructor(
    public readonly store$: Store<MainState>,
    public readonly searchService: SearchService,
    public readonly router: Router,
    public readonly imageViewerService: ImageViewerService,
    public readonly windowRefService: WindowRefService,
    public readonly deviceService: DeviceService
  ) {
    super(store$, searchService, router, imageViewerService, windowRefService);
  }
}
