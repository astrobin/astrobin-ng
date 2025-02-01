import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnChanges, SimpleChanges } from "@angular/core";
import { SearchService } from "@core/services/search.service";
import { Router } from "@angular/router";
import { MainState } from "@app/store/state";
import { Store } from "@ngrx/store";
import { ImageViewerService } from "@core/services/image-viewer.service";
import { TelescopeInterface as LegacyTelescopeInterface } from "@core/interfaces/telescope.interface";
import { CameraInterface as LegacyCameraInterface } from "@core/interfaces/camera.interface";
import { MountInterface as LegacyMountInterface } from "@core/interfaces/mount.interface";
import { FilterInterface as LegacyFilterInterface } from "@core/interfaces/filter.interface";
import { FocalReducerInterface as LegacyFocalReducerInterface } from "@core/interfaces/focal-reducer.interface";
import { AccessoryInterface as LegacyAccessoryInterface } from "@core/interfaces/accessory.interface";
import { SoftwareInterface as LegacySoftwareInterface } from "@core/interfaces/software.interface";
import { WindowRefService } from "@core/services/window-ref.service";
import { TelescopeInterface } from "@features/equipment/types/telescope.interface";
import { CameraInterface } from "@features/equipment/types/camera.interface";
import { MountInterface } from "@features/equipment/types/mount.interface";
import { FilterInterface } from "@features/equipment/types/filter.interface";
import { AccessoryInterface } from "@features/equipment/types/accessory.interface";
import { SoftwareInterface } from "@features/equipment/types/software.interface";
import { ImageService } from "@core/services/image/image.service";
import { TranslateService } from "@ngx-translate/core";
import { EquipmentService } from "@core/services/equipment.service";
import { CookieService } from "ngx-cookie";
import { CollapseSyncService } from "@core/services/collapse-sync.service";
import { ImageViewerBaseEquipmentComponent } from "@shared/components/misc/image-viewer/image-viewer-base-equipment.component";

