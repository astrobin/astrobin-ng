import { Component, Input, OnChanges, SimpleChanges } from "@angular/core";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { EquipmentItemBaseInterface, EquipmentItemType } from "@features/equipment/types/equipment-item-base.interface";
import { EquipmentApiService } from "@features/equipment/services/equipment-api.service";
import { BrandInterface } from "@features/equipment/types/brand.interface";
import { CameraInterface, instanceOfCamera } from "@features/equipment/types/camera.interface";
import { TranslateService } from "@ngx-translate/core";
import { Store } from "@ngrx/store";
import { State } from "@app/store/state";
import { TelescopeInterface } from "@features/equipment/types/telescope.interface";
import { UtilsService } from "@shared/services/utils/utils.service";
import { filter, map, take, takeWhile, tap } from "rxjs/operators";
import { CameraDisplayProperty, CameraService } from "@features/equipment/services/camera.service";
import { selectBrand, selectEquipmentItem } from "@features/equipment/store/equipment.selectors";
import { Observable, of } from "rxjs";
import { LoadBrand, LoadSensor } from "@features/equipment/store/equipment.actions";
import { TelescopeDisplayProperty, TelescopeService } from "@features/equipment/services/telescope.service";
import { SensorDisplayProperty, SensorService } from "@features/equipment/services/sensor.service";
import { EquipmentItemService } from "@features/equipment/services/equipment-item.service";
import { EquipmentItem } from "@features/equipment/types/equipment-item.type";
import { SensorInterface } from "@features/equipment/types/sensor.interface";
import { MountInterface } from "@features/equipment/types/mount.interface";
import { MountDisplayProperty, MountService } from "@features/equipment/services/mount.service";
import { FilterInterface } from "@features/equipment/types/filter.interface";
import { FilterDisplayProperty, FilterService } from "@features/equipment/services/filter.service";
import { AccessoryInterface } from "@features/equipment/types/accessory.interface";

interface EquipmentItemProperty {
  name: string;
  value: Observable<string | number>;
}

@Component({
  selector: "astrobin-equipment-item-summary",
  templateUrl: "./item-summary.component.html",
  styleUrls: ["./item-summary.component.scss"]
})
export class ItemSummaryComponent extends BaseComponentDirective implements OnChanges {
  UtilsService = UtilsService;

  @Input()
  item: EquipmentItem;

  @Input()
  showImage = true;

  @Input()
  showLargeImage = false;

  @Input()
  showEmptyProperties = false;

  @Input()
  showClass = true;

  @Input()
  showSubItem = true;

  brand: BrandInterface;
  subItem: EquipmentItemBaseInterface;

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
    public readonly filterService: FilterService
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

    // TODO: complete
    switch (type) {
      case EquipmentItemType.SENSOR:
        return this._sensorProperties$();
      case EquipmentItemType.CAMERA:
        return this._cameraProperties$();
      case EquipmentItemType.TELESCOPE:
        return this._telescopeProperties$();
      case EquipmentItemType.MOUNT:
        return this._mountProperties$();
      case EquipmentItemType.FILTER:
        return this._filterProperties$();
      case EquipmentItemType.ACCESSORY:
        return this._accessoryProperties$();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.store$
      .select(selectBrand, this.item.brand)
      .pipe(
        filter(brand => !!brand),
        takeWhile(brand => !this.brand || this.brand.id !== brand.id)
      )
      .subscribe(brand => (this.brand = brand));

    if (instanceOfCamera(this.item) && this.item.sensor) {
      this.store$.dispatch(new LoadSensor({ id: this.item.sensor }));
      this.store$
        .select(selectEquipmentItem, { id: this.item.sensor, type: EquipmentItemType.SENSOR })
        .pipe(
          filter(sensor => !!sensor),
          take(1),
          tap(sensor => this.store$.dispatch(new LoadBrand({ id: sensor.brand })))
        )
        .subscribe(sensor => (this.subItem = sensor));
    }
  }

  showProperty$(property: EquipmentItemProperty): Observable<boolean> {
    if (!property) {
      return of(false);
    }

    return property.value.pipe(map(value => !!value || this.showEmptyProperties));
  }

