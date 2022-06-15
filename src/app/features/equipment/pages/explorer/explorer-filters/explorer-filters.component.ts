import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from "@angular/core";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { Store } from "@ngrx/store";
import { State } from "@app/store/state";
import { EquipmentItemType } from "@features/equipment/types/equipment-item-base.interface";
import { EquipmentItemService } from "@features/equipment/services/equipment-item.service";
import { CameraDisplayProperty, CameraService } from "@features/equipment/services/camera.service";
import { IconProp } from "@fortawesome/fontawesome-svg-core";
import { CameraType } from "@features/equipment/types/camera.interface";
import { SensorDisplayProperty, SensorService } from "@features/equipment/services/sensor.service";
import { ColorOrMono } from "@features/equipment/types/sensor.interface";
import { UtilsService } from "@shared/services/utils/utils.service";
import { WindowRefService } from "@shared/services/window-ref.service";
import { Location } from "@angular/common";
import { CookieService } from "ngx-cookie-service";
import { SimplifiedSubscriptionName, SubscriptionName } from "@shared/types/subscription-name.type";
import { map, switchMap } from "rxjs/operators";
import { UserSubscriptionService } from "@shared/services/user-subscription/user-subscription.service";
import { Observable } from "rxjs";
import { NgbModal, NgbModalRef } from "@ng-bootstrap/ng-bootstrap";
import { SubscriptionRequiredModalComponent } from "@shared/components/misc/subscription-required-modal/subscription-required-modal.component";
import { TelescopeDisplayProperty, TelescopeService } from "@features/equipment/services/telescope.service";
import { TelescopeType } from "@features/equipment/types/telescope.interface";
import { MountDisplayProperty, MountService } from "@features/equipment/services/mount.service";
import { MountType } from "@features/equipment/types/mount.interface";
import { FilterDisplayProperty, FilterService } from "@features/equipment/services/filter.service";
import { FilterType } from "@features/equipment/types/filter.interface";

const COOKIE = "astrobin-equipment-explorer-filter-data";

enum ExplorerFilterWidget {
  TOGGLE,
  SELECT,
  NUMBER_RANGE
}

export enum ExplorerFilterType {
  CAMERA_TYPE = "camera-type",
  CAMERA_COOLED = "camera-cooled",
  CAMERA_MAX_COOLING = "camera-max-cooling",
  CAMERA_BACK_FOCUS = "camera-back-focus",
  CAMERA_SENSOR_QUANTUM_EFFICIENCY = "camera-sensor-quantum-efficiency",
  CAMERA_SENSOR_PIXEL_SIZE = "camera-sensor-pixel-size",
  CAMERA_SENSOR_PIXEL_WIDTH = "camera-sensor-pixel-width",
  CAMERA_SENSOR_PIXEL_HEIGHT = "camera-sensor-pixel-height",
  CAMERA_SENSOR_WIDTH = "camera-sensor-width",
  CAMERA_SENSOR_HEIGHT = "camera-sensor-height",
  CAMERA_SENSOR_FULL_WELL_CAPACITY = "camera-sensor-full-well-capacity",
  CAMERA_SENSOR_READ_NOISE = "camera-sensor-read-noise",
  CAMERA_SENSOR_FRAME_RATE = "camera-sensor-frame-rate",
  CAMERA_SENSOR_ADC = "camera-sensor-adc",
  CAMERA_SENSOR_COLOR_OR_MONO = "camera-sensor-color-or-mono",

  SENSOR_QUANTUM_EFFICIENCY = "sensor-quantum-efficiency",
  SENSOR_PIXEL_SIZE = "sensor-pixel-size",
  SENSOR_PIXEL_WIDTH = "sensor-pixel-width",
  SENSOR_PIXEL_HEIGHT = "sensor-pixel-height",
  SENSOR_WIDTH = "sensor-width",
  SENSOR_HEIGHT = "sensor-height",
  SENSOR_FULL_WELL_CAPACITY = "sensor-full-well-capacity",
  SENSOR_READ_NOISE = "sensor-read-noise",
  SENSOR_FRAME_RATE = "sensor-frame-rate",
  SENSOR_ADC = "sensor-adc",
  SENSOR_COLOR_OR_MONO = "sensor-color-or-mono",

