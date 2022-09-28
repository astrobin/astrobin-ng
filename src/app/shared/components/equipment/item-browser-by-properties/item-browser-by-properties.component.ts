import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnInit,
  Output,
  QueryList,
  ViewChildren
} from "@angular/core";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { Store } from "@ngrx/store";
import { LoadingService } from "@shared/services/loading.service";
import { FormGroup } from "@angular/forms";
import { FormlyFieldConfig } from "@ngx-formly/core";
import { TranslateService } from "@ngx-translate/core";
import { EquipmentItemType } from "@features/equipment/types/equipment-item-base.interface";
import {
  EquipmentItemDisplayProperty,
  EquipmentItemService
} from "@features/equipment/services/equipment-item.service";
import { debounceTime, distinctUntilChanged, filter, map, take, takeUntil, tap } from "rxjs/operators";
import { EquipmentApiService } from "@features/equipment/services/equipment-api.service";
import { fromEvent, Observable } from "rxjs";
import { Actions, ofType } from "@ngrx/effects";
import { EquipmentActionTypes, LoadSensor, LoadSensorSuccess } from "@features/equipment/store/equipment.actions";
import { State } from "@app/store/state";
import { selectEquipmentItem } from "@features/equipment/store/equipment.selectors";
import { EquipmentItem } from "@features/equipment/types/equipment-item.type";
import { distinctUntilChangedObj } from "@shared/services/utils/utils.service";
import { TelescopeDisplayProperty, TelescopeService } from "@features/equipment/services/telescope.service";
import { TelescopeType } from "@features/equipment/types/telescope.interface";
import { ExplorerFilterType } from "@features/equipment/pages/explorer/explorer-filters/explorer-filters.component";
import { CameraDisplayProperty, CameraService } from "@features/equipment/services/camera.service";
import { SensorDisplayProperty, SensorService } from "@features/equipment/services/sensor.service";
import { CameraInterface, CameraType } from "@features/equipment/types/camera.interface";
import { SensorInterface } from "@features/equipment/types/sensor.interface";
import { MountDisplayProperty, MountService } from "@features/equipment/services/mount.service";
import { MountType } from "@features/equipment/types/mount.interface";
import { FilterDisplayProperty, FilterService } from "@features/equipment/services/filter.service";
import { FilterType } from "@features/equipment/types/filter.interface";
import { AccessoryDisplayProperty, AccessoryService } from "@features/equipment/services/accessory.service";
import { AccessoryType } from "@features/equipment/types/accessory.interface";

@Component({
  selector: "astrobin-item-browser-by-properties",
  templateUrl: "./item-browser-by-properties.component.html",
  styleUrls: ["./item-browser-by-properties.component.scss"]
})
export class ItemBrowserByPropertiesComponent extends BaseComponentDirective implements OnInit, AfterViewInit {
  readonly EquipmentItemType = EquipmentItemType;
  readonly EquipmentItemDisplayProperty = EquipmentItemDisplayProperty;
  readonly TelescopeDisplayProperty = TelescopeDisplayProperty;
  readonly CameraDisplayProperty = CameraDisplayProperty;
  readonly SensorDisplayProperty = SensorDisplayProperty;
  readonly MountDisplayProperty = MountDisplayProperty;
  readonly FilterDisplayProperty = FilterDisplayProperty;
  readonly AccessoryDisplayProperty = AccessoryDisplayProperty;

  fields: FormlyFieldConfig[];
  form: FormGroup = new FormGroup({});
  model: any = {};
  results: EquipmentItem[] = [];
  loadingPage = false;
  page = 1;
  hasNextPage = true;
  fetchingSensors = {};

  @Input()
  type: EquipmentItemType;

  @Output()
  itemSelected = new EventEmitter<EquipmentItem>();

  @Output()
  createClicked = new EventEmitter<void>();

  @ViewChildren("resultsScrollable", { read: ElementRef })
  private _resultsScrollable: QueryList<ElementRef>;

  constructor(
    public readonly store$: Store<State>,
    public readonly actions$: Actions,
    public readonly loadingService: LoadingService,
    public readonly translateService: TranslateService,
    public readonly equipmentItemService: EquipmentItemService,
    public readonly equipmentApiService: EquipmentApiService,
    public readonly telescopeService: TelescopeService,
    public readonly cameraService: CameraService,
    public readonly sensorService: SensorService,
    public readonly mountService: MountService,
    public readonly filterService: FilterService,
    public readonly accessoryService: AccessoryService
  ) {
    super(store$);
  }

  ngOnInit(): void {
    super.ngOnInit();

    this._setFields();

    this._loadData();

    this.form.valueChanges
      .pipe(takeUntil(this.destroyed$), debounceTime(250), distinctUntilChangedObj())
      .subscribe(() => this.onChange());
  }

  ngAfterViewInit(): void {
    this._resultsScrollable.changes.subscribe((elements: QueryList<ElementRef>) => {
      if (elements.length > 0) {
        fromEvent(elements.first.nativeElement, "scroll")
          .pipe(takeUntil(this.destroyed$), debounceTime(100), distinctUntilChanged())
          .subscribe(event => {
            this.onResultsScroll(event);
          });
      }
    });
  }

