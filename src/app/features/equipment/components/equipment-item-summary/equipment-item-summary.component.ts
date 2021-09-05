import { Component, Input, OnInit } from "@angular/core";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { EquipmentItemBaseInterface } from "@features/equipment/interfaces/equipment-item-base.interface";
import { EquipmentApiService } from "@features/equipment/services/equipment-api.service";
import { BrandInterface } from "@features/equipment/interfaces/brand.interface";
import { instanceOfCamera } from "@features/equipment/interfaces/camera.interface";
import { TranslateService } from "@ngx-translate/core";
import { Store } from "@ngrx/store";
import { State } from "@app/store/state";
import { instanceOfTelescope } from "@features/equipment/interfaces/telescope.interface";
import { UtilsService } from "@shared/services/utils/utils.service";
import { filter, map, switchMap, takeUntil } from "rxjs/operators";
import { CameraService } from "@features/equipment/services/camera.service";
import { selectBrand, selectEquipmentItem } from "@features/equipment/store/equipment.selectors";
import { Observable, of } from "rxjs";
import { SensorInterface } from "@features/equipment/interfaces/sensor.interface";
import { LoadSensor } from "@features/equipment/store/equipment.actions";

export const PLACEHOLDER = "https://via.placeholder.com/50.png/000/fff?text=?";

@Component({
  selector: "astrobin-equipment-item-summary",
  templateUrl: "./equipment-item-summary.component.html",
  styleUrls: ["./equipment-item-summary.component.scss"]
})
export class EquipmentItemSummaryComponent extends BaseComponentDirective implements OnInit {
  @Input()
  item: EquipmentItemBaseInterface;

  brand: BrandInterface;

  constructor(
    public readonly store$: Store<State>,
    public readonly equipmentApiService: EquipmentApiService,
    public readonly translateService: TranslateService,
    public readonly utilsService: UtilsService,
    public readonly cameraService: CameraService
  ) {
    super(store$);
  }

  get image(): string {
    return (this.item.image as string) || PLACEHOLDER;
  }

  get properties$(): Observable<{ name: string; value: any }[]> {
    if (instanceOfCamera(this.item)) {
      const properties = [
        {
          name: this.translateService.instant("Class"),
          value: this.translateService.instant("Camera")
        },
        {
          name: this.translateService.instant("Type"),
          value: this.item.type
        },
        {
          name: this.translateService.instant("Cooled"),
          value: this.cameraService.getPrintableProperty(this.item, "cooled")
        },
        {
          name: this.translateService.instant("Max. cooling"),
          value: this.cameraService.getPrintableProperty(this.item, "maxCooling")
        },
        {
          name: this.translateService.instant("Back focus"),
          value: this.cameraService.getPrintableProperty(this.item, "backFocus")
        }
      ];

      if (this.item.sensor) {
        this.store$.dispatch(new LoadSensor({ id: this.item.sensor }));
        return this.store$.select(selectEquipmentItem, this.item.sensor).pipe(
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
    } else if (instanceOfTelescope(this.item)) {
      return of([
        {
          name: this.translateService.instant("Class"),
          value: this.translateService.instant("Telescope")
        },
        {
          name: this.translateService.instant("Type"),
          value: this.item.type
        },
        {
          name: this.translateService.instant("Aperture"),
          value:
            this.item.minAperture === this.item.maxAperture
              ? `${this.item.maxAperture} mm`
              : `${this.item.minAperture} - ${this.item.maxAperture} mm`
        },
        {
          name: this.translateService.instant("Focal length"),
          value:
            this.item.minFocalLength === this.item.maxFocalLength
              ? `${this.item.minFocalLength} mm`
              : `${this.item.minFocalLength} - ${this.item.maxFocalLength} mm`
        },
        {
          name: this.translateService.instant("Weight"),
          value: `${this.item.weight} kg`
        }
      ]);
    }
  }

  ngOnInit() {
    this.store$
      .select(selectBrand, this.item.brand)
      .pipe(takeUntil(this.destroyed$))
      .subscribe(brand => (this.brand = brand));
  }
}