  TELESCOPE_TYPE = "telescope-type",
  TELESCOPE_APERTURE = "telescope-aperture",
  TELESCOPE_FOCAL_LENGTH = "telescope-focal-length",
  TELESCOPE_WEIGHT = "telescope-weight",

  MOUNT_TYPE = "mount-type",
  MOUNT_WEIGHT = "mount-weight",
  MOUNT_MAX_PAYLOAD = "mount-max-payload",
  MOUNT_COMPUTERIZED = "mount-computerized",
  MOUNT_PERIODIC_ERROR = "mount-periodic-error",
  MOUNT_PEC = "mount-pec",
  MOUNT_SLEW_SPEED = "mount-slew-speed",

  FILTER_TYPE = "filter-type",
  FILTER_BANDWIDTH = "filter-bandwidth"
}

export enum ExplorerFilterValueType {
  BOOLEAN,
  OBJECT
}

export interface ExplorerFilterInterface {
  type: ExplorerFilterType;
  label: string;
  icon: IconProp;
  widget: ExplorerFilterWidget;
  items?: { value: any; label: string }[];
  value: any;
  valueType: ExplorerFilterValueType;
  humanizeValueFunction?: (value: any) => string;
}

@Component({
  selector: "astrobin-equipment-explorer-filters",
  templateUrl: "./explorer-filters.component.html",
  styleUrls: ["./explorer-filters.component.scss"]
})
export class ExplorerFiltersComponent extends BaseComponentDirective implements OnInit, OnChanges {
  readonly FilterWidget = ExplorerFilterWidget;
  readonly SimplifiedSubscriptionName = SimplifiedSubscriptionName;

  @Input()
  type: EquipmentItemType;

  @Input()
  activeFilters: ExplorerFilterInterface[] = [];

  @Output()
  applied = new EventEmitter<ExplorerFilterInterface[]>();

  availableFilters: ExplorerFilterInterface[] = [];

  changed = false;

  permissions$: Observable<{ mayAccess: boolean }> = this.currentUserProfile$.pipe(
    switchMap(profile =>
      this.userSubscriptionService.hasValidSubscription$(profile, [SubscriptionName.ASTROBIN_ULTIMATE_2020])
    ),
    map(isUltimate => ({ mayAccess: isUltimate }))
  );

  constructor(
    public readonly store$: Store<State>,
    public readonly equipmentItemService: EquipmentItemService,
    public readonly cameraService: CameraService,
    public readonly sensorService: SensorService,
    public readonly telescopeService: TelescopeService,
    public readonly mountService: MountService,
    public readonly filterService: FilterService,
    public readonly windowRefService: WindowRefService,
    public readonly location: Location,
    public readonly cookieService: CookieService,
    public readonly userSubscriptionService: UserSubscriptionService,
    public readonly modalService: NgbModal
  ) {
    super(store$);
  }

