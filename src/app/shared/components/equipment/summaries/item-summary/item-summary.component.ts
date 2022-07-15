import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from "@angular/core";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { EquipmentItemBaseInterface, EquipmentItemType } from "@features/equipment/types/equipment-item-base.interface";
import { EquipmentApiService } from "@features/equipment/services/equipment-api.service";
import { BrandInterface } from "@features/equipment/types/brand.interface";
import { CameraInterface, CameraType, instanceOfCamera } from "@features/equipment/types/camera.interface";
import { TranslateService } from "@ngx-translate/core";
import { Store } from "@ngrx/store";
import { State } from "@app/store/state";
import { TelescopeInterface, TelescopeType } from "@features/equipment/types/telescope.interface";
import { UtilsService } from "@shared/services/utils/utils.service";
import { filter, map, switchMap, take, takeWhile, tap } from "rxjs/operators";
import { CameraDisplayProperty, CameraService } from "@features/equipment/services/camera.service";
import { selectBrand, selectEquipmentItem } from "@features/equipment/store/equipment.selectors";
import { Observable, of } from "rxjs";
import { LoadBrand, LoadEquipmentItem, LoadSensor } from "@features/equipment/store/equipment.actions";
import { TelescopeDisplayProperty, TelescopeService } from "@features/equipment/services/telescope.service";
import { SensorDisplayProperty, SensorService } from "@features/equipment/services/sensor.service";
import {
  EquipmentItemDisplayProperty,
  EquipmentItemService
} from "@features/equipment/services/equipment-item.service";
import { EquipmentItem } from "@features/equipment/types/equipment-item.type";
import { SensorInterface } from "@features/equipment/types/sensor.interface";
import { MountInterface } from "@features/equipment/types/mount.interface";
import { MountDisplayProperty, MountService } from "@features/equipment/services/mount.service";
import { FilterInterface } from "@features/equipment/types/filter.interface";
import { FilterDisplayProperty, FilterService } from "@features/equipment/services/filter.service";
import { UserInterface } from "@shared/interfaces/user.interface";
import { selectUser } from "@features/account/store/auth.selectors";
import { LoadUser } from "@features/account/store/auth.actions";
import { AccessoryDisplayProperty, AccessoryService } from "@features/equipment/services/accessory.service";
import { AccessoryInterface } from "@features/equipment/types/accessory.interface";

interface EquipmentItemProperty {
  name: string;
  value: Observable<string | number>;
  link?: string;
}

@Component({
  selector: "astrobin-equipment-item-summary",
  templateUrl: "./item-summary.component.html",
  styleUrls: ["./item-summary.component.scss"]
})
export class ItemSummaryComponent extends BaseComponentDirective implements OnChanges {
  readonly UtilsService = UtilsService;
  readonly EquipmentItemDisplayProperty = EquipmentItemDisplayProperty;

  @Input()
  item: EquipmentItem;

  @Input()
  showImage = true;

  @Input()
  showLargeImage = false;

  @Input()
  showProperties = true;

  @Input()
  showEmptyProperties = false;

  @Input()
  showClass = true;

  @Input()
  showSubItem = true;

  @Input()
  showMeta = false;

  @Input()
  showStats = true;

  @Input()
  showViewLink = false;

  @Input()
  enableBrandLink = false;

  @Input()
  showCommunityNotes = false;

  @Input()
  showEditButtons = true;

  @Output()
  editButtonClick = new EventEmitter<EquipmentItem>();

  brand: BrandInterface;
  subItem: EquipmentItemBaseInterface;
  properties: EquipmentItemProperty[];

  constructor(
    public readonly store$: Store<State>,
    public readonly equipmentApiService: EquipmentApiService,
    public readonly translateService: TranslateService,
    public readonly utilsService: UtilsService,
    public readonly equipmentItemService: EquipmentItemService,
    public readonly cameraService: CameraService,
    public readonly telescopeService: TelescopeService,
    public readonly sensorService: SensorService,
    public readonly mountService: MountService,
    public readonly filterService: FilterService,
    public readonly accessoryService: AccessoryService
  ) {
    super(store$);
  }

  get image(): string {
    return (this.item.image as string) || this.placeholder;
  }

  get placeholder(): string {
    const type: EquipmentItemType = this.equipmentItemService.getType(this.item);
    return `/assets/images/${EquipmentItemType[type].toLowerCase()}-placeholder.png`;
  }