  private _sensorProperties$(): Observable<EquipmentItemProperty[]> {
    return of([
      this.showClass
        ? {
            name: this.translateService.instant("Class"),
            value: this.translateService.stream("Sensor")
          }
        : null,
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

  private _cameraProperties$(): Observable<EquipmentItemProperty[]> {
    const item: CameraInterface = this.item as CameraInterface;

    return of([
      this.showClass
        ? {
            name: this.translateService.instant("Class"),
            value: this.translateService.stream("Camera")
          }
        : null,
      {
        name: this.cameraService.getPrintablePropertyName(CameraDisplayProperty.TYPE, true),
        value: this.cameraService.getPrintableProperty$(item, CameraDisplayProperty.TYPE)
      },
      {
        name: this.cameraService.getPrintablePropertyName(CameraDisplayProperty.COOLED, true),
        value: this.cameraService.getPrintableProperty$(item, CameraDisplayProperty.COOLED)
      },
      {
        name: this.cameraService.getPrintablePropertyName(CameraDisplayProperty.MAX_COOLING, true),
        value: this.cameraService.getPrintableProperty$(item, CameraDisplayProperty.MAX_COOLING)
      },
      {
        name: this.cameraService.getPrintablePropertyName(CameraDisplayProperty.BACK_FOCUS, true),
        value: this.cameraService.getPrintableProperty$(item, CameraDisplayProperty.BACK_FOCUS)
      }
    ]);
  }

  private _telescopeProperties$(): Observable<EquipmentItemProperty[]> {
    const item: TelescopeInterface = this.item as TelescopeInterface;

    return of([
      this.showClass
        ? {
            name: this.translateService.instant("Class"),
            value: this.translateService.stream("Telescope")
          }
        : null,
      {
        name: this.telescopeService.getPrintablePropertyName(TelescopeDisplayProperty.TYPE, true),
        value: this.telescopeService.getPrintableProperty$(item, TelescopeDisplayProperty.TYPE)
      },
      {
        name: this.telescopeService.getPrintablePropertyName(TelescopeDisplayProperty.APERTURE, true),
        value: this.telescopeService.getPrintableProperty$(item, TelescopeDisplayProperty.APERTURE)
      },
      {
        name: this.telescopeService.getPrintablePropertyName(TelescopeDisplayProperty.FOCAL_LENGTH, true),
        value: this.telescopeService.getPrintableProperty$(item, TelescopeDisplayProperty.FOCAL_LENGTH)
      },
      {
        name: this.telescopeService.getPrintablePropertyName(TelescopeDisplayProperty.WEIGHT, true),
        value: this.telescopeService.getPrintableProperty$(item, TelescopeDisplayProperty.WEIGHT)
      }
    ]);
  }

  private _mountProperties$(): Observable<EquipmentItemProperty[]> {
    const item: MountInterface = this.item as MountInterface;

    let properties = [
      this.showClass
        ? {
            name: this.translateService.instant("Class"),
            value: this.translateService.stream("Mount")
          }
        : null,
      {
        name: this.mountService.getPrintablePropertyName(MountDisplayProperty.TYPE, true),
        value: this.mountService.getPrintableProperty$(item, MountDisplayProperty.TYPE)
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
            name: this.mountService.getPrintablePropertyName(MountDisplayProperty.TRACKING_ACCURACY, true),
            value: this.mountService.getPrintableProperty$(item, MountDisplayProperty.TRACKING_ACCURACY)
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

  private _filterProperties$(): Observable<EquipmentItemProperty[]> {
    const item: FilterInterface = this.item as FilterInterface;

    return of([
      this.showClass
        ? {
            name: this.translateService.instant("Class"),
            value: this.translateService.stream("Filter")
          }
        : null,
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
    ]);
  }

  private _accessoryProperties$(): Observable<EquipmentItemProperty[]> {
    const item: AccessoryInterface = this.item as AccessoryInterface;

    return of([
      this.showClass
        ? {
            name: this.translateService.instant("Class"),
            value: this.translateService.stream("Accessory")
          }
        : null
    ]);
  }
}
