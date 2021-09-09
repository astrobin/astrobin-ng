import { Component, Input, OnInit } from "@angular/core";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import {
  EquipmentItemBaseInterface,
  EquipmentItemType
} from "@features/equipment/interfaces/equipment-item-base.interface";
import { EquipmentApiService } from "@features/equipment/services/equipment-api.service";
import { BrandInterface } from "@features/equipment/interfaces/brand.interface";
import { CameraInterface, instanceOfCamera } from "@features/equipment/interfaces/camera.interface";
import { TranslateService } from "@ngx-translate/core";
import { Store } from "@ngrx/store";
import { State } from "@app/store/state";
import { TelescopeInterface } from "@features/equipment/interfaces/telescope.interface";
import { UtilsService } from "@shared/services/utils/utils.service";
import { filter, map, switchMap, takeUntil } from "rxjs/operators";
import { CameraDisplayProperty, CameraService } from "@features/equipment/services/camera.service";
import { selectBrand, selectEquipmentItem } from "@features/equipment/store/equipment.selectors";
import { Observable, of } from "rxjs";
import { SensorInterface } from "@features/equipment/interfaces/sensor.interface";
import { LoadBrand, LoadSensor } from "@features/equipment/store/equipment.actions";
import { TelescopeDisplayProperty, TelescopeService } from "@features/equipment/services/telescope.service";
import { SensorDisplayProperty, SensorService } from "@features/equipment/services/sensor.service";
import { EquipmentItemService } from "@features/equipment/services/equipment-item.service";

@Component({
  selector: "astrobin-equipment-item-summary",
  templateUrl: "./equipment-item-summary.component.html",
  styleUrls: ["./equipment-item-summary.component.scss"]
})
export class EquipmentItemSummaryComponent extends BaseComponentDirective implements OnInit {
  @Input()
  item: EquipmentItemBaseInterface;

  @Input()
  showImage = true;

  brand: BrandInterface;

  constructor(
    public readonly store$: Store<State>,
    public readonly equipmentApiService: EquipmentApiService,
    public readonly translateService: TranslateService,
    public readonly utilsService: UtilsService,
    public readonly equipmentItemService: EquipmentItemService,
    public readonly cameraService: CameraService,
    public readonly telescopeService: TelescopeService,
    public readonly sensorService: SensorService
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

  get properties$(): Observable<{ name: string; value: any }[]> {
    const type: EquipmentItemType = this.equipmentItemService.getType(this.item);

    switch (type) {
      case EquipmentItemType.SENSOR:
        return this._sensorProperties();
      case EquipmentItemType.CAMERA:
        return this._cameraProperties();
      case EquipmentItemType.TELESCOPE:
        return this._telescopeProperties();
    }
  }

  ngOnInit() {
    this.store$.dispatch(new LoadBrand({ id: this.item.brand }));
    this.store$
      .select(selectBrand, this.item.brand)
      .pipe(takeUntil(this.destroyed$))
      .subscribe(brand => (this.brand = brand));

    if (instanceOfCamera(this.item) && this.item.sensor) {
      this.store$.dispatch(new LoadSensor({ id: this.item.sensor }));
    }
  }

  private _sensorProperties(): Observable<{ name: string; value: any }[]> {
    return of([
      {
        name: this.translateService.instant("Class"),
        value: this.translateService.instant("Sensor")
      },
      {
        name: this.translateService.instant("Pixels"),
        value: this.sensorService.getPrintableProperty(this.item, SensorDisplayProperty.PIXELS)
      },
      {
        name: this.translateService.instant("Pixel size"),
        value: this.sensorService.getPrintableProperty(this.item, SensorDisplayProperty.PIXEL_SIZE)
      },
      {
        name: this.translateService.instant("Sensor size"),
        value: this.sensorService.getPrintableProperty(this.item, SensorDisplayProperty.SENSOR_SIZE)
      },
      {
        name: this.translateService.instant("Full well capacity"),
        value: this.sensorService.getPrintableProperty(this.item, SensorDisplayProperty.FULL_WELL_CAPACITY)
      },
      {
        name: this.translateService.instant("Read noise"),
        value: this.sensorService.getPrintableProperty(this.item, SensorDisplayProperty.READ_NOISE)
      },
      {
        name: this.translateService.instant("Quantum efficiency"),
        value: this.sensorService.getPrintableProperty(this.item, SensorDisplayProperty.QUANTUM_EFFICIENCY)
      },
      {
        name: this.translateService.instant("ADC"),
        value: this.sensorService.getPrintableProperty(this.item, SensorDisplayProperty.ADC)
      },
      {
        name: this.translateService.instant("Color/mono"),
        value: this.sensorService.getPrintableProperty(this.item, SensorDisplayProperty.COLOR_OR_MONO)
      }
    ]);
  }

  private _cameraProperties(): Observable<{ name: string; value: any }[]> {
    const item: CameraInterface = this.item as CameraInterface;

    const properties = [
      {
        name: this.translateService.instant("Class"),
        value: this.translateService.instant("Camera")
      },
      {
        name: this.translateService.instant("Type"),
        value: this.cameraService.getPrintableProperty(item, CameraDisplayProperty.TYPE)
      },
      {
        name: this.translateService.instant("Cooled"),
        value: this.cameraService.getPrintableProperty(item, CameraDisplayProperty.COOLED)
      },
      {
        name: this.translateService.instant("Max. cooling"),
        value: this.cameraService.getPrintableProperty(item, CameraDisplayProperty.MAX_COOLING)
      },
      {
        name: this.translateService.instant("Back focus"),
        value: this.cameraService.getPrintableProperty(item, CameraDisplayProperty.BACK_FOCUS)
      }
    ];

    if (item.sensor) {
      return this.store$.select(selectEquipmentItem, item.sensor).pipe(
        takeUntil(this.destroyed$),
        filter(sensor => !!sensor),
        switchMap(sensor =>
          this.store$.select(selectBrand, sensor.brand).pipe(
            takeUntil(this.destroyed$),
            filter(brand => !!brand),
            map(brand => ({ sensor, brand }))
          )
        ),
        switchMap((result: { sensor: SensorInterface; brand: BrandInterface }) => {
          properties.push({
            name: this.translateService.instant("Sensor"),
            value: `${result.brand.name} ${result.sensor.name}`
          });
          return of(properties);
        })
      );
    } else {
      return of(properties);
    }
  }

  private _telescopeProperties(): Observable<{ name: string; value: any }[]> {
    const item: TelescopeInterface = this.item as TelescopeInterface;

    return of([
      {
        name: this.translateService.instant("Class"),
        value: this.translateService.instant("Telescope")
      },
      {
        name: this.translateService.instant("Type"),
        value: this.telescopeService.getPrintableProperty(item, TelescopeDisplayProperty.TYPE)
      },
      {
        name: this.translateService.instant("Aperture"),
        value: this.telescopeService.getPrintableProperty(item, TelescopeDisplayProperty.APERTURE)
      },
      {
        name: this.translateService.instant("Focal length"),
        value: this.telescopeService.getPrintableProperty(item, TelescopeDisplayProperty.FOCAL_LENGTH)
      },
      {
        name: this.translateService.instant("Weight"),
        value: this.telescopeService.getPrintableProperty(item, TelescopeDisplayProperty.WEIGHT)
      }
    ]);
  }
}
