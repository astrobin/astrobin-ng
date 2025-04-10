import type { OnChanges, SimpleChanges } from "@angular/core";
import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from "@angular/core";
import { Router } from "@angular/router";
import type { MainState } from "@app/store/state";
import type { CameraInterface as LegacyCameraInterface } from "@core/interfaces/camera.interface";
import type { TelescopeInterface as LegacyTelescopeInterface } from "@core/interfaces/telescope.interface";
import { CollapseSyncService } from "@core/services/collapse-sync.service";
import { ImageService } from "@core/services/image/image.service";
import { ImageViewerService } from "@core/services/image-viewer.service";
import { SearchService } from "@core/services/search.service";
import { WindowRefService } from "@core/services/window-ref.service";
import type { CameraInterface } from "@features/equipment/types/camera.interface";
import type { TelescopeInterface } from "@features/equipment/types/telescope.interface";
import { Store } from "@ngrx/store";
import { TranslateService } from "@ngx-translate/core";
import { ImageViewerBaseEquipmentComponent } from "@shared/components/misc/image-viewer/image-viewer-base-equipment.component";
import { CookieService } from "ngx-cookie";

@Component({
  selector: "astrobin-image-viewer-guiding-equipment",
  template: `
    <ng-container *ngIf="hasGuidingEquipment">
      <div (click)="toggleCollapse()" [class.collapsed]="collapsed" class="metadata-header supports-collapsing">
        {{ "Guiding equipment" | translate }}
      </div>

      <div [collapsed]="collapsed" collapseAnimation class="metadata-section w-100">
        <div class="equipment-section">
          <table class="table table-sm table-mobile-support mb-0">
            <tbody>
              <ng-container *ngFor="let attr of guidingAttributes">
                <tr *ngIf="this[attr]?.length">
                  <th>
                    <div class="equipment-label">
                      {{ attrToLabel[attr] }}
                    </div>
                  </th>
                  <td>
                    <div class="equipment-container">
                      <astrobin-image-viewer-equipment-items
                        [attr]="attr"
                        [items]="this[attr]"
                        [enableKlassIcon]="false"
                        [attrToIcon]="attrToIcon"
                        [legacyEquipmentUrl]="legacyEquipmentUrl.bind(this)"
                        (equipmentItemClicked)="equipmentItemClicked($event.event, $event.item)"
                        (legacyEquipmentItemClicked)="legacyEquipmentItemClicked($event.event, $event.item)"
                      >
                      </astrobin-image-viewer-equipment-items>
                    </div>
                  </td>
                </tr>
              </ng-container>
            </tbody>
          </table>
        </div>
      </div>
    </ng-container>
  `,
  styleUrls: ["./image-viewer-equipment.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ImageViewerGuidingEquipmentComponent extends ImageViewerBaseEquipmentComponent implements OnChanges {
  hasGuidingEquipment: boolean;
  guidingTelescopes: TelescopeInterface[] = [];
  legacyGuidingTelescopes: LegacyTelescopeInterface[] = [];
  guidingCameras: CameraInterface[] = [];
  legacyGuidingCameras: LegacyCameraInterface[] = [];

  protected readonly guidingAttributes = [
    "guidingTelescopes",
    "legacyGuidingTelescopes",
    "guidingCameras",
    "legacyGuidingCameras"
  ];
  protected readonly attrToIcon = {
    guidingTelescopes: "telescope",
    legacyGuidingTelescopes: "telescope",
    guidingCameras: "camera",
    legacyGuidingCameras: "camera"
  };
  protected attrToLabel: { [key: string]: string };

  constructor(
    public readonly store$: Store<MainState>,
    public readonly searchService: SearchService,
    public readonly router: Router,
    public readonly imageViewerService: ImageViewerService,
    public readonly windowRefService: WindowRefService,
    public readonly imageService: ImageService,
    public readonly translateService: TranslateService,
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

  ngOnChanges(changes: SimpleChanges) {
    if (
      (changes.image && changes.image.currentValue) ||
      (changes.revisionLabel && changes.revisionLabel.currentValue)
    ) {
      const image = this.image;
      this.hasGuidingEquipment = this.imageService.hasGuidingEquipment(image);
      this.guidingTelescopes = image.guidingTelescopes2;
      this.legacyGuidingTelescopes = image.guidingTelescopes;
      this.guidingCameras = image.guidingCameras2;
      this.legacyGuidingCameras = image.guidingCameras;
    }

    this.attrToLabel = {
      guidingTelescopes: this.translateService.instant("Guiding optics"),
      legacyGuidingTelescopes: this.translateService.instant("Guiding optics"),
      guidingCameras:
        this.guidingCameras?.length > 1
          ? this.translateService.instant("Guiding cameras")
          : this.translateService.instant("Guiding camera"),
      legacyGuidingCameras:
        this.legacyGuidingCameras?.length > 1
          ? this.translateService.instant("Guiding cameras")
          : this.translateService.instant("Guiding camera")
    };
  }
}
