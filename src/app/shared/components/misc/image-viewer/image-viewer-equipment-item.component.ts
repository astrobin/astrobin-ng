import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from "@angular/core";
import { EquipmentItem } from "@features/equipment/types/equipment-item.type";
import { TelescopeInterface as LegacyTelescopeInterface } from "@core/interfaces/telescope.interface";
import { CameraInterface as LegacyCameraInterface } from "@core/interfaces/camera.interface";
import { MountInterface as LegacyMountInterface } from "@core/interfaces/mount.interface";
import { FilterInterface as LegacyFilterInterface } from "@core/interfaces/filter.interface";
import { AccessoryInterface as LegacyAccessoryInterface } from "@core/interfaces/accessory.interface";
import { SoftwareInterface as LegacySoftwareInterface } from "@core/interfaces/software.interface";

export type LegacyEquipmentItem =
  | LegacyTelescopeInterface
  | LegacyCameraInterface
  | LegacyMountInterface
  | LegacyFilterInterface
  | LegacyAccessoryInterface
  | LegacySoftwareInterface;

@Component({
  selector: "astrobin-image-viewer-equipment-item",
  template: `
    <ng-container *ngIf="!isLegacy(); else legacyTemplate">
      <a *ngFor="let item of items"
         [href]="'/equipment/explorer/' + item.klass.toLowerCase() + '/' + item.id"
         (click)="onEquipmentItemClicked($event, item)"
         class="value">
        <astrobin-equipment-item-display-name
          [item]="item"
          [enableKlassIcon]="enableKlassIcon"
          [enableBrandLink]="false"
          [enableNameLink]="false"
          [enableSummaryModal]="false"
          [showFrozenAsAmbiguous]="false"
          [showItemUnapprovedInfo]="false"
          [showRetailers]="true">
        </astrobin-equipment-item-display-name>
      </a>
    </ng-container>

    <ng-template #legacyTemplate>
      <a *ngFor="let item of items"
         [href]="legacyEquipmentUrl(item)"
         (click)="onLegacyEquipmentItemClicked($event, item)"
         class="value legacy-equipment">
        <img *ngIf="enableKlassIcon"
             class="klass-icon"
             [src]="'/assets/images/' + attrToIcon[attr] + '-white.png?v=1'"
             alt="" />
        <span>{{ item.make }} {{ item.name }}</span>
      </a>
    </ng-template>
  `,
  styleUrls: ["./image-viewer-equipment-item.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ImageViewerEquipmentItemComponent {
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
