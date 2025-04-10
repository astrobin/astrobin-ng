import { Injectable } from "@angular/core";
import type { MainState } from "@app/store/state";
import { BaseService } from "@core/services/base.service";
import type { EquipmentItemService } from "@core/services/equipment-item.service";
import { EquipmentItemDisplayProperty } from "@core/services/equipment-item.service";
import type { LoadingService } from "@core/services/loading.service";
import type { PopNotificationsService } from "@core/services/pop-notifications.service";
import type { UserSubscriptionService } from "@core/services/user-subscription/user-subscription.service";
import { SimplifiedSubscriptionName, SubscriptionName } from "@core/types/subscription-name.type";
import { selectCurrentUserProfile } from "@features/account/store/auth.selectors";
import { CameraDisplayProperty } from "@features/equipment/services/camera.service";
import type { EquipmentItemServiceFactory } from "@features/equipment/services/equipment-item.service-factory";
import { SensorDisplayProperty } from "@features/equipment/services/sensor.service";
import type { SensorService } from "@features/equipment/services/sensor.service";
import { TelescopeDisplayProperty } from "@features/equipment/services/telescope.service";
import { selectEquipmentItem } from "@features/equipment/store/equipment.selectors";
import type { CameraInterface } from "@features/equipment/types/camera.interface";
import { EquipmentItemType } from "@features/equipment/types/equipment-item-base.interface";
import type { EquipmentItem } from "@features/equipment/types/equipment-item.type";
import type { SensorInterface } from "@features/equipment/types/sensor.interface";
import type { NgbModal, NgbModalRef } from "@ng-bootstrap/ng-bootstrap";
import type { Store } from "@ngrx/store";
import type { TranslateService } from "@ngx-translate/core";
import { VariantSelectorModalComponent } from "@shared/components/equipment/item-browser/variant-selector-modal/variant-selector-modal.component";
import { SubscriptionRequiredModalComponent } from "@shared/components/misc/subscription-required-modal/subscription-required-modal.component";
import { forkJoin, Observable, of, Subject } from "rxjs";
import { filter, map, switchMap, take } from "rxjs/operators";

export enum CompareServiceError {
  NON_MATCHING_CLASS = "NON_MATCHING_CLASS",
  ITEM_NOT_FOUND = "ITEM_NOT_FOUND",
  TOO_MANY_ITEMS = "TOO_MANY_ITEMS",
  ALREADY_IN_LIST = "ALREADY_IN_LIST"
}

export interface ComparisonInterface {
  [itemId: number]: {
    propertyName: string;
    id: EquipmentItem["id"];
    klass: EquipmentItemType;
    name: string;
    value$?: Observable<string>;
    value?: string;
  }[];
}

@Injectable({
  providedIn: "root"
})
export class CompareService extends BaseService {
  static readonly MAX_ITEMS = 5;

  private _items: EquipmentItem[] = [];
  private _changesSubject = new Subject<void>();

  public changes = this._changesSubject.asObservable();

  constructor(
    public readonly store$: Store<MainState>,
    public readonly loadingService: LoadingService,
    public readonly equipmentItemServiceFactory: EquipmentItemServiceFactory,
    public readonly equipmentItemService: EquipmentItemService,
    public readonly sensorService: SensorService,
    public readonly popNotificationsService: PopNotificationsService,
    public readonly translateService: TranslateService,
    public readonly userSubscriptionService: UserSubscriptionService,
    public readonly modalService: NgbModal
  ) {
    super(loadingService);
  }

  add(item: EquipmentItem): void {
    if (this.amount() > 0) {
      const first = this.get(0);
      if (item.klass !== first.klass) {
        throw new Error(CompareServiceError.NON_MATCHING_CLASS);
      }
    }

    if (this.amount() === CompareService.MAX_ITEMS) {
      throw new Error(CompareServiceError.TOO_MANY_ITEMS);
    }

    if (this.getAll().filter(filteredItem => filteredItem.id === item.id).length > 0) {
      throw new Error(CompareServiceError.ALREADY_IN_LIST);
    }

    this._items.push(item);
    this._changesSubject.next();
  }

