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
import { TranslateService } from "@ngx-translate/core";
import { EquipmentService } from "@shared/services/equipment.service";

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
      <div class="metadata-section w-100">
        <div class="equipment-section">
          <table class="table table-sm table-mobile-support">
            <tbody>
            <ng-container *ngFor="let attr of imagingAttributes">
              <tr *ngIf="this[attr].length > 0">
                <th>
                  <div class="equipment-label">
                    {{ attrToLabel[attr] }}
                  </div>
                </th>
                <td>
                  <div class="equipment-container">
                    <ng-container
                      [ngTemplateOutlet]="equipmentTemplate"
                      [ngTemplateOutletContext]="{ $implicit: attr, enableKlassIcon: false }"
                    ></ng-container>
                  </div>
                </td>
              </tr>
            </ng-container>
            </tbody>
          </table>
        </div>
      </div>

      <div *ngIf="hasGuidingEquipment" class="metadata-header">{{ "Guiding equipment" | translate }}</div>
      <div *ngIf="hasGuidingEquipment" class="metadata-section w-100">
        <div class="equipment-section">
          <ng-container *ngFor="let attr of guidingAttributes">
            <ng-container
              [ngTemplateOutlet]="equipmentTemplate"
              [ngTemplateOutletContext]="{ $implicit: attr, enableKlassIcon: true }"
            ></ng-container>
          </ng-container>
        </div>
      </div>
    </ng-container>

    <ng-template #equipmentTemplate let-attr let-enableKlassIcon="enableKlassIcon">
      <ng-container *ngIf="attr.indexOf('legacy') === -1; else legacyTemplate">
        <a
          *ngFor="let item of this[attr]"
          [href]="'/equipment/explorer/' + item.klass.toLowerCase() + '/' + item.id"
          (click)="equipmentItemClicked($event, item)"
          class="value"
        >
          <astrobin-equipment-item-display-name
            [item]="item"
            [enableKlassIcon]="enableKlassIcon"
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
          [href]="legacyEquipmentUrl(item)"
          (click)="legacyEquipmentItemClicked($event, item)"
          class="value legacy-equipment"
        >
          <img
            *ngIf="enableKlassIcon"
            class="klass-icon"
            src="/assets/images/{{ attrToIcon[attr] }}-white.png?v=1"
            alt="" />
          <span>{{ item.make }} {{ item.name }}</span>
        </a>
      </ng-template>
    </ng-template>
  `,
  styleUrls: ["./image-viewer-equipment.component.scss"]
})
export class ImageViewerEquipmentComponent extends ImageViewerSectionBaseComponent implements OnChanges {
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
  protected readonly guidingAttributes = [
    "guidingTelescopes",
    "legacyGuidingTelescopes",
    "guidingCameras",
    "legacyGuidingCameras"
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
    "legacySoftware": "software",
    "guidingTelescopes": "telescope",
    "legacyGuidingTelescopes": "telescope",
    "guidingCameras": "camera",
    "legacyGuidingCameras": "camera"
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
    public readonly equipmentService: EquipmentService
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
      "legacySoftware": this.translateService.instant("Software"),
      "guidingTelescopes": this.translateService.instant("Guiding optics"),
      "legacyGuidingTelescopes": this.translateService.instant("Guiding optics"),
      "guidingCameras": this.guidingCameras?.length > 1 ? this.translateService.instant("Guiding cameras") : this.translateService.instant("Guiding camera"),
      "legacyGuidingCameras": this.legacyGuidingCameras?.length > 1 ? this.translateService.instant("Guiding cameras") : this.translateService.instant("Guiding camera")
    };
  }

  protected equipmentItemClicked(event: MouseEvent, item: EquipmentItem): void {
    event.preventDefault();

    const url = `/equipment/explorer/${item.klass.toLowerCase()}/${item.id}`;

    if (event.ctrlKey || event.metaKey) {
      this.windowRefService.nativeWindow.open(url);
      return;
    }

    this.router.navigateByUrl(url).then(() => {
      this.imageViewerService.closeSlideShow(false);
      this.windowRefService.scroll({ top: 0 });
    });
  }

  protected legacyEquipmentItemClicked(event: MouseEvent, item: LegacyEquipmentItem): void {
    event.preventDefault();

    if (event.ctrlKey || event.metaKey) {
      const url = this.legacyEquipmentUrl(item);
      this.windowRefService.nativeWindow.open(url);
      return;
    }

    this.search({
      text: {
        value: this._legacyItemSearchText(item),
        matchType: MatchType.ALL
      }
    });
  }

  protected legacyEquipmentUrl(item: LegacyEquipmentItem): string {
    const params = this.searchService.modelToParams({
      text: {
        value: this._legacyItemSearchText(item),
        matchType: MatchType.ALL
      }
    });
    return `/search?p=${params}`;
  }

  private _legacyItemSearchText(item: LegacyEquipmentItem): string {
    return "\"" + ((item.make || "") + " " + (item.name || "")).trim() + "\"";
  }
}