  get properties$(): Observable<EquipmentItemProperty[]> {
    const type: EquipmentItemType = this.equipmentItemService.getType(this.item);
    const variantOf = this.item.variantOf;

    const _properties$ = (variantOfItem: EquipmentItem | null): Observable<EquipmentItemProperty[]> => {
      switch (type) {
        case EquipmentItemType.SENSOR:
          return this._sensorProperties$(variantOfItem);
        case EquipmentItemType.CAMERA:
          return this._cameraProperties$(variantOfItem);
        case EquipmentItemType.TELESCOPE:
          return this._telescopeProperties$(variantOfItem);
        case EquipmentItemType.MOUNT:
          return this._mountProperties$(variantOfItem);
        case EquipmentItemType.FILTER:
          return this._filterProperties$(variantOfItem);
        case EquipmentItemType.ACCESSORY:
          return this._accessoryProperties$(variantOfItem);
        case EquipmentItemType.SOFTWARE:
          return this._softwareProperties$(variantOfItem);
      }
    };

    if (!!variantOf) {
      const data = { id: variantOf, type };
      this.store$.dispatch(new LoadEquipmentItem(data));
      return this.store$.select(selectEquipmentItem, data).pipe(
        filter(variantOfItem => !!variantOfItem),
        take(1),
        switchMap(variantOfItem => _properties$(variantOfItem))
      );
    }

    return _properties$(null);
  }

  getCreatedBy(): Observable<UserInterface> {
    return this.store$.select(selectUser, this.item.createdBy);
  }

  getReviewedBy(): Observable<UserInterface> {
    return this.store$.select(selectUser, this.item.reviewedBy);
  }

  showLastUpdate(): boolean {
    if (!this.item.updated) {
      return false;
    }

    const created = new Date(this.item.created).getTime();
    const updated = new Date(this.item.updated).getTime();

    return updated - created >= 60000;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.item.createdBy) {
      this.store$.dispatch(new LoadUser({ id: this.item.createdBy }));
    }

    if (this.item.reviewedBy) {
      this.store$.dispatch(new LoadUser({ id: this.item.reviewedBy }));
    }

    if (!this.item.createdBy) {
      this.showMeta = false;
    }

    if (!!this.item.brand) {
      this.store$
        .select(selectBrand, this.item.brand)
        .pipe(
          filter(brand => !!brand),
          takeWhile(brand => !this.brand || this.brand.id !== brand.id)
        )
        .subscribe(brand => (this.brand = brand));
    }

    if (instanceOfCamera(this.item) && this.item.sensor) {
      this.store$.dispatch(new LoadSensor({ id: this.item.sensor }));
      this.store$
        .select(selectEquipmentItem, { id: this.item.sensor, type: EquipmentItemType.SENSOR })
        .pipe(
          filter(sensor => !!sensor),
          take(1),
          tap(sensor => {
            if (!!sensor.brand) {
              this.store$.dispatch(new LoadBrand({ id: sensor.brand }));
            }
          })
        )
        .subscribe(sensor => (this.subItem = sensor));
    }