  addWithErrorHandling(item: EquipmentItem): void {
    const _doAdd = (itemToAdd: EquipmentItem): void => {
      this.store$
        .select(selectCurrentUserProfile)
        .pipe(
          switchMap(profile =>
            this.userSubscriptionService.hasValidSubscription$(profile, [
              SubscriptionName.ASTROBIN_ULTIMATE_2020,
              SubscriptionName.ASTROBIN_ULTIMATE_2020_AUTORENEW_MONTHLY,
              SubscriptionName.ASTROBIN_ULTIMATE_2020_AUTORENEW_YEARLY
            ])
          )
        )
        .subscribe(isUltimate => {
          if (!isUltimate) {
            const modal: NgbModalRef = this.modalService.open(SubscriptionRequiredModalComponent);
            const component: SubscriptionRequiredModalComponent = modal.componentInstance;
            component.minimumSubscription = SimplifiedSubscriptionName.ASTROBIN_ULTIMATE_2020;
            return;
          }

          try {
            this.add(itemToAdd);
          } catch (e) {
            if (e.message === CompareServiceError.NON_MATCHING_CLASS) {
              this.popNotificationsService.error(
                this.translateService.instant(
                  "You already have items of a different equipment class in the comparison list."
                )
              );
            } else if (e.message === CompareServiceError.TOO_MANY_ITEMS) {
              this.popNotificationsService.error(
                this.translateService.instant("You cannot compare more than {{n}} items.", {
                  n: CompareService.MAX_ITEMS
                })
              );
            } else if (e.message === CompareServiceError.ALREADY_IN_LIST) {
              this.popNotificationsService.warning(
                this.translateService.instant("This item is already in your comparison list.")
              );
            }
          }
        });
    };

    if (item.variants?.length > 0) {
      const modal: NgbModalRef = this.modalService.open(VariantSelectorModalComponent);
      const componentInstance: VariantSelectorModalComponent = modal.componentInstance;
      componentInstance.variants = [...[item], ...item.variants].filter(variant => !variant.frozenAsAmbiguous);
      componentInstance.enableSelectFrozen = false;

      modal.closed.pipe(take(1)).subscribe((variant: EquipmentItem) => {
        _doAdd(variant);
      });
    } else {
      _doAdd(item);
    }
  }

  remove(item: EquipmentItem): void {
    const previousAmount = this.amount();
    this._items = this._items.filter(x => x.id !== item.id);

    if (this.amount() === previousAmount) {
      throw new Error(CompareServiceError.ITEM_NOT_FOUND);
    }

    this._changesSubject.next();
  }

  clear(): void {
    this._items = [];
    this._changesSubject.next();
  }

  get(index: number): EquipmentItem | null {
    if (index > this.amount() - 1) {
      return null;
    }

    return this._items[index];
  }

  getAll(): EquipmentItem[] {
    return this._items;
  }

  amount(): number {
    return this._items.length;
  }

