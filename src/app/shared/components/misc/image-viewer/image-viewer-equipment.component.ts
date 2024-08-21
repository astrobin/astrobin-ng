import { Component, OnChanges, SimpleChanges } from "@angular/core";
import { ImageViewerSectionBaseComponent } from "@shared/components/misc/image-viewer/image-viewer-section-base.component";
import { SearchService } from "@features/search/services/search.service";
import { Router } from "@angular/router";
import { MainState } from "@app/store/state";
import { Store } from "@ngrx/store";
import { ImageViewerService } from "@shared/services/image-viewer.service";
import { EquipmentItem } from "@features/equipment/types/equipment-item.type";
import { TelescopeInterface } from "@shared/interfaces/telescope.interface";
import { CameraInterface } from "@shared/interfaces/camera.interface";
import { MountInterface } from "@shared/interfaces/mount.interface";
import { FilterInterface } from "@shared/interfaces/filter.interface";
import { FocalReducerInterface } from "@shared/interfaces/focal-reducer.interface";
import { AccessoryInterface } from "@shared/interfaces/accessory.interface";
import { SoftwareInterface } from "@shared/interfaces/software.interface";
import { WindowRefService } from "@shared/services/window-ref.service";

type LegacyEquipmentItem = |
  TelescopeInterface |
  CameraInterface |
  MountInterface |
  FilterInterface |
  FocalReducerInterface |
  AccessoryInterface |
  SoftwareInterface;

@Component({
  selector: "astrobin-image-viewer-equipment",
  template: `
    <div *ngIf="equipmentItems?.length || legacyEquipmentItems?.length" class="metadata-section">
      <div class="metadata-item">
        <div class="metadata-label">
          <a
            *ngFor="let item of equipmentItems"
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

          <a
            *ngFor="let item of legacyEquipmentItems"
            href="#"
            (click)="legacyEquipmentItemClicked($event, item)"
            class="value"
          >
            {{ item.make }} {{ item.name }}
          </a>
        </div>
      </div>
    </div>
  `,
  styleUrls: ["./image-viewer-equipment.component.scss"]
})
export class ImageViewerEquipmentComponent extends ImageViewerSectionBaseComponent implements OnChanges {
  equipmentItems: EquipmentItem[] = null;
  legacyEquipmentItems: LegacyEquipmentItem[] = null;

  constructor(
    public readonly store$: Store<MainState>,
    public readonly searchService: SearchService,
    public readonly router: Router,
    public readonly imageViewerService: ImageViewerService,
    public readonly windowRefService: WindowRefService
  ) {
    super(store$, searchService, router, imageViewerService, windowRefService);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.image && changes.image.currentValue || changes.revisionLabel && changes.revisionLabel.currentValue) {
      const image = this.image;
      this.equipmentItems = [
        ...image.imagingTelescopes2,
        ...image.imagingCameras2,
        ...image.mounts2,
        ...image.filters2,
        ...image.accessories2,
        ...image.software2
      ];
      this.legacyEquipmentItems = [
        ...image.imagingTelescopes,
        ...image.imagingCameras,
        ...image.mounts,
        ...image.filters,
        ...image.focalReducers,
        ...image.accessories,
        ...image.software
      ];
    }
  }

  equipmentItemClicked(event: MouseEvent, item: EquipmentItem): void {
    event.preventDefault();
    this.router.navigateByUrl(`/equipment/explorer/${item.klass.toLowerCase()}/${item.id}`).then(() => {
      this.imageViewerService.closeActiveImageViewer(false);
      this.windowRefService.scroll({ top: 0 });
    });
  }

  legacyEquipmentItemClicked(event: MouseEvent, item: LegacyEquipmentItem): void {
    event.preventDefault();
    this.search({ text: (item.make + " " + item.name).trim() });
  }
}
