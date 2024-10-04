import { Component, OnChanges, SimpleChanges } from "@angular/core";
import { ImageViewerSectionBaseComponent } from "@shared/components/misc/image-viewer/image-viewer-section-base.component";
import { SearchService } from "@features/search/services/search.service";
import { Router } from "@angular/router";
import { MainState } from "@app/store/state";
import { Store } from "@ngrx/store";
import { ImageViewerService } from "@shared/services/image-viewer.service";
import { EquipmentItem } from "@features/equipment/types/equipment-item.type";
import { TelescopeInterface as LegacyTelescopeInterface } from "@shared/interfaces/telescope.interface";
import { CameraInterface as LegacyCameraInterface } from "@shared/interfaces/camera.interface";
import { MountInterface as LegacyMountInterface } from "@shared/interfaces/mount.interface";
import { FilterInterface as LegacyFilterInterface } from "@shared/interfaces/filter.interface";
import { FocalReducerInterface as LegacyFocalReducerInterface } from "@shared/interfaces/focal-reducer.interface";
import { AccessoryInterface as LegacyAccessoryInterface } from "@shared/interfaces/accessory.interface";
import { SoftwareInterface as LegacySoftwareInterface } from "@shared/interfaces/software.interface";
import { WindowRefService } from "@shared/services/window-ref.service";
import { TelescopeInterface } from "@features/equipment/types/telescope.interface";
import { CameraInterface } from "@features/equipment/types/camera.interface";
import { MountInterface } from "@features/equipment/types/mount.interface";
import { FilterInterface } from "@features/equipment/types/filter.interface";
import { AccessoryInterface } from "@features/equipment/types/accessory.interface";
import { SoftwareInterface } from "@features/equipment/types/software.interface";
import { ImageService } from "@shared/services/image/image.service";
import { MatchType } from "@features/search/enums/match-type.enum";

type LegacyEquipmentItem =
  | LegacyTelescopeInterface
  | LegacyCameraInterface
  | LegacyMountInterface
  | LegacyFilterInterface
  | LegacyAccessoryInterface
  | LegacySoftwareInterface;

@Component({
  selector: "astrobin-image-viewer-equipment",
  template: `
    <ng-container *ngIf="hasEquipment">
      <div *ngIf="hasGuidingEquipment" class="metadata-header">{{ "Imaging equipment" | translate }}</div>
      <div *ngIf="!hasGuidingEquipment" class="metadata-header">{{ "Equipment" | translate }}</div>
      <div class="metadata-section">
        <div class="metadata-item">
          <div class="metadata-label">
            <div class="equipment-section">
              <ng-container *ngFor="let attr of imagingAttributes">
                <ng-container
                  [ngTemplateOutlet]="equipmentTemplate"
                  [ngTemplateOutletContext]="{ $implicit: attr }"
                ></ng-container>
              </ng-container>
            </div>
          </div>
        </div>
      </div>

      <div *ngIf="hasGuidingEquipment" class="metadata-header">{{ "Guiding equipment" | translate }}</div>
      <div *ngIf="hasGuidingEquipment" class="metadata-section">
        <div class="metadata-item">
          <div class="metadata-label">
            <div class="equipment-section">
              <ng-container *ngFor="let attr of guidingAttributes">
                <ng-container
                  [ngTemplateOutlet]="equipmentTemplate"
                  [ngTemplateOutletContext]="{ $implicit: attr }"
                ></ng-container>
              </ng-container>
            </div>
          </div>
        </div>
      </div>
    </ng-container>

    <ng-template #equipmentTemplate let-attr>
      <ng-container *ngIf="attr.indexOf('legacy') === -1; else legacyTemplate">
        <a
          *ngFor="let item of this[attr]"
          href="#"
          (click)="equipmentItemClicked($event, item)"
          class="value"
        >
          <astrobin-equipment-item-display-name
            [item]="item"
            [enableKlassIcon]="true"
            [enableBrandLink]="false"
            [enableNameLink]="false"
            [enableSummaryModal]="false"
            [showFrozenAsAmbiguous]="false"
            [showItemUnapprovedInfo]="false"
            [showRetailers]="true"
          ></astrobin-equipment-item-display-name>
        </a>
      </ng-container>

      <ng-template #legacyTemplate>
        <a
          *ngFor="let item of this[attr]"
          href="#"
          (click)="legacyEquipmentItemClicked($event, item)"
          class="value legacy-equipment"
        >
          <img class="klass-icon" src="/assets/images/{{ attrToIcon[attr] }}-white.png?v=1" alt="" />
          <span>{{ item.make }} {{ item.name }}</span>
        </a>
      </ng-template>
    </ng-template>
  `,
  styleUrls: ["./image-viewer-equipment.component.scss"]
})
export class ImageViewerEquipmentComponent extends ImageViewerSectionBaseComponent implements OnChanges {
  readonly imagingAttributes = [
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
    "legacySoftware",
    ]

  readonly guidingAttributes = [
    "guidingTelescopes",
    "legacyGuidingTelescopes",
    "guidingCameras",
    "legacyGuidingCameras"
  ];

  readonly attrToIcon = {
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
    "legacySoftware": "software",
    "guidingTelescopes": "telescope",
    "legacyGuidingTelescopes": "telescope",
    "guidingCameras": "camera",
    "legacyGuidingCameras": "camera"
  }

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
  guidingTelescopes: TelescopeInterface[] = [];
  legacyGuidingTelescopes: LegacyTelescopeInterface[] = [];
  guidingCameras: CameraInterface[] = [];
  legacyGuidingCameras: LegacyCameraInterface[] = [];

  constructor(
    public readonly store$: Store<MainState>,
    public readonly searchService: SearchService,
    public readonly router: Router,
    public readonly imageViewerService: ImageViewerService,
    public readonly windowRefService: WindowRefService,
    public readonly imageService: ImageService
  ) {
    super(store$, searchService, router, imageViewerService, windowRefService);
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
      this.guidingTelescopes = image.guidingTelescopes2;
      this.legacyGuidingTelescopes = image.guidingTelescopes;
      this.guidingCameras = image.guidingCameras2;
      this.legacyGuidingCameras = image.guidingCameras;
    }
  }

  equipmentItemClicked(event: MouseEvent, item: EquipmentItem): void {
    event.preventDefault();
    this.router.navigateByUrl(`/equipment/explorer/${item.klass.toLowerCase()}/${item.id}`).then(() => {
      this.imageViewerService.closeSlideShow(false);
      this.windowRefService.scroll({ top: 0 });
    });
  }

  legacyEquipmentItemClicked(event: MouseEvent, item: LegacyEquipmentItem): void {
    event.preventDefault();
    const text = "\"" + ((item.make || "") + " " + (item.name || "")).trim() + "\"";
    this.search({
      text: {
        value: text,
        matchType: MatchType.ALL
      }
    });
  }
}