  comparison$(): Observable<ComparisonInterface> {
    if (this.amount() === 0) {
      return of([]);
    }

    return new Observable<ComparisonInterface>(observer => {
      const first: EquipmentItem = this.get(0);
      const klass: EquipmentItemType = first.klass;
      const service = this.equipmentItemServiceFactory.getService(first);
      const printableProperties = service
        .getSupportedPrintableProperties()
        .filter(
          (prop: EquipmentItemDisplayProperty | SensorDisplayProperty | TelescopeDisplayProperty) =>
            [
              EquipmentItemDisplayProperty.NAME,
              SensorDisplayProperty.PIXEL_WIDTH,
              SensorDisplayProperty.PIXEL_HEIGHT,
              SensorDisplayProperty.SENSOR_WIDTH,
              SensorDisplayProperty.SENSOR_HEIGHT,
              TelescopeDisplayProperty.MIN_FOCAL_LENGTH,
              TelescopeDisplayProperty.MAX_FOCAL_LENGTH,
              CameraDisplayProperty.MODIFIED
            ].indexOf(prop) === -1
        );

      const data: ComparisonInterface = {};

      for (const item of this.getAll()) {
        if (!data[item.id]) {
          data[item.id] = [];
        }

        data[item.id].push({
          propertyName: EquipmentItemDisplayProperty.IMAGE,
          id: item.id,
          klass: item.klass,
          name: this.equipmentItemService.getPrintablePropertyName(
            item.klass,
            EquipmentItemDisplayProperty.IMAGE,
            true
          ),
          value$: this.equipmentItemService.getPrintableProperty$(
            item,
            EquipmentItemDisplayProperty.IMAGE,
            item.image || `/assets/images/${item.klass.toLowerCase()}-placeholder.png?v=2`
          )
        });

        data[item.id].push({
          propertyName: EquipmentItemDisplayProperty.NAME,
          id: item.id,
          klass: item.klass,
          name: this.equipmentItemService.getPrintablePropertyName(item.klass, EquipmentItemDisplayProperty.NAME, true),
          value$: this.equipmentItemService.getFullDisplayName$(item)
        });

        data[item.id].push({
          propertyName: EquipmentItemDisplayProperty.WEBSITE,
          id: item.id,
          klass: item.klass,
          name: this.equipmentItemService.getPrintablePropertyName(
            item.klass,
            EquipmentItemDisplayProperty.WEBSITE,
            true
          ),
          value$: this.equipmentItemService.getPrintableProperty$(
            item,
            EquipmentItemDisplayProperty.WEBSITE,
            item.website,
            true
          )
        });

        for (const printableProperty of printableProperties) {
          data[item.id].push({
            propertyName: printableProperty,
            id: item.id,
            klass: item.klass,
            name: this.equipmentItemService.getPrintablePropertyName(item.klass, printableProperty, true),
            value$: service.getPrintableProperty$(item, printableProperty)
          });
        }

        if (klass === EquipmentItemType.CAMERA) {
          const camera = item as CameraInterface;

          for (const sensorPrintableProperty of this.sensorService
            .getSupportedPrintableProperties()
            .filter(
              (prop: SensorDisplayProperty) =>
                [
                  SensorDisplayProperty.PIXEL_WIDTH,
                  SensorDisplayProperty.PIXEL_HEIGHT,
                  SensorDisplayProperty.SENSOR_WIDTH,
                  SensorDisplayProperty.SENSOR_HEIGHT
                ].indexOf(prop) === -1
            )) {
            data[item.id].push({
              propertyName: sensorPrintableProperty,
              id: item.id,
              klass: item.klass,
              name: this.sensorService.getPrintablePropertyName(sensorPrintableProperty, true),
              value$: !!camera.sensor
                ? this.store$
                    .select(selectEquipmentItem, {
                      type: EquipmentItemType.SENSOR,
                      id: camera.sensor
                    })
                    .pipe(
                      filter(sensor => !!sensor),
                      take(1),
                      switchMap((sensor: SensorInterface) =>
                        this.sensorService.getPrintableProperty$(sensor, sensorPrintableProperty)
                      )
                    )
                : of(null)
            });
          }
        }

        data[item.id].push({
          propertyName: "USERS",
          id: item.id,
          klass: item.klass,
          name: this.translateService.instant("Users"),
          value$: of(item.userCount ? item.userCount.toString() : "0")
        });

        data[item.id].push({
          propertyName: "IMAGES",
          id: item.id,
          klass: item.klass,
          name: this.translateService.instant("Images"),
          value$: of(item.imageCount ? item.imageCount.toString() : "0")
        });
      }

      forkJoin(
        Object.keys(data).map(dataEntry =>
          forkJoin(
            data[dataEntry].map(property =>
              property.value$.pipe(map(value => ({ itemId: dataEntry, name: property.name, value })))
            )
          )
        )
      ).subscribe(computedResults => {
        for (const result of computedResults) {
          for (const resultData of result as any[]) {
            const entry = data[resultData["itemId"]].find(property => property.name === resultData["name"]);
            entry.value = resultData["value"];
            delete entry.value$;
          }
        }

        observer.next(data);
        observer.complete();
      });
    });
  }
}