  onChange(): void {
    this.hasNextPage = true;
    this._loadData();
  }

  onResultsScroll(event) {
    if (event.target.scrollTop > (event.target.scrollHeight - event.target.offsetHeight) / 2) {
      this.loadNextPage();
    }
  }

  loadNextPage(): void {
    this._loadData(this.page + 1);
  }

  getSensor$(id: SensorInterface["id"]): Observable<EquipmentItem> {
    return this.store$.select(selectEquipmentItem, { type: EquipmentItemType.SENSOR, id });
  }

  _loadData(page = 1): void {
    if (!this.hasNextPage || this.loadingPage) {
      return;
    }

    this.loadingPage = true;

    const { type, brand, ...filters } = this.form.value;
    this.page = page;

    if (page === 1) {
      this.results = [];
    }

    this.equipmentApiService
      .findAllEquipmentItems(this.type, {
        brand: this.model.brand,
        filters: filters
          ? Object.keys(filters).map(key => ({
              type: key as ExplorerFilterType,
              value: filters[key],
              label: null,
              icon: null,
              widget: null,
              valueType: null
            }))
          : [],
        page: this.page
      })
      .pipe(
        take(1),
        tap(() => {
          this.loadingPage = false;
        })
      )
      .subscribe(items => {
        this.results = this.results.concat(items.results);
        this.hasNextPage = !!items.next;

        if (this.type === EquipmentItemType.CAMERA) {
          for (const camera of items.results as CameraInterface[]) {
            if (!!camera.sensor) {
              this.store$
                .select(selectEquipmentItem, { type: EquipmentItemType.SENSOR, id: camera.sensor })
                .pipe(take(1))
                .subscribe(sensor => {
                  if (!sensor) {
                    this.actions$
                      .pipe(
                        ofType(EquipmentActionTypes.LOAD_SENSOR_SUCCESS),
                        map((action: LoadSensorSuccess) => action.payload.item),
                        filter(item => item.id === camera.sensor)
                      )
                      .subscribe(() => delete this.fetchingSensors[camera.sensor]);

                    if (this.fetchingSensors[camera.sensor] === undefined) {
                      this.fetchingSensors[camera.sensor] = true;
                      this.store$.dispatch(new LoadSensor({ id: camera.sensor }));
                    }
                  }
                });
            }
          }
        }
      });
  }

  _setFields(): void {
    this.fields = [this._getBrandField(), ...this._getTypeDependentFields()];

    this.equipmentApiService
      .getBrandsByEquipmentType(this.type)
      .pipe(
        map(response =>
          response.results.map(brand => ({
            label: brand.name,
            value: brand.id,
            brand
          }))
        )
      )
      .subscribe(options => {
        this.fields.find(brandField => brandField.key === "brand").templateOptions.options = options;
      });
  }

  private _getBrandField(): FormlyFieldConfig {
    let label: string;

    if (this.type === EquipmentItemType.SOFTWARE) {
      label =
        `${this.translateService.instant("Brand")} / ` +
        `${this.translateService.instant("Company")} / ` +
        this.translateService.instant("Developer(s)");
    } else {
      label = `${this.translateService.instant("Brand")} / ${this.translateService.instant("Company")}`;
    }

    return {
      key: "brand",
      type: "ng-select",
      id: "brand",
      expressionProperties: {
        "templateOptions.disabled": () => this.loadingPage
      },
      templateOptions: {
        required: false,
        clearable: true,
        label,
        options: []
      }
    };
  }

  private _getTypeDependentFields(): FormlyFieldConfig[] {
    switch (this.type) {
      case EquipmentItemType.TELESCOPE:
        return [this._getTelescopeTypeField(), this._getTelescopeApertureField(), this._getTelescopeFocalLengthField()];
      case EquipmentItemType.CAMERA:
        return [this._getCameraTypeField()];
      case EquipmentItemType.MOUNT:
        return [this._getMountTypeField()];
      case EquipmentItemType.FILTER:
        return [this._getFilterTypeField()];
      case EquipmentItemType.ACCESSORY:
        return [this._getAccessoryTypeField()];
      default:
        return [];
    }
  }

  private _getTelescopeTypeField(): FormlyFieldConfig {
    return {
      key: "telescope-type",
      type: "ng-select",
      id: "telescope-type",
      expressionProperties: {
        "templateOptions.disabled": () => this.loadingPage
      },
      templateOptions: {
        label: this.telescopeService.getPrintablePropertyName(TelescopeDisplayProperty.TYPE),
        required: false,
        clearable: true,
        options: Object.keys(TelescopeType).map(telescopeType => ({
          value: TelescopeType[telescopeType],
          label: this.telescopeService.humanizeType(TelescopeType[telescopeType])
        }))
      }
    };
  }

