import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, TemplateRef } from "@angular/core";
import { ImageViewerSectionBaseComponent } from "@shared/components/misc/image-viewer/image-viewer-section-base.component";
import { Store } from "@ngrx/store";
import { MainState } from "@app/store/state";
import { SearchService } from "@core/services/search.service";
import { Router } from "@angular/router";
import { ImageViewerService } from "@core/services/image-viewer.service";
import { WindowRefService } from "@core/services/window-ref.service";
import { CookieService } from "ngx-cookie";
import { CollapseSyncService } from "@core/services/collapse-sync.service";

@Component({
  selector: "astrobin-image-viewer-custom-message-banner",
  template: `
    <div
      class="image-viewer-banner alert alert-{{ alertClass }} d-flex align-items-center gap-2"
    >
      <ng-container [ngTemplateOutlet]="messageTemplate"></ng-container>
    </div>
  `,
  styleUrls: ["./image-viewer-custom-message-banner.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ImageViewerCustomMessageBannerComponent extends ImageViewerSectionBaseComponent {
  @Input() messageTemplate: TemplateRef<any>;
  @Input() alertClass = "info"

  public constructor(
    public readonly store$: Store<MainState>,
    public readonly searchService: SearchService,
    public readonly router: Router,
    public readonly imageViewerService: ImageViewerService,
    public readonly windowRefService: WindowRefService,
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
