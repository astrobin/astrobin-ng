import { AfterViewInit, Component, OnInit, TemplateRef, ViewChild } from "@angular/core";
import { TranslateService } from "@ngx-translate/core";
import { Actions, ofType } from "@ngrx/effects";
import { Store } from "@ngrx/store";
import { BaseEquipmentItemEditorComponent } from "@features/equipment/components/base-equipment-item-editor/base-equipment-item-editor.component";
import { LoadingService } from "@shared/services/loading.service";
import { WindowRefService } from "@shared/services/window-ref.service";
import { CameraInterface, CameraType } from "@features/equipment/interfaces/camera.interface";
import { State } from "@app/store/state";
import { EquipmentApiService } from "@features/equipment/services/equipment-api.service";
import { FormGroup } from "@angular/forms";
import { of } from "rxjs";
import { EquipmentItemType } from "@features/equipment/interfaces/equipment-item-base.interface";
import { SensorInterface } from "@features/equipment/interfaces/sensor.interface";
import {
  CreateSensor,
  EquipmentActionTypes,
  EquipmentItemCreationSuccessPayloadInterface,
  FindAllEquipmentItems,
  FindAllEquipmentItemsSuccess,
  LoadBrand
} from "@features/equipment/store/equipment.actions";
import { filter, map, switchMap, take, takeUntil, tap } from "rxjs/operators";
import { selectBrand, selectBrands } from "@features/equipment/store/equipment.selectors";
import { BrandInterface } from "@features/equipment/interfaces/brand.interface";
import { EquipmentItemService } from "@features/equipment/services/equipment-item.service";
import { CameraService } from "@features/equipment/services/camera.service";