  private _getTelescopeApertureField(): FormlyFieldConfig {
    return {
      key: "telescope-aperture",
      id: "telescope-aperture",
      expressionProperties: {
        "templateOptions.disabled": () => this.loadingPage
      },
      fieldGroupClassName: "row",
      wrappers: ["default-wrapper"],
      templateOptions: {
        label: this.telescopeService.getPrintablePropertyName(TelescopeDisplayProperty.APERTURE)
      },
      fieldGroup: [
        {
          className: "col-12 col-lg-6",
          key: "from",
          type: "input",
          wrappers: ["default-wrapper"],
          templateOptions: {
            required: false,
            label: this.translateService.instant("From"),
            type: "number",
            step: 0.1
          },
          validators: {
            validation: [
              "number",
              {
                name: "min-value",
                options: {
                  minValue: 0.1
                }
              },
              {
                name: "max-decimals",
                options: {
                  value: 2
                }
              }
            ]
          }
        },
        {
          className: "col-12 col-lg-6",
          key: "to",
          type: "input",
          wrappers: ["default-wrapper"],
          templateOptions: {
            required: false,
            label: this.translateService.instant("To"),
            type: "number",
            step: 0.1
          },
          validators: {
            validation: [
              "number",
              {
                name: "min-value",
                options: {
                  minValue: 0.1
                }
              },
              {
                name: "max-decimals",
                options: {
                  value: 2
                }
              }
            ]
          }
        }
      ]
    };
  }

  private _getTelescopeFocalLengthField(): FormlyFieldConfig {
    return {
      key: "telescope-focal-length",
      id: "telescope-focal-length",
      fieldGroupClassName: "row",
      wrappers: ["default-wrapper"],
      expressionProperties: {
        "templateOptions.disabled": () => this.loadingPage
      },
      templateOptions: {
        label: this.telescopeService.getPrintablePropertyName(TelescopeDisplayProperty.FOCAL_LENGTH)
      },
      fieldGroup: [
        {
          className: "col-12 col-lg-6",
          key: "from",
          type: "input",
          wrappers: ["default-wrapper"],
          templateOptions: {
            required: false,
            label: this.translateService.instant("From"),
            type: "number",
            step: 0.1
          },
          validators: {
            validation: [
              "number",
              {
                name: "min-value",
                options: {
                  minValue: 0.1
                }
              },
              {
                name: "max-decimals",
                options: {
                  value: 2
                }
              }
            ]
          }
        },
        {
          className: "col-12 col-lg-6",
          key: "to",
          type: "input",
          wrappers: ["default-wrapper"],
          templateOptions: {
            required: false,
            label: this.translateService.instant("To"),
            type: "number",
            step: 0.1
          },
          validators: {
            validation: [
              "number",
              {
                name: "min-value",
                options: {
                  minValue: 0.1
                }
              },
              {
                name: "max-decimals",
                options: {
                  value: 2
                }
              }
            ]
          }
        }
      ]
    };
  }

  private _getCameraTypeField(): FormlyFieldConfig {
    return {
      key: "camera-type",
      type: "ng-select",
      id: "camera-type",
      expressionProperties: {
        "templateOptions.disabled": () => this.loadingPage
      },
      templateOptions: {
        label: this.cameraService.getPrintablePropertyName(CameraDisplayProperty.TYPE),
        required: false,
        clearable: true,
        options: Object.keys(CameraType).map(cameraType => ({
          value: CameraType[cameraType],
          label: this.cameraService.humanizeType(CameraType[cameraType])
        }))
      }
    };
  }

  private _getMountTypeField(): FormlyFieldConfig {
    return {
      key: "mount-type",
      type: "ng-select",
      id: "mount-type",
      expressionProperties: {
        "templateOptions.disabled": () => this.loadingPage
      },
      templateOptions: {
        label: this.mountService.getPrintablePropertyName(MountDisplayProperty.TYPE),
        required: false,
        clearable: true,
        options: Object.keys(MountType).map(mountType => ({
          value: MountType[mountType],
          label: this.mountService.humanizeType(MountType[mountType])
        }))
      }
    };
  }

  private _getFilterTypeField(): FormlyFieldConfig {
    return {
      key: "filter-type",
      type: "ng-select",
      id: "filter-type",
      expressionProperties: {
        "templateOptions.disabled": () => this.loadingPage
      },
      templateOptions: {
        label: this.filterService.getPrintablePropertyName(FilterDisplayProperty.TYPE),
        required: false,
        clearable: true,
        options: Object.keys(FilterType).map(filterType => ({
          value: FilterType[filterType],
          label: this.filterService.humanizeType(FilterType[filterType])
        }))
      }
    };
  }

  private _getAccessoryTypeField(): FormlyFieldConfig {
    return {
      key: "accessory-type",
      type: "ng-select",
      id: "accessory-type",
      expressionProperties: {
        "templateOptions.disabled": () => this.loadingPage
      },
      templateOptions: {
        label: this.accessoryService.getPrintablePropertyName(AccessoryDisplayProperty.TYPE),
        required: false,
        clearable: true,
        options: Object.keys(AccessoryType).map(accessoryType => ({
          value: AccessoryType[accessoryType],
          label: this.accessoryService.humanizeType(AccessoryType[accessoryType])
        }))
      }
    };
  }
}
