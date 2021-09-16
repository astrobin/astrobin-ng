import { Component, Input, OnChanges, SimpleChanges } from "@angular/core";
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
import { filter, takeWhile } from "rxjs/operators";
import { CameraDisplayProperty, CameraService } from "@features/equipment/services/camera.service";
import { selectBrand } from "@features/equipment/store/equipment.selectors";
import { Observable, of } from "rxjs";
import { LoadSensor } from "@features/equipment/store/equipment.actions";
import { TelescopeDisplayProperty, TelescopeService } from "@features/equipment/services/telescope.service";
import { SensorDisplayProperty, SensorService } from "@features/equipment/services/sensor.service";
import { EquipmentItemService } from "@features/equipment/services/equipment-item.service";

@Component({
  selector: "astrobin-equipment-item-summary",
  templateUrl: "./item-summary.component.html",
  styleUrls: ["./item-summary.component.scss"]
})
export class ItemSummaryComponent extends BaseComponentDirective implements OnChanges {
  @Input()
  item: EquipmentItemBaseInterface;

  @Input()
  showImage = true;

  @Input()
  showLargeImage = false;

  @Input()
  showEmptyProperties = false;

  @Input()
  showClass = true;

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
    }
  }

  showProperty(property: { name: string; value: any }): boolean {
    return !!property && (!!property.value || this.showEmptyProperties);
  }

  private _sensorProperties(): Observable<{ name: string; value: any }[]> {
    return of([
      this.showClass
        ? {
            name: this.translateService.instant("Class"),
            value: this.translateService.instant("Sensor")
          }
        : null,
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

    return of([
      this.showClass
        ? {
            name: this.translateService.instant("Class"),
            value: this.translateService.instant("Camera")
          }
        : null,
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
    ]);
  }

  private _telescopeProperties(): Observable<{ name: string; value: any }[]> {
    const item: TelescopeInterface = this.item as TelescopeInterface;

    return of([
      this.showClass
        ? {
            name: this.translateService.instant("Class"),
            value: this.translateService.instant("Telescope")
          }
        : null,
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