@Component({
  selector: "astrobin-image-viewer-equipment",
  template: `
    <ng-container *ngIf="hasEquipment">
      <div
        *ngIf="hasGuidingEquipment"
        (click)="toggleCollapse()"
        [class.collapsed]="collapsed"
        class="metadata-header supports-collapsing"
      >
        {{ "Imaging equipment" | translate }}
      </div>

      <div
        *ngIf="!hasGuidingEquipment"
        (click)="toggleCollapse()"
        [class.collapsed]="collapsed"
        class="metadata-header supports-collapsing"
      >
        {{ "Equipment" | translate }}
      </div>

      <div
        [collapsed]="collapsed"
        collapseAnimation
        class="metadata-section w-100"
      >
        <div class="equipment-section">
          <table class="table table-sm table-mobile-support mb-0">
            <tbody>
            <ng-container *ngFor="let attr of imagingAttributes">
              <tr *ngIf="this[attr]?.length">
                <th>
                  <div class="equipment-label">
                    {{ attrToLabel[attr] }}
                  </div>
                </th>
                <td>
                  <div class="equipment-container">
                    <astrobin-image-viewer-equipment-item
                      [attr]="attr"
                      [items]="this[attr]"
                      [enableKlassIcon]="false"
                      [attrToIcon]="attrToIcon"
                      [legacyEquipmentUrl]="legacyEquipmentUrl.bind(this)"
                      (equipmentItemClicked)="equipmentItemClicked($event.event, $event.item)"
                      (legacyEquipmentItemClicked)="legacyEquipmentItemClicked($event.event, $event.item)">
                    </astrobin-image-viewer-equipment-item>
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
export class ImageViewerEquipmentComponent extends ImageViewerBaseEquipmentComponent implements OnChanges {
  hasEquipment: boolean;
  hasImagingEquipment: boolean;
  hasGuidingEquipment: boolean;
  telescopes: TelescopeInterface[] = [];
  legacyTelescopes: LegacyTelescopeInterface[] = [];
  cameras: CameraInterface[] = [];
  legacyCameras: LegacyCameraInterface[] = [];
  mounts: MountInterface[] = [];
  legacyMounts: LegacyMountInterface[] = [];
  filters: FilterInterface[] = [];
  legacyFilters: LegacyFilterInterface[] = [];
  accessories: AccessoryInterface[] = [];
  legacyAccessories: LegacyAccessoryInterface[] = [];
  legacyFocalReducers: LegacyFocalReducerInterface[] = [];
  software: SoftwareInterface[] = [];
  legacySoftware: LegacySoftwareInterface[];

  protected readonly imagingAttributes = [
    "telescopes",
    "legacyTelescopes",
    "cameras",
    "legacyCameras",
    "mounts",
    "legacyMounts",
    "filters",
    "legacyFilters",
    "accessories",
    "legacyAccessories",
    "legacyFocalReducers",
    "software",
    "legacySoftware"
  ];
  protected readonly attrToIcon = {
    "telescopes": "telescope",
    "legacyTelescopes": "telescope",
    "cameras": "camera",
    "legacyCameras": "camera",
    "mounts": "mount",
    "legacyMounts": "mount",
    "filters": "filter",
    "legacyFilters": "filter",
    "accessories": "accessory",
    "legacyAccessories": "accessory",
    "legacyFocalReducers": "accessory",
    "software": "software",
    "legacySoftware": "software"
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
    public readonly equipmentService: EquipmentService,
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
    if (changes.image && changes.image.currentValue || changes.revisionLabel && changes.revisionLabel.currentValue) {
      const image = this.image;
      this.hasEquipment = this.imageService.hasEquipment(image);
      this.hasImagingEquipment = this.imageService.hasImagingEquipment(image);
      this.hasGuidingEquipment = this.imageService.hasGuidingEquipment(image);
      this.telescopes = image.imagingTelescopes2;
      this.legacyTelescopes = image.imagingTelescopes;
      this.cameras = image.imagingCameras2;
      this.legacyCameras = image.imagingCameras;
      this.mounts = image.mounts2;
      this.legacyMounts = image.mounts;
      this.filters = image.filters2;
      this.legacyFilters = image.filters;
      this.accessories = image.accessories2;
      this.legacyAccessories = image.accessories;
      this.legacyFocalReducers = image.focalReducers;
      this.software = image.software2;
      this.legacySoftware = image.software;
    }

    let imagingTelescopesLabel: string;
    let imagingCamerasLabel: string;
    let mountsLabel: string;
    let filtersLabel: string;
    let accessoriesLabel: string;

    if (this.telescopes.length === 1) {
      imagingTelescopesLabel = this.equipmentService.humanizeTelescopeType(this.telescopes[0]);
    } else {
      imagingTelescopesLabel = this.translateService.instant("Optics");
    }

    if (this.cameras.length === 1) {
      imagingCamerasLabel = this.equipmentService.humanizeCameraType(this.cameras[0]);
    } else {
      imagingCamerasLabel = this.translateService.instant("Cameras");
    }

    if (this.mounts.length === 1) {
      mountsLabel = this.translateService.instant("Mount");
    } else {
      mountsLabel = this.translateService.instant("Mounts");
    }

    if (this.filters.length === 1) {
      filtersLabel = this.translateService.instant("Filter");
    } else {
      filtersLabel = this.translateService.instant("Filters");
    }

    if (this.accessories.length === 1) {
      accessoriesLabel = this.translateService.instant("Accessory");
    } else {
      accessoriesLabel = this.translateService.instant("Accessories");
    }

    this.attrToLabel = {
      "telescopes": imagingTelescopesLabel,
      "legacyTelescopes": this.translateService.instant("Optics"),
      "cameras": imagingCamerasLabel,
      "legacyCameras": this.legacyCameras?.length > 1 ? this.translateService.instant("Cameras") : this.translateService.instant("Camera"),
      "mounts": mountsLabel,
      "legacyMounts": this.legacyMounts?.length > 1 ? this.translateService.instant("Mounts") : this.translateService.instant("Mount"),
      "filters": filtersLabel,
      "legacyFilters": this.legacyFilters?.length > 1 ? this.translateService.instant("Filters") : this.translateService.instant("Filter"),
      "accessories": accessoriesLabel,
      "legacyAccessories": this.legacyAccessories?.length > 1 ? this.translateService.instant("Accessories") : this.translateService.instant("Accessory"),
      "legacyFocalReducers": this.legacyFocalReducers?.length > 1 ? this.translateService.instant("Focal reducers") : this.translateService.instant("Focus reducer"),
      "software": this.translateService.instant("Software"),
      "legacySoftware": this.translateService.instant("Software")
    };
  }
}