@Component({
  selector: "astrobin-camera-editor",
  templateUrl: "./camera-editor.component.html",
  styleUrls: [
    "./camera-editor.component.scss",
    "../base-equipment-item-editor/base-equipment-item-editor.component.scss"
  ]
})
export class CameraEditorComponent extends BaseEquipmentItemEditorComponent<CameraInterface>
  implements OnInit, AfterViewInit {
  sensorCreation: {
    inProgress: boolean;
    form: FormGroup;
    name: string;
  } = {
    inProgress: false,
    form: new FormGroup({}),
    name: null
  };

  @ViewChild("sensorOptionTemplate")
  sensorOptionTemplate: TemplateRef<any>;

  constructor(
    public readonly store$: Store<State>,
    public readonly actions$: Actions,
    public readonly loadingService: LoadingService,
    public readonly translateService: TranslateService,
    public readonly windowRefService: WindowRefService,
    public readonly equipmentApiService: EquipmentApiService,
    public readonly equipmentItemService: EquipmentItemService,
    public readonly cameraService: CameraService
  ) {
    super(
      store$,
      actions$,
      loadingService,
      translateService,
      windowRefService,
      equipmentApiService,
      equipmentItemService
    );
  }

  ngOnInit() {
    if (!this.returnToSelector) {
      this.returnToSelector = "#camera-editor-form";
    }
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this._initFields();
    }, 1);
    super.ngAfterViewInit();
  }

  resetSensorCreation() {
    this.sensorCreation.inProgress = false;
    this.subCreationInProgress.emit(false);
    this.sensorCreation.form.reset();
  }

  createSensor() {
    const sensor: SensorInterface = this.sensorCreation.form.value;

    this.loadingService.setLoading(true);
    this.store$.dispatch(new CreateSensor({ sensor }));
    this.actions$
      .pipe(
        ofType(EquipmentActionTypes.CREATE_SENSOR_SUCCESS),
        take(1),
        map((result: { payload: EquipmentItemCreationSuccessPayloadInterface }) => result.payload.item)
      )
      .subscribe((createdSensor: SensorInterface) => {
        this.sensorCreated(createdSensor);
        this.loadingService.setLoading(false);
      });
  }

  sensorCreated(sensor: SensorInterface) {
    this.resetSensorCreation();

    this.store$
      .select(selectBrand, sensor.brand)
      .pipe(
        takeUntil(this.destroyed$),
        filter(brand => !!brand)
      )
      .subscribe(brand => {
        this.fields.find(field => field.key === "sensor").templateOptions.options = [
          {
            value: sensor.id,
            label: `${brand.name} ${sensor.name}`,
            sensor
          }
        ];

        this.model = { ...this.model, ...{ sensor: sensor.id } };
        this.form.get("sensor").setValue(sensor.id);

        setTimeout(() => {
          this.windowRefService.nativeWindow.document
            .querySelector("#camera-field-sensor")
            .scrollIntoView({ behavior: "smooth" });
        }, 1);
      });
  }

  private _initFields() {
    this.fields = [
      this._getBrandField(),
      this._getNameField(),
      {
        key: "type",
        type: "ng-select",
        id: "camera-field-type",
        expressionProperties: {
          "templateOptions.disabled": () => this.sensorCreation.inProgress
        },
        templateOptions: {
          label: this.translateService.instant("Type"),
          required: true,
          clearable: true,
          options: of(
            [
              [CameraType.DEDICATED_DEEP_SKY, this.cameraService.humanizeType(CameraType.DEDICATED_DEEP_SKY)],
              [CameraType.DSLR_MIRRORLESS, this.cameraService.humanizeType(CameraType.DSLR_MIRRORLESS)],
              [CameraType.GUIDER_PLANETARY, this.cameraService.humanizeType(CameraType.GUIDER_PLANETARY)],
              [CameraType.VIDEO, this.cameraService.humanizeType(CameraType.VIDEO)],
              [CameraType.FILM, this.cameraService.humanizeType(CameraType.FILM)],
              [CameraType.OTHER, this.cameraService.humanizeType(CameraType.OTHER)]
            ].map(item => ({
              value: item[0],
              label: item[1]
            }))
          )
        }
      },
      {
        key: "sensor",
        type: "ng-select",
        id: "camera-field-sensor",
        expressionProperties: {
          "templateOptions.disabled": () => this.sensorCreation.inProgress
        },
        templateOptions: {
          label: this.translateService.instant("Sensor"),
          required: false,
          clearable: true,
          options: of([]),
          onSearch: (term: string) => {
            this._onSensorSearch(term);
          },
          optionTemplate: this.sensorOptionTemplate,
          addTag: () => {
            this.sensorCreation.inProgress = true;
            this.subCreationInProgress.emit(true);
            this.form.get("sensor").setValue(null);
            setTimeout(() => {
              this.windowRefService.nativeWindow.document
                .getElementById("create-new-sensor")
                .scrollIntoView({ behavior: "smooth" });
            }, 1);
          }
        }
      },
      {
        key: "cooled",
        type: "checkbox",
        wrappers: ["default-wrapper"],
        id: "camera-field-cooled",
        defaultValue: false,
        expressionProperties: {
          "templateOptions.disabled": () => this.brandCreation.inProgress
        },
        templateOptions: {
          label: this.translateService.instant("Cooled"),
          description: this.translateService.instant("Whether this camera is equipment with a cooling mechanism.")
        }
      },
      {
        key: "maxCooling",
        type: "input",
        wrappers: ["default-wrapper"],
        id: "camera-field-max-cooling",
        hideExpression: () => !this.model.cooled,
        expressionProperties: {
          "templateOptions.disabled": () => this.brandCreation.inProgress
        },
        templateOptions: {
          type: "number",
          min: 1,
          step: 1,
          label: this.translateService.instant("Max. cooling (Celsius degrees below ambient)"),
          description: this.translateService.instant(
            "A positive whole number that represents how many Celsius below ambient temperature this camera can " +
              "be cooled."
          )
        }
      },
      {
        key: "backFocus",
        type: "input",
        wrappers: ["default-wrapper"],
        id: "camera-field-back-focus",
        expressionProperties: {
          "templateOptions.disabled": () => this.brandCreation.inProgress
        },
        templateOptions: {
          type: "number",
          min: 1,
          step: 0.1,
          label: this.translateService.instant("Back focus (in mm)"),
          description: this.translateService.instant("Camera back focus in mm.")
        }
      },
      this._getImageField()
    ];
  }

  private _onSensorSearch(term: string) {
    this.sensorCreation.name = term;

    if (!this.sensorCreation.name) {
      return of([]);
    }

    const field = this.fields.find(f => f.key === "sensor");
    this.store$.dispatch(new FindAllEquipmentItems({ q: this.sensorCreation.name, type: EquipmentItemType.SENSOR }));
    field.templateOptions.options = this.actions$.pipe(
      ofType(EquipmentActionTypes.FIND_ALL_EQUIPMENT_ITEMS_SUCCESS),
      map((action: FindAllEquipmentItemsSuccess) => action.payload.items),
      tap(items => {
        items.forEach(item => this.store$.dispatch(new LoadBrand({ id: item.brand })));
        return items;
      }),
      switchMap(items =>
        this.store$.select(selectBrands).pipe(
          filter(brands => brands && brands.length > 0),
          map(brands => ({
            brands,
            items
          }))
        )
      ),
      map((result: { brands: BrandInterface[]; items: SensorInterface[] }) =>
        result.items.map(sensor => {
          const brand = result.brands.find(b => b.id === sensor.brand);
          return {
            value: sensor.id,
            label: `${brand.name} ${sensor.name}`,
            brand,
            sensor
          };
        })
      )
    );
  }
}
