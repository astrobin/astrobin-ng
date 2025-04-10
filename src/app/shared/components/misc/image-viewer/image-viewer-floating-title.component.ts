import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from "@angular/core";
import { Router } from "@angular/router";
import type { MainState } from "@app/store/state";
import { CollapseSyncService } from "@core/services/collapse-sync.service";
import { DeviceService } from "@core/services/device.service";
import { ImageViewerService } from "@core/services/image-viewer.service";
import { SearchService } from "@core/services/search.service";
import { WindowRefService } from "@core/services/window-ref.service";
import { Store } from "@ngrx/store";
import { ImageViewerSectionBaseComponent } from "@shared/components/misc/image-viewer/image-viewer-section-base.component";
import { CookieService } from "ngx-cookie";

@Component({
  selector: "astrobin-image-viewer-floating-title",
  template: `
    <div
      class="
      d-flex
      flex-nowrap
      gap-3
      justify-content-between
      align-items-center
    "
    >
      <div class="image-title">
        {{ image.title }}
      </div>
      <astrobin-image-viewer-social-buttons
        [image]="image"
        [showShare]="deviceService.mdMin()"
      ></astrobin-image-viewer-social-buttons>
    </div>
  `,
  styleUrls: ["./image-viewer-floating-title.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ImageViewerFloatingTitleComponent extends ImageViewerSectionBaseComponent {
  public constructor(
    public readonly store$: Store<MainState>,
    public readonly searchService: SearchService,
    public readonly router: Router,
    public readonly imageViewerService: ImageViewerService,
    public readonly windowRefService: WindowRefService,
    public readonly deviceService: DeviceService,
    public readonly cookieService: CookieService,
    public readonly collapseSyncService: CollapseSyncService,
    public readonly changeDetectorRef: ChangeDetectorRef
  ) {
    super(
      store$,
      searchService,
      router,
      imageViewerService,
      windowRefService,
      cookieService,
      collapseSyncService,
      changeDetectorRef
    );
  }
}
