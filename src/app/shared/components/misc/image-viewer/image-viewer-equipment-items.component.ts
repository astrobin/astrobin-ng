import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from "@angular/core";
import { AccessoryInterface as LegacyAccessoryInterface } from "@core/interfaces/accessory.interface";
import { CameraInterface as LegacyCameraInterface } from "@core/interfaces/camera.interface";
import { FilterInterface as LegacyFilterInterface } from "@core/interfaces/filter.interface";
import { MountInterface as LegacyMountInterface } from "@core/interfaces/mount.interface";
import { SoftwareInterface as LegacySoftwareInterface } from "@core/interfaces/software.interface";
import { TelescopeInterface as LegacyTelescopeInterface } from "@core/interfaces/telescope.interface";
import { EquipmentItem } from "@features/equipment/types/equipment-item.type";

export type LegacyEquipmentItem =
  | LegacyTelescopeInterface
  | LegacyCameraInterface
  | LegacyMountInterface
  | LegacyFilterInterface
  | LegacyAccessoryInterface
  | LegacySoftwareInterface;

@Component({
  selector: "astrobin-image-viewer-equipment-items",
  template: `
    <ng-container *ngIf="!isLegacy(); else legacyTemplate">
      <a
        *ngFor="let item of items"
        [href]="'/equipment/explorer/' + item.klass.toLowerCase() + '/' + item.id"
        (click)="onEquipmentItemClicked($event, item)"
        class="value flex-wrap"
      >
        <astrobin-equipment-item-display-name
          [class.highlighted]="highlightedItems?.includes(item.id)"
          [enableBrandLink]="false"
          [enableKlassIcon]="enableKlassIcon"
          [enableNameLink]="false"
          [enableSummaryPopover]="true"
          [highlightTerms]="highlightedItems?.includes(item.id) ? null : highlightTerms"
          [item]="item"
          [showFrozenAsAmbiguous]="false"
          [showItemUnapprovedInfo]="false"
          [showRetailers]="true"
        >
        </astrobin-equipment-item-display-name>
      </a>
    </ng-container>

    <ng-template #legacyTemplate>
      <a
        *ngFor="let item of items"
        [href]="legacyEquipmentUrl(item)"
        (click)="onLegacyEquipmentItemClicked($event, item)"
        class="value legacy-equipment"
      >
        <img
          *ngIf="enableKlassIcon"
          [src]="'/assets/images/' + attrToIcon[attr] + '-white.png?v=1'"
          class="klass-icon"
          alt=""
        />
        <span [innerHTML]="item.make + ' ' + item.name | highlight: highlightTerms"></span>&nbsp;
      </a>
    </ng-template>
  `,
  styleUrls: ["./image-viewer-equipment-items.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ImageViewerEquipmentItemsComponent {
  // The attribute name (e.g. "telescopes", "legacyCameras", "guidingTelescopes", etc.)
  @Input() attr: string;

  // The items for that attribute.
  @Input() items: any[] = [];

  // Flag: show the klass icon or not.
  @Input() enableKlassIcon = false;

  // A mapping object from attribute names to icon filenames.
  @Input() attrToIcon: { [key: string]: string };

  // Function provided by the parent to build legacy URLs.
  @Input() legacyEquipmentUrl: (item: any) => string;

  @Input() highlightTerms: string;

  // This is different from `highlightTerms`, which applies to free text search. If the item (as an object) is in the
  // search parameters, it should be highlighted as a whole.
  @Input() highlightedItems: EquipmentItem["id"][];

  // Emits when a non-legacy item is clicked.
  @Output() equipmentItemClicked = new EventEmitter<{ event: MouseEvent; item: EquipmentItem }>();

  // Emits when a legacy item is clicked.
  @Output() legacyEquipmentItemClicked = new EventEmitter<{ event: MouseEvent; item: LegacyEquipmentItem }>();

  isLegacy(): boolean {
    return this.attr.indexOf("legacy") !== -1;
  }

  onEquipmentItemClicked(event: MouseEvent, item: EquipmentItem): void {
    event.preventDefault();
    this.equipmentItemClicked.emit({ event, item });
  }

  onLegacyEquipmentItemClicked(event: MouseEvent, item: LegacyEquipmentItem): void {
    event.preventDefault();
    this.legacyEquipmentItemClicked.emit({ event, item });
  }
}
