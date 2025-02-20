import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from "@angular/core";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { EquipmentItemReviewerDecision, EquipmentItemType } from "@features/equipment/types/equipment-item-base.interface";
import { EquipmentApiService } from "@features/equipment/services/equipment-api.service";
import { BrandInterface } from "@features/equipment/types/brand.interface";
import { CameraInterface, CameraType, instanceOfCamera } from "@features/equipment/types/camera.interface";
import { TranslateService } from "@ngx-translate/core";
import { Store } from "@ngrx/store";
import { MainState } from "@app/store/state";
import { TelescopeInterface, TelescopeType } from "@features/equipment/types/telescope.interface";
import { distinctUntilKeyChangedOrNull, UtilsService } from "@core/services/utils/utils.service";
import { filter, map, switchMap, take, takeWhile, tap } from "rxjs/operators";
import { CameraDisplayProperty, CameraService } from "@features/equipment/services/camera.service";
import { selectBrand, selectEquipmentItem, selectMostOftenUsedWithForItem } from "@features/equipment/store/equipment.selectors";
import { Observable, of } from "rxjs";
import { GetMostOftenUsedWith, LoadBrand, LoadEquipmentItem, LoadSensor } from "@features/equipment/store/equipment.actions";
import { TelescopeDisplayProperty, TelescopeService } from "@features/equipment/services/telescope.service";
import { SensorDisplayProperty, SensorService } from "@features/equipment/services/sensor.service";
import { EquipmentItemDisplayProperty, EquipmentItemService } from "@core/services/equipment-item.service";
import { EquipmentItem } from "@features/equipment/types/equipment-item.type";
import { instanceOfSensor, SensorInterface } from "@features/equipment/types/sensor.interface";
import { MountInterface } from "@features/equipment/types/mount.interface";
import { MountDisplayProperty, MountService } from "@features/equipment/services/mount.service";
import { FilterInterface } from "@features/equipment/types/filter.interface";
import { FilterDisplayProperty, FilterService } from "@features/equipment/services/filter.service";
import { UserInterface } from "@core/interfaces/user.interface";
import { selectUser } from "@features/account/store/auth.selectors";
import { LoadUser } from "@features/account/store/auth.actions";
import { AccessoryDisplayProperty, AccessoryService } from "@features/equipment/services/accessory.service";
import { AccessoryInterface } from "@features/equipment/types/accessory.interface";
import { NgbModal, NgbModalRef } from "@ng-bootstrap/ng-bootstrap";
import { AssignItemModalComponent } from "@shared/components/equipment/summaries/assign-item-modal/assign-item-modal.component";
import { UserSubscriptionService } from "@core/services/user-subscription/user-subscription.service";
import { WindowRefService } from "@core/services/window-ref.service";
import { AuthService } from "@core/services/auth.service";
import { SubscriptionRequiredModalComponent } from "@shared/components/misc/subscription-required-modal/subscription-required-modal.component";
import { SimplifiedSubscriptionName } from "@core/types/subscription-name.type";
import { MostOftenUsedWithModalComponent } from "@shared/components/equipment/summaries/item/summary/most-often-used-with-modal/most-often-used-with-modal.component";
import { LoadingService } from "@core/services/loading.service";
import { MoreRelatedItemsModalComponent } from "@shared/components/equipment/summaries/item/summary/more-related-items-modal/more-related-items-modal.component";

interface EquipmentItemProperty {
  name: string;
  value: Observable<string | number>;
  link?: string;
  show?: Observable<boolean>;
}

