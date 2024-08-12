import { Component, OnChanges, SimpleChanges } from "@angular/core";
import { ImageViewerSectionBaseComponent } from "@shared/components/misc/image-viewer/image-viewer-section-base.component";
import { SearchService } from "@features/search/services/search.service";
import { Router } from "@angular/router";
import { MainState } from "@app/store/state";
import { Store } from "@ngrx/store";
import { ImageViewerService } from "@shared/services/image-viewer.service";
import { EquipmentItem } from "@features/equipment/types/equipment-item.type";

@Component({
  selector: "astrobin-image-viewer-equipment",
  template: `
    <div *ngIf="equipmentItems?.length" class="metadata-section">
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
            ></astrobin-equipment-item-display-name>
          </a>
        </div>
      </div>
    </div>
  `,
  styleUrls: ["./image-viewer-equipment.component.scss"]
})
export class ImageViewerEquipmentComponent extends ImageViewerSectionBaseComponent implements OnChanges {
  equipmentItems: EquipmentItem[] = null;

  constructor(
    public readonly store$: Store<MainState>,
    public readonly searchService: SearchService,
    public readonly router: Router,
    public readonly imageViewerService: ImageViewerService,
  ) {
    super(store$, searchService, router, imageViewerService);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.image && changes.image.currentValue || changes.revisionLabel && changes.revisionLabel.currentValue) {
      const image = changes.image.currentValue;
      this.equipmentItems = [
        ...image.imagingTelescopes2,
        ...image.imagingCameras2,
        ...image.mounts2,
        ...image.filters2,
        ...image.accessories2,
        ...image.software2
      ];
    }
  }

  equipmentItemClicked(event: MouseEvent, item: EquipmentItem): void {
    event.preventDefault();
    this.router.navigateByUrl(`/equipment/explorer/${item.klass.toLowerCase()}/${item.id}`);
  }
}
