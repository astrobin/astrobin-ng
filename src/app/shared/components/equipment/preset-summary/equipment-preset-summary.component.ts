import type { OnChanges, SimpleChanges } from "@angular/core";
import { Component, Input } from "@angular/core";
import { Router } from "@angular/router";
import type { MainState } from "@app/store/state";
import { LoadEquipmentItem } from "@features/equipment/store/equipment.actions";
import { selectEquipmentItem } from "@features/equipment/store/equipment.selectors";
import type { AccessoryInterface } from "@features/equipment/types/accessory.interface";
import type { CameraInterface } from "@features/equipment/types/camera.interface";
import { EquipmentItemType } from "@features/equipment/types/equipment-item-base.interface";
import type { EquipmentItem } from "@features/equipment/types/equipment-item.type";
import { EquipmentPresetInterface } from "@features/equipment/types/equipment-preset.interface";
import type { FilterInterface } from "@features/equipment/types/filter.interface";
import type { MountInterface } from "@features/equipment/types/mount.interface";
import type { SoftwareInterface } from "@features/equipment/types/software.interface";
import type { TelescopeInterface } from "@features/equipment/types/telescope.interface";
import { Store } from "@ngrx/store";
import { TranslateService } from "@ngx-translate/core";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import type { Subscription } from "rxjs";

interface EquipmentTypeConfig {
  property: keyof EquipmentPresetInterface;
  itemType: EquipmentItemType;
  displayName: string;
  searchModelKey?: string; // Optional because guiding equipment won't need it
}

@Component({
  selector: "astrobin-equipment-preset-summary",
  templateUrl: "./equipment-preset-summary.component.html",
  styleUrls: ["./equipment-preset-summary.component.scss"]
})
export class EquipmentPresetSummaryComponent extends BaseComponentDirective implements OnChanges {
  @Input() preset: EquipmentPresetInterface;

  protected readonly equipmentConfigs: EquipmentTypeConfig[] = [
    {
      property: "imagingTelescopes",
      itemType: EquipmentItemType.TELESCOPE,
      displayName: this.translateService.instant("Imaging telescopes or lenses"),
      searchModelKey: "telescope"
    },
    {
      property: "imagingCameras",
      itemType: EquipmentItemType.CAMERA,
      displayName: this.translateService.instant("Imaging cameras"),
      searchModelKey: "camera"
    },
    {
      property: "mounts",
      itemType: EquipmentItemType.MOUNT,
      displayName: this.translateService.instant("Mounts"),
      searchModelKey: "mount"
    },
    {
      property: "filters",
      itemType: EquipmentItemType.FILTER,
      displayName: this.translateService.instant("Filters"),
      searchModelKey: "filter"
    },
    {
      property: "accessories",
      itemType: EquipmentItemType.ACCESSORY,
      displayName: this.translateService.instant("Accessories"),
      searchModelKey: "accessory"
    },
    {
      property: "software",
      itemType: EquipmentItemType.SOFTWARE,
      displayName: this.translateService.instant("Software"),
      searchModelKey: "software"
    },
    {
      property: "guidingTelescopes",
      itemType: EquipmentItemType.TELESCOPE,
      displayName: this.translateService.instant("Guiding telescopes")
    },
    {
      property: "guidingCameras",
      itemType: EquipmentItemType.CAMERA,
      displayName: this.translateService.instant("Guiding cameras")
    }
  ];

  protected equipmentItems: { [key: string]: any[] } = {
    imagingTelescopes: [],
    guidingTelescopes: [],
    mounts: [],
    filters: [],
    accessories: [],
    software: [],
    imagingCameras: [],
    guidingCameras: []
  };

  protected searchModel: any;

  private _subscriptions: Subscription[] = [];

  constructor(
    public readonly store$: Store<MainState>,
    public readonly translateService: TranslateService,
    public readonly router: Router
  ) {
    super(store$);
  }

  // Getter methods for template access
  get imagingTelescopes(): TelescopeInterface[] {
    return this.equipmentItems.imagingTelescopes;
  }

  get guidingTelescopes(): TelescopeInterface[] {
    return this.equipmentItems.guidingTelescopes;
  }

  get mounts(): MountInterface[] {
    return this.equipmentItems.mounts;
  }

  get filters(): FilterInterface[] {
    return this.equipmentItems.filters;
  }

  get accessories(): AccessoryInterface[] {
    return this.equipmentItems.accessories;
  }

  get software(): SoftwareInterface[] {
    return this.equipmentItems.software;
  }

  get imagingCameras(): CameraInterface[] {
    return this.equipmentItems.imagingCameras;
  }

  get guidingCameras(): CameraInterface[] {
    return this.equipmentItems.guidingCameras;
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.preset) {
      this._cleanupSubscriptions();
      this._resetEquipmentArrays();
      this._loadEquipmentItems();
      this._updateSearchModel();
    }
  }

  ngOnDestroy() {
    this._cleanupSubscriptions();
  }

  protected onEquipmentItemClicked(item: EquipmentItem) {
    this.router.navigate([`/equipment/explorer/${item.klass.toLowerCase()}/${item.id}`]);
  }

  private _updateSearchModel(): void {
    const hasEquipment = this.equipmentConfigs.some(
      config => (this.preset[config.property] as EquipmentItem["id"][])?.length > 0 && config.searchModelKey
    );

    if (!hasEquipment) {
      this.searchModel = null;
      return;
    }

    const model: any = {
      users: { value: [{ id: this.preset.user }] }
    };

    this.equipmentConfigs.forEach(config => {
      const ids = this.preset[config.property] as EquipmentItem["id"][];
      if (ids?.length > 0 && config.searchModelKey) {
        model[config.searchModelKey] = {
          value: [...ids.map(id => ({ id }))]
        };
      }
    });

    this.searchModel = { ...model };
  }

  private _cleanupSubscriptions(): void {
    this._subscriptions.forEach(subscription => subscription.unsubscribe());
    this._subscriptions = [];
  }

  private _resetEquipmentArrays(): void {
    Object.keys(this.equipmentItems).forEach(key => {
      this.equipmentItems[key] = [];
    });
  }

  private _loadEquipmentItems(): void {
    this.equipmentConfigs.forEach(config => {
      const itemIds = this.preset[config.property] as number[];

      if (Array.isArray(itemIds)) {
        itemIds.forEach(itemId => {
          // Dispatch LoadEquipmentItem action first
          this.store$.dispatch(
            new LoadEquipmentItem({
              id: itemId,
              type: config.itemType
            })
          );

          const subscription = this.store$
            .select(selectEquipmentItem, {
              id: itemId,
              type: config.itemType
            })
            .subscribe(item => {
              if (item) {
                this.equipmentItems[config.property].push(item);
              }
            });

          this._subscriptions.push(subscription);
        });
      }
    });
  }
}