    this.properties$.pipe(take(1)).subscribe(properties => (this.properties = properties));
  }

  showProperty$(property: EquipmentItemProperty): Observable<boolean> {
    if (!property) {
      return of(false);
    }

    return property.value.pipe(map(value => !!value || this.showEmptyProperties));
  }

  private _classProperty(itemType: EquipmentItemType): EquipmentItemProperty {
    return this.showClass
      ? {
          name: this.translateService.instant("Class"),
          value: of(this.equipmentItemService.humanizeType(itemType))
        }
      : null;
  }

  private _variantOfProperty(variantOfItem: EquipmentItem | null): EquipmentItemProperty {
    return !!variantOfItem
      ? {
          name: this.equipmentItemService.getPrintablePropertyName(
            variantOfItem.klass,
            EquipmentItemDisplayProperty.VARIANT_OF
          ),
          value: this.equipmentItemService.getFullDisplayName$(variantOfItem),
          link: `/equipment/explorer/${variantOfItem.klass.toLowerCase()}/${variantOfItem.id}`
        }
      : null;
  }

  private _sensorProperties$(variantOfItem: EquipmentItem | null): Observable<EquipmentItemProperty[]> {
    return of([
      this._classProperty(EquipmentItemType.SENSOR),
      this._variantOfProperty(variantOfItem),
      {
        name: this.sensorService.getPrintablePropertyName(SensorDisplayProperty.PIXELS, true),
        value: this.sensorService.getPrintableProperty$(this.item as SensorInterface, SensorDisplayProperty.PIXELS)
      },
      {
        name: this.sensorService.getPrintablePropertyName(SensorDisplayProperty.PIXEL_SIZE, true),
        value: this.sensorService.getPrintableProperty$(this.item as SensorInterface, SensorDisplayProperty.PIXEL_SIZE)
      },
      {
        name: this.sensorService.getPrintablePropertyName(SensorDisplayProperty.SENSOR_SIZE, true),
        value: this.sensorService.getPrintableProperty$(this.item as SensorInterface, SensorDisplayProperty.SENSOR_SIZE)
      },
      {
        name: this.sensorService.getPrintablePropertyName(SensorDisplayProperty.FULL_WELL_CAPACITY, true),
        value: this.sensorService.getPrintableProperty$(
          this.item as SensorInterface,
          SensorDisplayProperty.FULL_WELL_CAPACITY
        )
      },
      {
        name: this.sensorService.getPrintablePropertyName(SensorDisplayProperty.READ_NOISE, true),
        value: this.sensorService.getPrintableProperty$(this.item as SensorInterface, SensorDisplayProperty.READ_NOISE)
      },
      {
        name: this.sensorService.getPrintablePropertyName(SensorDisplayProperty.QUANTUM_EFFICIENCY, true),
        value: this.sensorService.getPrintableProperty$(
          this.item as SensorInterface,
          SensorDisplayProperty.QUANTUM_EFFICIENCY
        )
      },
      {
        name: this.sensorService.getPrintablePropertyName(SensorDisplayProperty.FRAME_RATE, true),
        value: this.sensorService.getPrintableProperty$(this.item as SensorInterface, SensorDisplayProperty.FRAME_RATE)
      },
      {
        name: this.sensorService.getPrintablePropertyName(SensorDisplayProperty.ADC, true),
        value: this.sensorService.getPrintableProperty$(this.item as SensorInterface, SensorDisplayProperty.ADC)
      },
      {
        name: this.sensorService.getPrintablePropertyName(SensorDisplayProperty.COLOR_OR_MONO, true),
        value: this.sensorService.getPrintableProperty$(
          this.item as SensorInterface,
          SensorDisplayProperty.COLOR_OR_MONO
        )
      }
    ]);
  }

  private _cameraProperties$(variantOfItem: EquipmentItem | null): Observable<EquipmentItemProperty[]> {
    const item: CameraInterface = this.item as CameraInterface;

    return of([
      this._classProperty(EquipmentItemType.CAMERA),
      this._variantOfProperty(variantOfItem),
      {
        name: this.cameraService.getPrintablePropertyName(CameraDisplayProperty.TYPE, true),
        value: this.cameraService.getPrintableProperty$(item, CameraDisplayProperty.TYPE)
      },
      item.type === CameraType.DEDICATED_DEEP_SKY
        ? {
            name: this.cameraService.getPrintablePropertyName(CameraDisplayProperty.COOLED, true),
            value: this.cameraService.getPrintableProperty$(item, CameraDisplayProperty.COOLED)
          }
        : null,
      item.type === CameraType.DEDICATED_DEEP_SKY && item.cooled
        ? {
            name: this.cameraService.getPrintablePropertyName(CameraDisplayProperty.MAX_COOLING, true),
            value: this.cameraService.getPrintableProperty$(item, CameraDisplayProperty.MAX_COOLING)
          }
        : null,
      {
        name: this.cameraService.getPrintablePropertyName(CameraDisplayProperty.BACK_FOCUS, true),
        value: this.cameraService.getPrintableProperty$(item, CameraDisplayProperty.BACK_FOCUS)
      }
    ]);
  }

  private _telescopeProperties$(variantOfItem: EquipmentItem | null): Observable<EquipmentItemProperty[]> {
    const item: TelescopeInterface = this.item as TelescopeInterface;

    const type_ = {
      name: this.telescopeService.getPrintablePropertyName(TelescopeDisplayProperty.TYPE, true),
      value: this.telescopeService.getPrintableProperty$(item, TelescopeDisplayProperty.TYPE)
    };

    const aperture = {
      name: this.telescopeService.getPrintablePropertyName(TelescopeDisplayProperty.APERTURE, true),
      value: this.telescopeService.getPrintableProperty$(item, TelescopeDisplayProperty.APERTURE)
    };

    const focalLength = {
      name: this.telescopeService.getPrintablePropertyName(TelescopeDisplayProperty.FOCAL_LENGTH, true),
      value: this.telescopeService.getPrintableProperty$(item, TelescopeDisplayProperty.FOCAL_LENGTH)
    };

    const weight = {
      name: this.telescopeService.getPrintablePropertyName(TelescopeDisplayProperty.WEIGHT, true),
      value: this.telescopeService.getPrintableProperty$(item, TelescopeDisplayProperty.WEIGHT)
    };

    return of([
      this._classProperty(EquipmentItemType.TELESCOPE),
      this._variantOfProperty(variantOfItem),
      type_,
      item.type !== TelescopeType.CAMERA_LENS ? aperture : null,
      focalLength,
      weight
    ]);
  }

  private _mountProperties$(variantOfItem: EquipmentItem | null): Observable<EquipmentItemProperty[]> {
    const item: MountInterface = this.item as MountInterface;

    let properties = [
      this._classProperty(EquipmentItemType.MOUNT),
      this._variantOfProperty(variantOfItem),
      {
        name: this.mountService.getPrintablePropertyName(MountDisplayProperty.TYPE, true),
        value: this.mountService.getPrintableProperty$(item, MountDisplayProperty.TYPE)
      },
      {
        name: this.mountService.getPrintablePropertyName(MountDisplayProperty.WEIGHT, true),
        value: this.mountService.getPrintableProperty$(item, MountDisplayProperty.WEIGHT)
      },
      {
        name: this.mountService.getPrintablePropertyName(MountDisplayProperty.MAX_PAYLOAD, true),
        value: this.mountService.getPrintableProperty$(item, MountDisplayProperty.MAX_PAYLOAD)
      },
      {
        name: this.mountService.getPrintablePropertyName(MountDisplayProperty.COMPUTERIZED, true),
        value: this.mountService.getPrintableProperty$(item, MountDisplayProperty.COMPUTERIZED)
      }
    ];

    if (item.computerized) {
      properties = [
        ...properties,
        ...[
          {
            name: this.mountService.getPrintablePropertyName(MountDisplayProperty.PERIODIC_ERROR, true),
            value: this.mountService.getPrintableProperty$(item, MountDisplayProperty.PERIODIC_ERROR)
          },
          {
            name: this.mountService.getPrintablePropertyName(MountDisplayProperty.PEC, true),
            value: this.mountService.getPrintableProperty$(item, MountDisplayProperty.PEC)
          },
          {
            name: this.mountService.getPrintablePropertyName(MountDisplayProperty.SLEW_SPEED, true),
            value: this.mountService.getPrintableProperty$(item, MountDisplayProperty.SLEW_SPEED)
          }
        ]
      ];
    }

    return of(properties);
  }

  private _filterProperties$(variantOfItem: EquipmentItem | null): Observable<EquipmentItemProperty[]> {
    const item: FilterInterface = this.item as FilterInterface;

    const properties = [
      this._classProperty(EquipmentItemType.FILTER),
      this._variantOfProperty(variantOfItem),
      {
        name: this.filterService.getPrintablePropertyName(FilterDisplayProperty.TYPE, true),
        value: this.filterService.getPrintableProperty$(item, FilterDisplayProperty.TYPE)
      },
      {
        name: this.filterService.getPrintablePropertyName(FilterDisplayProperty.BANDWIDTH, true),
        value: this.filterService.getPrintableProperty$(item, FilterDisplayProperty.BANDWIDTH)
      },
      {
        name: this.filterService.getPrintablePropertyName(FilterDisplayProperty.SIZE, true),
        value: this.filterService.getPrintableProperty$(item, FilterDisplayProperty.SIZE)
      }
    ];

    return of(properties);
  }

  private _accessoryProperties$(variantOfItem: EquipmentItem | null): Observable<EquipmentItemProperty[]> {
    const item: AccessoryInterface = this.item as AccessoryInterface;

    return of([
      this._classProperty(EquipmentItemType.ACCESSORY),
      this._variantOfProperty(variantOfItem),
      {
        name: this.accessoryService.getPrintablePropertyName(AccessoryDisplayProperty.TYPE, true),
        value: this.accessoryService.getPrintableProperty$(item, AccessoryDisplayProperty.TYPE)
      }
    ]);
  }

  private _softwareProperties$(variantOfItem: EquipmentItem | null): Observable<EquipmentItemProperty[]> {
    return of([this._classProperty(EquipmentItemType.SOFTWARE), this._variantOfProperty(variantOfItem)]);
  }
}
