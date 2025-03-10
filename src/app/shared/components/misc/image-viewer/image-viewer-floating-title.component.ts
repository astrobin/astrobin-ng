import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from "@angular/core";
import { ImageViewerSectionBaseComponent } from "@shared/components/misc/image-viewer/image-viewer-section-base.component";
import { Store } from "@ngrx/store";
import { MainState } from "@app/store/state";
import { SearchService } from "@core/services/search.service";
import { Router } from "@angular/router";
import { ImageViewerService } from "@core/services/image-viewer.service";
import { WindowRefService } from "@core/services/window-ref.service";
import { DeviceService } from "@core/services/device.service";
import { CookieService } from "ngx-cookie";
import { CollapseSyncService } from "@core/services/collapse-sync.service";
import { MobilePageMenuService } from "@core/services/mobile-page-menu.service";

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
      <div class="d-flex align-items-center">
        <astrobin-image-viewer-social-buttons
          [image]="image"
          [showShare]="deviceService.mdMin()"
        ></astrobin-image-viewer-social-buttons>

        <button
          (click)="openMenu()"
          class="kebab-menu btn btn-link text-light px-2 ms-2"
        >
          <fa-icon icon="ellipsis-v"></fa-icon>
        </button>
      </div>
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
    public readonly changeDetectorRef: ChangeDetectorRef,
    private readonly mobilePageMenuService: MobilePageMenuService
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

  /**
   * Open the image menu (now using the offcanvas on all screen sizes)
   */
  openMenu(): void {
    // Simply tell the mobile page menu service to open the menu
    // The menu configuration was registered by the parent image viewer component
    this.mobilePageMenuService.openMenu();
  }
}