@Component({
  selector: "astrobin-equipment-item-summary",
  templateUrl: "./item-summary.component.html",
  styleUrls: ["./item-summary.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ItemSummaryComponent extends BaseComponentDirective implements OnChanges {
  readonly UtilsService = UtilsService;
  readonly EquipmentItemDisplayProperty = EquipmentItemDisplayProperty;
  readonly SHOW_MAX_RELATED_ITEMS = 2;

  @Input() item: EquipmentItem;
  @Input() showName = true;
  @Input() showImage = true;
  @Input() showLargeImage = false;
  @Input() showProperties = true;
  @Input() showEmptyProperties = false;
  @Input() showClass = true;
  @Input() showSubItem = true;
  @Input() showMeta = false;
  @Input() showStats = true;
  @Input() showViewLink = false;
  @Input() enableBrandLink = false;
  @Input() showCommunityNotes = false;
  @Input() showMostOftenUsedWith = false;
  @Input() showEditButtons = true;
  @Input() showDataDoesNotUpdateInRealTime = true;
  @Input() striped = true;
  @Input() bordered = false;
  @Output() editButtonClick = new EventEmitter<EquipmentItem>();

  protected brand: BrandInterface;
  protected subItem: EquipmentItem;
  protected relatedItems: EquipmentItem[];
  protected subItemCollapsed = true;
  protected properties: EquipmentItemProperty[];
  protected mostOftenUsedWith$: Observable<{ item$: Observable<EquipmentItem>; matches: number }[]>;

  image: string;
  placeholder: string;
  subItemLabel: string;
  relatedItemsLabel: string;
  moreRelatedItemsLabel: string;
  createdBy$: Observable<UserInterface>;
  assignee$: Observable<UserInterface | null>;
  reviewedBy$: Observable<UserInterface>;
  lastUpdateVisible: boolean;

  constructor(
    public readonly store$: Store<MainState>,
    public readonly equipmentApiService: EquipmentApiService,
    public readonly translateService: TranslateService,
    public readonly utilsService: UtilsService,
    public readonly equipmentItemService: EquipmentItemService,
    public readonly cameraService: CameraService,
    public readonly telescopeService: TelescopeService,
    public readonly sensorService: SensorService,
    public readonly mountService: MountService,
    public readonly filterService: FilterService,
    public readonly accessoryService: AccessoryService,
    public readonly modalService: NgbModal,
    public readonly userSubscriptionService: UserSubscriptionService,
    public readonly windowRefService: WindowRefService,
    public readonly authService: AuthService,
    public readonly loadingService: LoadingService,
    public readonly changeDetectorRef: ChangeDetectorRef
  ) {
    super(store$);
  }

  private _classProperty(itemType: EquipmentItemType): EquipmentItemProperty {
    return this.showClass
      ? { name: this.translateService.instant("Class"), value: of(this.equipmentItemService.humanizeType(itemType)) }
      : null;
  }

  private _variantOfProperty(variantOfItem: EquipmentItem | null): EquipmentItemProperty {
    return variantOfItem
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
    const props: EquipmentItemProperty[] = [
      this._classProperty(EquipmentItemType.SENSOR),
      this._variantOfProperty(variantOfItem),
      { name: this.sensorService.getPrintablePropertyName(SensorDisplayProperty.PIXELS, true), value: this.sensorService.getPrintableProperty$(this.item as SensorInterface, SensorDisplayProperty.PIXELS) },
      { name: this.sensorService.getPrintablePropertyName(SensorDisplayProperty.PIXEL_SIZE, true), value: this.sensorService.getPrintableProperty$(this.item as SensorInterface, SensorDisplayProperty.PIXEL_SIZE) },
      { name: this.sensorService.getPrintablePropertyName(SensorDisplayProperty.SENSOR_SIZE, true), value: this.sensorService.getPrintableProperty$(this.item as SensorInterface, SensorDisplayProperty.SENSOR_SIZE) },
      { name: this.sensorService.getPrintablePropertyName(SensorDisplayProperty.FULL_WELL_CAPACITY, true), value: this.sensorService.getPrintableProperty$(this.item as SensorInterface, SensorDisplayProperty.FULL_WELL_CAPACITY) },
      { name: this.sensorService.getPrintablePropertyName(SensorDisplayProperty.READ_NOISE, true), value: this.sensorService.getPrintableProperty$(this.item as SensorInterface, SensorDisplayProperty.READ_NOISE) },
      { name: this.sensorService.getPrintablePropertyName(SensorDisplayProperty.QUANTUM_EFFICIENCY, true), value: this.sensorService.getPrintableProperty$(this.item as SensorInterface, SensorDisplayProperty.QUANTUM_EFFICIENCY) },
      { name: this.sensorService.getPrintablePropertyName(SensorDisplayProperty.FRAME_RATE, true), value: this.sensorService.getPrintableProperty$(this.item as SensorInterface, SensorDisplayProperty.FRAME_RATE) },
      { name: this.sensorService.getPrintablePropertyName(SensorDisplayProperty.ADC, true), value: this.sensorService.getPrintableProperty$(this.item as SensorInterface, SensorDisplayProperty.ADC) },
      { name: this.sensorService.getPrintablePropertyName(SensorDisplayProperty.COLOR_OR_MONO, true), value: this.sensorService.getPrintableProperty$(this.item as SensorInterface, SensorDisplayProperty.COLOR_OR_MONO) }
    ];
    return of(props.map(p => p ? { ...p, show: p.value.pipe(map(val => !!val || this.showEmptyProperties)) } : p));
  }

  private _cameraProperties$(variantOfItem: EquipmentItem | null): Observable<EquipmentItemProperty[]> {
    const item: CameraInterface = this.item as CameraInterface;
    const props: EquipmentItemProperty[] = [
      this._classProperty(EquipmentItemType.CAMERA),
      this._variantOfProperty(variantOfItem),
      { name: this.cameraService.getPrintablePropertyName(CameraDisplayProperty.TYPE, true), value: this.cameraService.getPrintableProperty$(item, CameraDisplayProperty.TYPE) },
      item.type === CameraType.DEDICATED_DEEP_SKY
        ? { name: this.cameraService.getPrintablePropertyName(CameraDisplayProperty.COOLED, true), value: this.cameraService.getPrintableProperty$(item, CameraDisplayProperty.COOLED) }
        : null,
      item.type === CameraType.DEDICATED_DEEP_SKY && item.cooled
        ? { name: this.cameraService.getPrintablePropertyName(CameraDisplayProperty.MAX_COOLING, true), value: this.cameraService.getPrintableProperty$(item, CameraDisplayProperty.MAX_COOLING) }
        : null,
      { name: this.cameraService.getPrintablePropertyName(CameraDisplayProperty.BACK_FOCUS, true), value: this.cameraService.getPrintableProperty$(item, CameraDisplayProperty.BACK_FOCUS) }
    ];
    return of(props.map(p => p ? { ...p, show: p.value.pipe(map(val => !!val || this.showEmptyProperties)) } : p));
  }

  private _telescopeProperties$(variantOfItem: EquipmentItem | null): Observable<EquipmentItemProperty[]> {
    const item: TelescopeInterface = this.item as TelescopeInterface;
    const type_ = { name: this.telescopeService.getPrintablePropertyName(TelescopeDisplayProperty.TYPE, true), value: this.telescopeService.getPrintableProperty$(item, TelescopeDisplayProperty.TYPE) };
    const aperture = { name: this.telescopeService.getPrintablePropertyName(TelescopeDisplayProperty.APERTURE, true), value: this.telescopeService.getPrintableProperty$(item, TelescopeDisplayProperty.APERTURE) };
    const focalLength = { name: this.telescopeService.getPrintablePropertyName(TelescopeDisplayProperty.FOCAL_LENGTH, true), value: this.telescopeService.getPrintableProperty$(item, TelescopeDisplayProperty.FOCAL_LENGTH) };
    const weight = { name: this.telescopeService.getPrintablePropertyName(TelescopeDisplayProperty.WEIGHT, true), value: this.telescopeService.getPrintableProperty$(item, TelescopeDisplayProperty.WEIGHT) };
    const props: EquipmentItemProperty[] = [
      this._classProperty(EquipmentItemType.TELESCOPE),
      this._variantOfProperty(variantOfItem),
      type_,
      item.type !== TelescopeType.CAMERA_LENS ? aperture : null,
      focalLength,
      weight
    ];
    return of(props.map(p => p ? { ...p, show: p.value.pipe(map(val => !!val || this.showEmptyProperties)) } : p));
  }

  private _mountProperties$(variantOfItem: EquipmentItem | null): Observable<EquipmentItemProperty[]> {
    const item: MountInterface = this.item as MountInterface;
    let props: EquipmentItemProperty[] = [
      this._classProperty(EquipmentItemType.MOUNT),
      this._variantOfProperty(variantOfItem),
      { name: this.mountService.getPrintablePropertyName(MountDisplayProperty.TYPE, true), value: this.mountService.getPrintableProperty$(item, MountDisplayProperty.TYPE) },
      { name: this.mountService.getPrintablePropertyName(MountDisplayProperty.WEIGHT, true), value: this.mountService.getPrintableProperty$(item, MountDisplayProperty.WEIGHT) },
      { name: this.mountService.getPrintablePropertyName(MountDisplayProperty.MAX_PAYLOAD, true), value: this.mountService.getPrintableProperty$(item, MountDisplayProperty.MAX_PAYLOAD) },
      { name: this.mountService.getPrintablePropertyName(MountDisplayProperty.COMPUTERIZED, true), value: this.mountService.getPrintableProperty$(item, MountDisplayProperty.COMPUTERIZED) }
    ];
    if (item.computerized) {
      props = [
        ...props,
        ...[
          { name: this.mountService.getPrintablePropertyName(MountDisplayProperty.PERIODIC_ERROR, true), value: this.mountService.getPrintableProperty$(item, MountDisplayProperty.PERIODIC_ERROR) },
          { name: this.mountService.getPrintablePropertyName(MountDisplayProperty.PEC, true), value: this.mountService.getPrintableProperty$(item, MountDisplayProperty.PEC) },
          { name: this.mountService.getPrintablePropertyName(MountDisplayProperty.SLEW_SPEED, true), value: this.mountService.getPrintableProperty$(item, MountDisplayProperty.SLEW_SPEED) }
        ]
      ];
    }
    return of(props.map(p => p ? { ...p, show: p.value.pipe(map(val => !!val || this.showEmptyProperties)) } : p));
  }

  private _filterProperties$(variantOfItem: EquipmentItem | null): Observable<EquipmentItemProperty[]> {
    const item: FilterInterface = this.item as FilterInterface;
    const props: EquipmentItemProperty[] = [
      this._classProperty(EquipmentItemType.FILTER),
      this._variantOfProperty(variantOfItem),
      { name: this.filterService.getPrintablePropertyName(FilterDisplayProperty.TYPE, true), value: this.filterService.getPrintableProperty$(item, FilterDisplayProperty.TYPE) },
      { name: this.filterService.getPrintablePropertyName(FilterDisplayProperty.BANDWIDTH, true), value: this.filterService.getPrintableProperty$(item, FilterDisplayProperty.BANDWIDTH) },
      { name: this.filterService.getPrintablePropertyName(FilterDisplayProperty.SIZE, true), value: this.filterService.getPrintableProperty$(item, FilterDisplayProperty.SIZE) }
    ];
    return of(props.map(p => p ? { ...p, show: p.value.pipe(map(val => !!val || this.showEmptyProperties)) } : p));
  }

  private _accessoryProperties$(variantOfItem: EquipmentItem | null): Observable<EquipmentItemProperty[]> {
    const item: AccessoryInterface = this.item as AccessoryInterface;
    const props: EquipmentItemProperty[] = [
      this._classProperty(EquipmentItemType.ACCESSORY),
      this._variantOfProperty(variantOfItem),
      { name: this.accessoryService.getPrintablePropertyName(AccessoryDisplayProperty.TYPE, true), value: this.accessoryService.getPrintableProperty$(item, AccessoryDisplayProperty.TYPE) }
    ];
    return of(props.map(p => p ? { ...p, show: p.value.pipe(map(val => !!val || this.showEmptyProperties)) } : p));
  }

  private _softwareProperties$(variantOfItem: EquipmentItem | null): Observable<EquipmentItemProperty[]> {
    const props: EquipmentItemProperty[] = [
      this._classProperty(EquipmentItemType.SOFTWARE),
      this._variantOfProperty(variantOfItem)
    ];
    return of(props.map(p => p ? { ...p, show: p.value.pipe(map(val => !!val || this.showEmptyProperties)) } : p));
  }

  private computeProperties$(): Observable<EquipmentItemProperty[]> {
    const type: EquipmentItemType = this.equipmentItemService.getType(this.item);
    const variantOf = this.item.variantOf;
    const _properties$ = (variantOfItem: EquipmentItem | null): Observable<EquipmentItemProperty[]> => {
      switch (type) {
        case EquipmentItemType.SENSOR: return this._sensorProperties$(variantOfItem);
        case EquipmentItemType.CAMERA: return this._cameraProperties$(variantOfItem);
        case EquipmentItemType.TELESCOPE: return this._telescopeProperties$(variantOfItem);
        case EquipmentItemType.MOUNT: return this._mountProperties$(variantOfItem);
        case EquipmentItemType.FILTER: return this._filterProperties$(variantOfItem);
        case EquipmentItemType.ACCESSORY: return this._accessoryProperties$(variantOfItem);
        case EquipmentItemType.SOFTWARE: return this._softwareProperties$(variantOfItem);
      }
    };
    if (variantOf) {
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

  ngOnChanges(changes: SimpleChanges): void {
    if (!this.item) {
      return;
    }

    // Compute placeholder and image
    const type = this.equipmentItemService.getType(this.item);
    this.placeholder = `/assets/images/${EquipmentItemType[type].toLowerCase()}-placeholder.png?v=2`;
    this.image = (this.item.thumbnail as string) || (this.item.image as string) || this.placeholder;

    // Compute sub-item and related items labels
    if (this.item.klass === EquipmentItemType.CAMERA) {
      this.subItemLabel = this.cameraService.getPrintablePropertyName(CameraDisplayProperty.SENSOR, true);
    } else if (this.item.klass === EquipmentItemType.SENSOR) {
      this.subItemLabel = this.sensorService.getPrintablePropertyName(SensorDisplayProperty.CAMERAS, true);
    } else {
      this.subItemLabel = this.translateService.instant("Sub-item");
    }
    this.relatedItemsLabel = instanceOfSensor(this.item)
      ? this.sensorService.getPrintablePropertyName(SensorDisplayProperty.CAMERAS, true)
      : this.translateService.instant("Related items");

    // Compute user-related observables
    if (this.item.createdBy) {
      this.createdBy$ = this.store$.select(selectUser, this.item.createdBy).pipe(distinctUntilKeyChangedOrNull("id"));
      this.store$.dispatch(new LoadUser({ id: this.item.createdBy }));
    }
    if (this.item.assignee) {
      this.assignee$ = this.store$.select(selectUser, this.item.assignee).pipe(distinctUntilKeyChangedOrNull("id"));
      this.store$.dispatch(new LoadUser({ id: this.item.assignee }));
    }
    if (this.item.reviewedBy) {
      this.reviewedBy$ = this.store$.select(selectUser, this.item.reviewedBy).pipe(distinctUntilKeyChangedOrNull("id"));
      this.store$.dispatch(new LoadUser({ id: this.item.reviewedBy }));
    }

    // Compute last update visibility
    if (!this.item.updated) {
      this.lastUpdateVisible = false;
    } else {
      const created = new Date(this.item.created).getTime();
      const updated = new Date(this.item.updated).getTime();
      this.lastUpdateVisible = updated - created >= 60000;
    }

    if (!this.item.createdBy) {
      this.showMeta = false;
    }

    if (this.item.brand) {
      this.store$
        .select(selectBrand, this.item.brand)
        .pipe(
          filter(brand => !!brand),
          takeWhile(brand => !this.brand || this.brand.id !== brand.id)
        )
        .subscribe(brand => {
          this.brand = brand;
          this.changeDetectorRef.markForCheck();
        });
    }

    if (instanceOfCamera(this.item) && this.item.sensor) {
      this.store$.dispatch(new LoadSensor({ id: this.item.sensor }));
      this.store$
        .select(selectEquipmentItem, { id: this.item.sensor, type: EquipmentItemType.SENSOR })
        .pipe(
          filter(sensor => !!sensor),
          take(1),
          tap(sensor => {
            if (sensor.brand) {
              this.store$.dispatch(new LoadBrand({ id: sensor.brand }));
            }
          })
        )
        .subscribe(sensor => {
          this.subItem = sensor;
          this.changeDetectorRef.markForCheck();
        });
    }

    if (instanceOfSensor(this.item) && this.item.cameras) {
      this.relatedItems = [];
      this.item.cameras.forEach(cameraId => {
        this.store$.dispatch(new LoadEquipmentItem({ id: cameraId, type: EquipmentItemType.CAMERA }));
        this.store$
          .select(selectEquipmentItem, { id: cameraId, type: EquipmentItemType.CAMERA })
          .pipe(
            filter(camera => !!camera),
            take(1),
            tap(camera => {
              if (camera.brand) {
                this.store$.dispatch(new LoadBrand({ id: camera.brand }));
              }
            })
          )
          .subscribe(camera => {
            this.relatedItems.push(camera);
            this.moreRelatedItemsLabel = this.relatedItems.length > this.SHOW_MAX_RELATED_ITEMS
              ? this.translateService.instant("+ {{ count }} more", { count: this.relatedItems.length - this.SHOW_MAX_RELATED_ITEMS })
              : "";
            this.changeDetectorRef.markForCheck();
          });
      });
    }

    if (this.item.reviewerDecision === EquipmentItemReviewerDecision.APPROVED && this.showMostOftenUsedWith) {
      const payload = { itemType: this.item.klass, itemId: this.item.id };
      this.store$.dispatch(new GetMostOftenUsedWith(payload));
      this.mostOftenUsedWith$ = this.store$.select(selectMostOftenUsedWithForItem, payload).pipe(
        filter(data => !!data),
        take(1),
        map(data => {
          return Object.keys(data)
            .map(key => {
              const klass: EquipmentItemType = EquipmentItemType[key.split("-")[0]];
              const id: EquipmentItem["id"] = parseInt(key.split("-")[1], 10);
              const itemPayload = { type: klass, id };
              this.store$.dispatch(new LoadEquipmentItem(itemPayload));
              return {
                item$: this.store$.select(selectEquipmentItem, itemPayload).pipe(
                  filter(item => !!item),
                  take(1)
                ),
                matches: parseInt(data[key], 10)
              };
            })
            .sort((a, b) => b.matches - a.matches);
        })
      );
    }

    this.computeProperties$().pipe(take(1)).subscribe(properties => {
      this.properties = properties.filter(p => p !== null);
      this.changeDetectorRef.markForCheck();
    });
  }

  assign() {
    const modalRef = this.modalService.open(AssignItemModalComponent);
    const componentInstance: AssignItemModalComponent = modalRef.componentInstance;
    componentInstance.item = this.item;
    modalRef.closed.subscribe((item: EquipmentItem) => {
      this.item = item;
      this.changeDetectorRef.markForCheck();
      if (item.assignee) {
        this.store$.dispatch(new LoadUser({ id: item.assignee }));
      }
    });
  }

  itemTypeSupportsMostOftenUsedWith(): boolean {
    return (
      this.item.reviewerDecision === EquipmentItemReviewerDecision.APPROVED &&
      [EquipmentItemType.CAMERA, EquipmentItemType.TELESCOPE, EquipmentItemType.MOUNT, EquipmentItemType.FILTER].indexOf(this.item.klass) > -1
    );
  }

  viewMoreRelatedItems() {
    const modalRef: NgbModalRef = this.modalService.open(MoreRelatedItemsModalComponent);
    const componentInstance: MoreRelatedItemsModalComponent = modalRef.componentInstance;
    componentInstance.items = this.relatedItems.slice(this.SHOW_MAX_RELATED_ITEMS);
    componentInstance.title = this.relatedItemsLabel;
  }

  viewMoreMostOftenUsedWith() {
    this.currentUser$.pipe(take(1)).subscribe(user => {
      if (!user) {
        this.windowRefService.locationAssign(this.authService.getLoginUrl());
        return;
      }
      this.userSubscriptionService.fullSearchAllowed$().subscribe(allowed => {
        if (allowed) {
          const modalRef: NgbModalRef = this.modalService.open(MostOftenUsedWithModalComponent);
          const componentInstance: MostOftenUsedWithModalComponent = modalRef.componentInstance;
          componentInstance.item = this.item;
        } else {
          const modalRef: NgbModalRef = this.modalService.open(SubscriptionRequiredModalComponent);
          const componentInstance: SubscriptionRequiredModalComponent = modalRef.componentInstance;
          componentInstance.minimumSubscription = SimplifiedSubscriptionName.ASTROBIN_ULTIMATE_2020;
        }
      });
    });
  }
}
