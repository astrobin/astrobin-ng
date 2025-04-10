import type { OnChanges, SimpleChanges } from "@angular/core";
import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from "@angular/core";
import { Router } from "@angular/router";
import type { MainState } from "@app/store/state";
import type { AccessoryInterface as LegacyAccessoryInterface } from "@core/interfaces/accessory.interface";
import type { CameraInterface as LegacyCameraInterface } from "@core/interfaces/camera.interface";
import type { FilterInterface as LegacyFilterInterface } from "@core/interfaces/filter.interface";
import type { FocalReducerInterface as LegacyFocalReducerInterface } from "@core/interfaces/focal-reducer.interface";
import type { MountInterface as LegacyMountInterface } from "@core/interfaces/mount.interface";
import type { SoftwareInterface as LegacySoftwareInterface } from "@core/interfaces/software.interface";
import type { TelescopeInterface as LegacyTelescopeInterface } from "@core/interfaces/telescope.interface";
import { CollapseSyncService } from "@core/services/collapse-sync.service";
import { EquipmentService } from "@core/services/equipment.service";
import { ImageInfoService } from "@core/services/image/image-info.service";
import { ImageService } from "@core/services/image/image.service";
import { ImageViewerService } from "@core/services/image-viewer.service";
import { SearchService } from "@core/services/search.service";
import { WindowRefService } from "@core/services/window-ref.service";
import type { AccessoryInterface } from "@features/equipment/types/accessory.interface";
import type { CameraInterface } from "@features/equipment/types/camera.interface";
import type { EquipmentItem } from "@features/equipment/types/equipment-item.type";
import type { FilterInterface } from "@features/equipment/types/filter.interface";
import type { MountInterface } from "@features/equipment/types/mount.interface";
import type { SoftwareInterface } from "@features/equipment/types/software.interface";
import type { TelescopeInterface } from "@features/equipment/types/telescope.interface";
import { SearchAutoCompleteType } from "@features/search/enums/search-auto-complete-type.enum";
import { Store } from "@ngrx/store";
import { TranslateService } from "@ngx-translate/core";
import { ImageViewerBaseEquipmentComponent } from "@shared/components/misc/image-viewer/image-viewer-base-equipment.component";
import { CookieService } from "ngx-cookie";

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

      <div [collapsed]="collapsed" collapseAnimation class="metadata-section w-100">
        <div class="equipment-section flex-wrap">
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
                    <div class="equipment-container flex-wrap">
                      <astrobin-image-viewer-equipment-items
                        [attr]="attr"
                        [attrToIcon]="attrToIcon"
                        [enableKlassIcon]="false"
                        [highlightTerms]="highlightTerms"
                        [highlightedItems]="highlightedItems[attr]"
                        [items]="this[attr]"
                        [legacyEquipmentUrl]="legacyEquipmentUrl.bind(this)"
                        (equipmentItemClicked)="equipmentItemClicked($event.event, $event.item)"
                        (legacyEquipmentItemClicked)="legacyEquipmentItemClicked($event.event, $event.item)"
                        class="flex-wrap"
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
  protected readonly searchParamToImagingAttribute = {
    [SearchAutoCompleteType.TELESCOPE]: "telescopes",
    [SearchAutoCompleteType.CAMERA]: "cameras",
    [SearchAutoCompleteType.MOUNT]: "mounts",
    [SearchAutoCompleteType.FILTER]: "filters",
    [SearchAutoCompleteType.ACCESSORY]: "accessories",
    [SearchAutoCompleteType.SOFTWARE]: "software"
  };
  protected readonly attrToIcon = {
    telescopes: "telescope",
    legacyTelescopes: "telescope",
    cameras: "camera",
    legacyCameras: "camera",
    mounts: "mount",
    legacyMounts: "mount",
    filters: "filter",
    legacyFilters: "filter",
    accessories: "accessory",
    legacyAccessories: "accessory",
    legacyFocalReducers: "accessory",
    software: "software",
    legacySoftware: "software"
  };
  protected highlightedItems: { [key: string]: EquipmentItem["id"][] } = {};
  protected attrToLabel: { [key: string]: string };
  protected highlightTerms: string;

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
    public readonly changeDetectorRef: ChangeDetectorRef,
    private readonly imageInfoService: ImageInfoService
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
    if (changes.searchModel && changes.searchModel.currentValue) {
      this.highlightTerms = "";

      if (this.searchModel.text?.value) {
        this.highlightTerms = this.searchModel.text.value;
      }

      for (const searchParam of [
        SearchAutoCompleteType.TELESCOPE,
        SearchAutoCompleteType.CAMERA,
        SearchAutoCompleteType.MOUNT,
        SearchAutoCompleteType.FILTER,
        SearchAutoCompleteType.ACCESSORY,
        SearchAutoCompleteType.SOFTWARE
      ]) {
        if (this.searchModel[searchParam]?.value) {
          for (const item of this.searchModel[searchParam].value) {
            try {
              const attr = this.searchParamToImagingAttribute[searchParam];
              this.highlightedItems[attr] = this.highlightedItems[attr] || [];
              if (item.id) {
                this.highlightedItems[attr].push(item.id);
              }
            } catch (e) {
              console.error("Error highlighting equipment items", e);
            }
          }
        }
      }
    }

    if (
      (changes.image && changes.image.currentValue) ||
      (changes.revisionLabel && changes.revisionLabel.currentValue)
    ) {
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

    // Get equipment labels from ImageInfoService
    const labels = this.imageInfoService.getEquipmentLabels(this.image);

    this.attrToLabel = {
      telescopes: labels.telescopes,
      legacyTelescopes: this.translateService.instant("Optics"),
      cameras: labels.cameras,
      legacyCameras:
        this.legacyCameras?.length > 1
          ? this.translateService.instant("Cameras")
          : this.translateService.instant("Camera"),
      mounts: labels.mounts,
      legacyMounts:
        this.legacyMounts?.length > 1
          ? this.translateService.instant("Mounts")
          : this.translateService.instant("Mount"),
      filters: labels.filters,
      legacyFilters:
        this.legacyFilters?.length > 1
          ? this.translateService.instant("Filters")
          : this.translateService.instant("Filter"),
      accessories: labels.accessories,
      legacyAccessories:
        this.legacyAccessories?.length > 1
          ? this.translateService.instant("Accessories")
          : this.translateService.instant("Accessory"),
      legacyFocalReducers:
        this.legacyFocalReducers?.length > 1
          ? this.translateService.instant("Focal reducers")
          : this.translateService.instant("Focus reducer"),
      software: labels.software,
      legacySoftware: this.translateService.instant("Software")
    };
  }
}