  ngOnInit(): void {
    this._buildAvailableFilters();

    this.buildFromCookie();

    // URL overrides cookie.

    this.buildFromUrl();
    this.updateUrl();

    this.updateCookie();

    this.changed = false;
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.type && !changes.type.firstChange) {
      this._buildAvailableFilters();
      this.activeFilters = [];
      this.buildFromCookie();
      this.buildFromUrl();
      this.apply();
    }
  }

  buildFromCookie(): void {
    const cookieDataJson = this.cookieService.get(`${COOKIE}-${this.type.toLowerCase()}`);
    if (!!cookieDataJson) {
      const cookieData: { type: ExplorerFilterType; value: any }[] = JSON.parse(cookieDataJson);

      for (const availableFilter of this.availableFilters) {
        const matchingCookieData = cookieData.filter(entry => entry.type === availableFilter.type);
        if (matchingCookieData.length === 1) {
          const value = matchingCookieData[0].value;

          if (value !== null) {
            const filterWithValue = { ...availableFilter };
            filterWithValue.value = value;
            this.addFilter(filterWithValue);
          }
        }
      }
    }
  }

  updateCookie(): void {
    this.cookieService.set(
      `${COOKIE}-${this.type.toLowerCase()}`,
      JSON.stringify(this.activeFilters.map(activeFilter => ({ type: activeFilter.type, value: activeFilter.value }))),
      null,
      "/"
    );
  }

  buildFromUrl(): void {
    const urlObject = this.windowRefService.getCurrentUrl();
    const search: string = urlObject.search;

    for (const availableFilter of this.availableFilters) {
      let value: any = UtilsService.getUrlParam(search, availableFilter.type);

      if (value !== null) {
        if (availableFilter.valueType === ExplorerFilterValueType.OBJECT) {
          value = JSON.parse(value);
        } else if (availableFilter.valueType === ExplorerFilterValueType.BOOLEAN) {
          value = value === "true";
        }

        const filterWithValue = { ...availableFilter };
        filterWithValue.value = value;
        this.addFilter(filterWithValue);
      }
    }
  }

  updateUrl(): void {
    const urlObject = this.windowRefService.getCurrentUrl();

    let url: string = urlObject.pathname + urlObject.search + urlObject.hash;

    for (const activeFilter of this.activeFilters) {
      let value = activeFilter.value;

      if (activeFilter.valueType === ExplorerFilterValueType.OBJECT) {
        value = JSON.stringify(value);
      }

      url = UtilsService.addOrUpdateUrlParam(url, activeFilter.type, value);
      this.location.replaceState(url);
    }

    for (const filterKey of Object.keys(ExplorerFilterType)) {
      const filterType = ExplorerFilterType[filterKey];

      if (
        UtilsService.getUrlParam(url, filterType) !== null &&
        this.activeFilters.filter(activeFilter => activeFilter.type === filterType).length === 0
      ) {
        url = UtilsService.removeUrlParam(url, filterType);
      }

      this.location.replaceState(url);
    }
  }

  addFilter(filter: ExplorerFilterInterface): void {
    this.removeFilter(filter);
    this.activeFilters.push(filter);
    this.changed = true;
  }

  removeFilter(filter: ExplorerFilterInterface): void {
    this.activeFilters = this.activeFilters.filter(activeFilter => activeFilter.type !== filter.type);
    this.changed = true;
  }

  clearFilters(): void {
    this.activeFilters = [];
    this.changed = true;
  }

  isActive(filter: ExplorerFilterInterface): boolean {
    return this.activeFilters.filter(activeFilter => activeFilter.type === filter.type).length > 0;
  }

  setFilterValue(filter: ExplorerFilterInterface, value: any): void {
    filter.value = value;
    this.changed = true;
  }

  apply(): void {
    this.updateCookie();
    this.updateUrl();
    this.changed = false;
    this.applied.emit(this.activeFilters);
  }

  showSubscriptionRequiredModal(): void {
    const modal: NgbModalRef = this.modalService.open(SubscriptionRequiredModalComponent);
    const component: SubscriptionRequiredModalComponent = modal.componentInstance;
    component.minimumSubscription = SimplifiedSubscriptionName.ASTROBIN_ULTIMATE_2020;
  }

  _buildAvailableFilters(): void {
    this.availableFilters = [];

    switch (this.type) {
      case EquipmentItemType.CAMERA:
        this.availableFilters.push({
          type: ExplorerFilterType.CAMERA_TYPE,
          label: this.equipmentItemService.getPrintablePropertyName(this.type, CameraDisplayProperty.TYPE, false),
          icon: "camera",
          widget: ExplorerFilterWidget.SELECT,
          items: Object.keys(CameraType).map(cameraType => ({
            value: cameraType,
            label: this.cameraService.humanizeType(cameraType as CameraType)
          })),
          value: null,
          valueType: ExplorerFilterValueType.OBJECT,
          humanizeValueFunction: this.cameraService.humanizeType.bind(this.cameraService)
        });

        this.availableFilters.push({
          type: ExplorerFilterType.CAMERA_COOLED,
          label: this.equipmentItemService.getPrintablePropertyName(this.type, CameraDisplayProperty.COOLED, false),
          icon: "icicles",
          widget: ExplorerFilterWidget.TOGGLE,
          value: true,
          valueType: ExplorerFilterValueType.BOOLEAN
        });

        this.availableFilters.push({
          type: ExplorerFilterType.CAMERA_MAX_COOLING,
          label: this.equipmentItemService.getPrintablePropertyName(this.type, CameraDisplayProperty.MAX_COOLING, true),
          icon: "thermometer",
          widget: ExplorerFilterWidget.NUMBER_RANGE,
          value: {
            from: 0,
            to: 100
          },
          valueType: ExplorerFilterValueType.OBJECT
        });

        this.availableFilters.push({
          type: ExplorerFilterType.CAMERA_BACK_FOCUS,
          label: this.equipmentItemService.getPrintablePropertyName(this.type, CameraDisplayProperty.BACK_FOCUS, false),
          icon: "star",
          widget: ExplorerFilterWidget.NUMBER_RANGE,
          value: {
            from: 0,
            to: 100
          },
          valueType: ExplorerFilterValueType.OBJECT
        });

        this.availableFilters.push({
          type: ExplorerFilterType.CAMERA_SENSOR_QUANTUM_EFFICIENCY,
          label: this.equipmentItemService.getPrintablePropertyName(
            EquipmentItemType.SENSOR,
            SensorDisplayProperty.QUANTUM_EFFICIENCY,
            false
          ),
          icon: "atom",
          widget: ExplorerFilterWidget.NUMBER_RANGE,
          value: {
            from: 0,
            to: 100
          },
          valueType: ExplorerFilterValueType.OBJECT
        });

        this.availableFilters.push({
          type: ExplorerFilterType.CAMERA_SENSOR_PIXEL_SIZE,
          label: this.equipmentItemService.getPrintablePropertyName(
            EquipmentItemType.SENSOR,
            SensorDisplayProperty.PIXEL_SIZE,
            false
          ),
          icon: "ruler",
          widget: ExplorerFilterWidget.NUMBER_RANGE,
          value: {
            from: 0,
            to: 10
          },
          valueType: ExplorerFilterValueType.OBJECT
        });

        this.availableFilters.push({
          type: ExplorerFilterType.CAMERA_SENSOR_PIXEL_WIDTH,
          label: this.equipmentItemService.getPrintablePropertyName(
            EquipmentItemType.SENSOR,
            SensorDisplayProperty.PIXEL_WIDTH,
            true
          ),
          icon: "arrow-right",
          widget: ExplorerFilterWidget.NUMBER_RANGE,
          value: {
            from: 0,
            to: 100000
          },
          valueType: ExplorerFilterValueType.OBJECT
        });

        this.availableFilters.push({
          type: ExplorerFilterType.CAMERA_SENSOR_PIXEL_HEIGHT,
          label: this.equipmentItemService.getPrintablePropertyName(
            EquipmentItemType.SENSOR,
            SensorDisplayProperty.PIXEL_HEIGHT,
            true
          ),
          icon: "arrow-up",
          widget: ExplorerFilterWidget.NUMBER_RANGE,
          value: {
            from: 0,
            to: 100000
          },
          valueType: ExplorerFilterValueType.OBJECT
        });

        this.availableFilters.push({
          type: ExplorerFilterType.CAMERA_SENSOR_WIDTH,
          label: this.equipmentItemService.getPrintablePropertyName(
            EquipmentItemType.SENSOR,
            SensorDisplayProperty.SENSOR_WIDTH,
            false
          ),
          icon: "microchip",
          widget: ExplorerFilterWidget.NUMBER_RANGE,
          value: {
            from: 0,
            to: 100
          },
          valueType: ExplorerFilterValueType.OBJECT
        });

        this.availableFilters.push({
          type: ExplorerFilterType.CAMERA_SENSOR_HEIGHT,
          label: this.equipmentItemService.getPrintablePropertyName(
            EquipmentItemType.SENSOR,
            SensorDisplayProperty.SENSOR_HEIGHT,
            false
          ),
          icon: "microchip",
          widget: ExplorerFilterWidget.NUMBER_RANGE,
          value: {
            from: 0,
            to: 100
          },
          valueType: ExplorerFilterValueType.OBJECT
        });

        this.availableFilters.push({
          type: ExplorerFilterType.CAMERA_SENSOR_FULL_WELL_CAPACITY,
          label: this.equipmentItemService.getPrintablePropertyName(
            EquipmentItemType.SENSOR,
            SensorDisplayProperty.FULL_WELL_CAPACITY,
            false
          ),
          icon: "eye-dropper",
          widget: ExplorerFilterWidget.NUMBER_RANGE,
          value: {
            from: 0,
            to: 100000
          },
          valueType: ExplorerFilterValueType.OBJECT
        });

        this.availableFilters.push({
          type: ExplorerFilterType.CAMERA_SENSOR_READ_NOISE,
          label: this.equipmentItemService.getPrintablePropertyName(
            EquipmentItemType.SENSOR,
            SensorDisplayProperty.READ_NOISE,
            false
          ),
          icon: "fire",
          widget: ExplorerFilterWidget.NUMBER_RANGE,
          value: {
            from: 0,
            to: 10
          },
          valueType: ExplorerFilterValueType.OBJECT
        });

        this.availableFilters.push({
          type: ExplorerFilterType.CAMERA_SENSOR_FRAME_RATE,
          label: this.equipmentItemService.getPrintablePropertyName(
            EquipmentItemType.SENSOR,
            SensorDisplayProperty.FRAME_RATE,
            false
          ),
          icon: "video",
          widget: ExplorerFilterWidget.NUMBER_RANGE,
          value: {
            from: 0,
            to: 1000
          },
          valueType: ExplorerFilterValueType.OBJECT
        });

        this.availableFilters.push({
          type: ExplorerFilterType.CAMERA_SENSOR_ADC,
          label: this.equipmentItemService.getPrintablePropertyName(
            EquipmentItemType.SENSOR,
            SensorDisplayProperty.ADC,
            false
          ),
          icon: "laptop",
          widget: ExplorerFilterWidget.NUMBER_RANGE,
          value: {
            from: 8,
            to: 32
          },
          valueType: ExplorerFilterValueType.OBJECT
        });

        this.availableFilters.push({
          type: ExplorerFilterType.CAMERA_SENSOR_COLOR_OR_MONO,
          label: this.equipmentItemService.getPrintablePropertyName(
            EquipmentItemType.SENSOR,
            SensorDisplayProperty.COLOR_OR_MONO,
            false
          ),
          icon: "rainbow",
          widget: ExplorerFilterWidget.SELECT,
          items: Object.keys(ColorOrMono).map(colorOrMono => ({
            value: colorOrMono,
            label: this.sensorService.humanizeColorOrMono(colorOrMono as ColorOrMono)
          })),
          value: null,
          valueType: ExplorerFilterValueType.OBJECT,
          humanizeValueFunction: this.sensorService.humanizeColorOrMono.bind(this.sensorService)
        });

        break;

      case EquipmentItemType.SENSOR:
        this.availableFilters.push({
          type: ExplorerFilterType.SENSOR_QUANTUM_EFFICIENCY,
          label: this.equipmentItemService.getPrintablePropertyName(
            EquipmentItemType.SENSOR,
            SensorDisplayProperty.QUANTUM_EFFICIENCY,
            false
          ),
          icon: "atom",
          widget: ExplorerFilterWidget.NUMBER_RANGE,
          value: {
            from: 0,
            to: 100
          },
          valueType: ExplorerFilterValueType.OBJECT
        });

        this.availableFilters.push({
          type: ExplorerFilterType.SENSOR_PIXEL_SIZE,
          label: this.equipmentItemService.getPrintablePropertyName(
            EquipmentItemType.SENSOR,
            SensorDisplayProperty.PIXEL_SIZE,
            false
          ),
          icon: "ruler",
          widget: ExplorerFilterWidget.NUMBER_RANGE,
          value: {
            from: 0,
            to: 10
          },
          valueType: ExplorerFilterValueType.OBJECT
        });

        this.availableFilters.push({
          type: ExplorerFilterType.SENSOR_PIXEL_WIDTH,
          label: this.equipmentItemService.getPrintablePropertyName(
            EquipmentItemType.SENSOR,
            SensorDisplayProperty.PIXEL_WIDTH,
            true
          ),
          icon: "arrow-right",
          widget: ExplorerFilterWidget.NUMBER_RANGE,
          value: {
            from: 0,
            to: 100000
          },
          valueType: ExplorerFilterValueType.OBJECT
        });

        this.availableFilters.push({
          type: ExplorerFilterType.SENSOR_PIXEL_HEIGHT,
          label: this.equipmentItemService.getPrintablePropertyName(
            EquipmentItemType.SENSOR,
            SensorDisplayProperty.PIXEL_HEIGHT,
            true
          ),
          icon: "arrow-up",
          widget: ExplorerFilterWidget.NUMBER_RANGE,
          value: {
            from: 0,
            to: 100000
          },
          valueType: ExplorerFilterValueType.OBJECT
        });

        this.availableFilters.push({
          type: ExplorerFilterType.SENSOR_WIDTH,
          label: this.equipmentItemService.getPrintablePropertyName(
            EquipmentItemType.SENSOR,
            SensorDisplayProperty.SENSOR_WIDTH,
            false
          ),
          icon: "microchip",
          widget: ExplorerFilterWidget.NUMBER_RANGE,
          value: {
            from: 0,
            to: 100
          },
          valueType: ExplorerFilterValueType.OBJECT
        });

        this.availableFilters.push({
          type: ExplorerFilterType.SENSOR_HEIGHT,
          label: this.equipmentItemService.getPrintablePropertyName(
            EquipmentItemType.SENSOR,
            SensorDisplayProperty.SENSOR_HEIGHT,
            false
          ),
          icon: "microchip",
          widget: ExplorerFilterWidget.NUMBER_RANGE,
          value: {
            from: 0,
            to: 100
          },
          valueType: ExplorerFilterValueType.OBJECT
        });

        this.availableFilters.push({
          type: ExplorerFilterType.SENSOR_FULL_WELL_CAPACITY,
          label: this.equipmentItemService.getPrintablePropertyName(
            EquipmentItemType.SENSOR,
            SensorDisplayProperty.FULL_WELL_CAPACITY,
            false
          ),
          icon: "eye-dropper",
          widget: ExplorerFilterWidget.NUMBER_RANGE,
          value: {
            from: 0,
            to: 100000
          },
          valueType: ExplorerFilterValueType.OBJECT
        });

        this.availableFilters.push({
          type: ExplorerFilterType.SENSOR_READ_NOISE,
          label: this.equipmentItemService.getPrintablePropertyName(
            EquipmentItemType.SENSOR,
            SensorDisplayProperty.READ_NOISE,
            false
          ),
          icon: "fire",
          widget: ExplorerFilterWidget.NUMBER_RANGE,
          value: {
            from: 0,
            to: 10
          },
          valueType: ExplorerFilterValueType.OBJECT
        });

        this.availableFilters.push({
          type: ExplorerFilterType.SENSOR_FRAME_RATE,
          label: this.equipmentItemService.getPrintablePropertyName(
            EquipmentItemType.SENSOR,
            SensorDisplayProperty.FRAME_RATE,
            false
          ),
          icon: "video",
          widget: ExplorerFilterWidget.NUMBER_RANGE,
          value: {
            from: 0,
            to: 1000
          },
          valueType: ExplorerFilterValueType.OBJECT
        });

        this.availableFilters.push({
          type: ExplorerFilterType.SENSOR_ADC,
          label: this.equipmentItemService.getPrintablePropertyName(
            EquipmentItemType.SENSOR,
            SensorDisplayProperty.ADC,
            false
          ),
          icon: "laptop",
          widget: ExplorerFilterWidget.NUMBER_RANGE,
          value: {
            from: 8,
            to: 32
          },
          valueType: ExplorerFilterValueType.OBJECT
        });

        this.availableFilters.push({
          type: ExplorerFilterType.SENSOR_COLOR_OR_MONO,
          label: this.equipmentItemService.getPrintablePropertyName(
            EquipmentItemType.SENSOR,
            SensorDisplayProperty.COLOR_OR_MONO,
            false
          ),
          icon: "rainbow",
          widget: ExplorerFilterWidget.SELECT,
          items: Object.keys(ColorOrMono).map(colorOrMono => ({
            value: colorOrMono,
            label: this.sensorService.humanizeColorOrMono(colorOrMono as ColorOrMono)
          })),
          value: null,
          valueType: ExplorerFilterValueType.OBJECT,
          humanizeValueFunction: this.sensorService.humanizeColorOrMono.bind(this.sensorService)
        });

        break;

      case EquipmentItemType.TELESCOPE:
        this.availableFilters.push({
          type: ExplorerFilterType.TELESCOPE_TYPE,
          label: this.equipmentItemService.getPrintablePropertyName(
            EquipmentItemType.TELESCOPE,
            TelescopeDisplayProperty.TYPE,
            false
          ),
          icon: "bars",
          widget: ExplorerFilterWidget.SELECT,
          items: Object.keys(TelescopeType).map(telescopeType => ({
            value: telescopeType,
            label: this.telescopeService.humanizeType(telescopeType as TelescopeType)
          })),
          value: null,
          valueType: ExplorerFilterValueType.OBJECT,
          humanizeValueFunction: this.telescopeService.humanizeType.bind(this.telescopeService)
        });

        this.availableFilters.push({
          type: ExplorerFilterType.TELESCOPE_APERTURE,
          label: this.equipmentItemService.getPrintablePropertyName(
            EquipmentItemType.TELESCOPE,
            TelescopeDisplayProperty.APERTURE,
            false
          ),
          icon: "circle",
          widget: ExplorerFilterWidget.NUMBER_RANGE,
          value: {
            from: 0,
            to: 1000
          },
          valueType: ExplorerFilterValueType.OBJECT
        });

        this.availableFilters.push({
          type: ExplorerFilterType.TELESCOPE_FOCAL_LENGTH,
          label: this.equipmentItemService.getPrintablePropertyName(
            EquipmentItemType.TELESCOPE,
            TelescopeDisplayProperty.FOCAL_LENGTH,
            false
          ),
          icon: "plus-circle",
          widget: ExplorerFilterWidget.NUMBER_RANGE,
          value: {
            from: 0,
            to: 10000
          },
          valueType: ExplorerFilterValueType.OBJECT
        });

        this.availableFilters.push({
          type: ExplorerFilterType.TELESCOPE_WEIGHT,
          label: this.equipmentItemService.getPrintablePropertyName(
            EquipmentItemType.TELESCOPE,
            TelescopeDisplayProperty.WEIGHT,
            false
          ),
          icon: "balance-scale",
          widget: ExplorerFilterWidget.NUMBER_RANGE,
          value: {
            from: 0,
            to: 1000
          },
          valueType: ExplorerFilterValueType.OBJECT
        });

        break;

      case EquipmentItemType.MOUNT:
        this.availableFilters.push({
          type: ExplorerFilterType.MOUNT_TYPE,
          label: this.equipmentItemService.getPrintablePropertyName(
            EquipmentItemType.MOUNT,
            MountDisplayProperty.TYPE,
            false
          ),
          icon: "bars",
          widget: ExplorerFilterWidget.SELECT,
          items: Object.keys(MountType).map(mountType => ({
            value: mountType,
            label: this.mountService.humanizeType(mountType as MountType)
          })),
          value: null,
          valueType: ExplorerFilterValueType.OBJECT,
          humanizeValueFunction: this.mountService.humanizeType.bind(this.mountService)
        });

        this.availableFilters.push({
          type: ExplorerFilterType.MOUNT_WEIGHT,
          label: this.equipmentItemService.getPrintablePropertyName(
            EquipmentItemType.MOUNT,
            MountDisplayProperty.WEIGHT,
            false
          ),
          icon: "balance-scale",
          widget: ExplorerFilterWidget.NUMBER_RANGE,
          value: {
            from: 0,
            to: 1000
          },
          valueType: ExplorerFilterValueType.OBJECT
        });

        this.availableFilters.push({
          type: ExplorerFilterType.MOUNT_MAX_PAYLOAD,
          label: this.equipmentItemService.getPrintablePropertyName(
            EquipmentItemType.MOUNT,
            MountDisplayProperty.MAX_PAYLOAD,
            false
          ),
          icon: "dumbbell",
          widget: ExplorerFilterWidget.NUMBER_RANGE,
          value: {
            from: 0,
            to: 1000
          },
          valueType: ExplorerFilterValueType.OBJECT
        });

        this.availableFilters.push({
          type: ExplorerFilterType.MOUNT_COMPUTERIZED,
          label: this.equipmentItemService.getPrintablePropertyName(
            EquipmentItemType.MOUNT,
            MountDisplayProperty.COMPUTERIZED,
            false
          ),
          icon: "laptop",
          widget: ExplorerFilterWidget.TOGGLE,
          value: true,
          valueType: ExplorerFilterValueType.BOOLEAN
        });

        this.availableFilters.push({
          type: ExplorerFilterType.MOUNT_PERIODIC_ERROR,
          label: this.equipmentItemService.getPrintablePropertyName(
            EquipmentItemType.MOUNT,
            MountDisplayProperty.PERIODIC_ERROR,
            false
          ),
          icon: "exclamation-triangle",
          widget: ExplorerFilterWidget.NUMBER_RANGE,
          value: {
            from: 0,
            to: 10
          },
          valueType: ExplorerFilterValueType.OBJECT
        });

        this.availableFilters.push({
          type: ExplorerFilterType.MOUNT_PEC,
          label: this.equipmentItemService.getPrintablePropertyName(
            EquipmentItemType.MOUNT,
            MountDisplayProperty.PEC,
            false
          ),
          icon: "chart-line",
          widget: ExplorerFilterWidget.TOGGLE,
          value: true,
          valueType: ExplorerFilterValueType.BOOLEAN
        });

        this.availableFilters.push({
          type: ExplorerFilterType.MOUNT_SLEW_SPEED,
          label: this.equipmentItemService.getPrintablePropertyName(
            EquipmentItemType.MOUNT,
            MountDisplayProperty.SLEW_SPEED,
            false
          ),
          icon: "tachometer-alt",
          widget: ExplorerFilterWidget.NUMBER_RANGE,
          value: {
            from: 0,
            to: 10
          },
          valueType: ExplorerFilterValueType.OBJECT
        });

        break;

      case EquipmentItemType.FILTER:
        this.availableFilters.push({
          type: ExplorerFilterType.FILTER_TYPE,
          label: this.equipmentItemService.getPrintablePropertyName(
            EquipmentItemType.FILTER,
            FilterDisplayProperty.TYPE,
            false
          ),
          icon: "bars",
          widget: ExplorerFilterWidget.SELECT,
          items: Object.keys(FilterType).map(filterType => ({
            value: filterType,
            label: this.filterService.humanizeType(filterType as FilterType)
          })),
          value: null,
          valueType: ExplorerFilterValueType.OBJECT,
          humanizeValueFunction: this.filterService.humanizeType.bind(this.filterService)
        });

        this.availableFilters.push({
          type: ExplorerFilterType.FILTER_BANDWIDTH,
          label: this.equipmentItemService.getPrintablePropertyName(
            EquipmentItemType.FILTER,
            FilterDisplayProperty.BANDWIDTH,
            false
          ),
          icon: "filter",
          widget: ExplorerFilterWidget.NUMBER_RANGE,
          value: {
            from: 0,
            to: 20
          },
          valueType: ExplorerFilterValueType.OBJECT
        });

        break;

      default:
        this.availableFilters = [];
        this.activeFilters = [];
    }
  }
}
