import { Injectable } from "@angular/core";
import { BaseService } from "@shared/services/base.service";
import { LoadingService } from "@shared/services/loading.service";
import { EquipmentItem } from "@features/equipment/types/equipment-item.type";
import { arrayUniqueEquipmentItems } from "@features/equipment/store/equipment.selectors";
import { forkJoin, Observable, of } from "rxjs";
import { CameraService } from "@features/equipment/services/camera.service";
import { TelescopeService } from "@features/equipment/services/telescope.service";
import { MountService } from "@features/equipment/services/mount.service";
import { FilterService } from "@features/equipment/services/filter.service";
import { AccessoryService } from "@features/equipment/services/accessory.service";
import { SoftwareService } from "@features/equipment/services/software.service";
import { EquipmentItemServiceFactory } from "@features/equipment/services/equipment-item.service-factory";
import { map } from "rxjs/operators";

export enum CompareServiceError {
  NON_MATCHING_CLASS = "NON_MATCHING_CLASS",
  ITEM_NOT_FOUND = "ITEM_NOT_FOUND"
}

export interface ComparisonInterface {
  [itemId: number]: {
    name: string;
    value$?: Observable<string>;
    value?: string;
  }[];
}

@Injectable({
  providedIn: "root"
})
export class CompareService extends BaseService {
  private _items: EquipmentItem[] = [];

  constructor(
    public readonly loadingService: LoadingService,
    public readonly equipmentItemServiceFactory: EquipmentItemServiceFactory,
    public readonly cameraService: CameraService,
    public readonly telescopeService: TelescopeService,
    public readonly mountService: MountService,
    public readonly filterService: FilterService,
    public readonly accessoryService: AccessoryService,
    public readonly softwareService: SoftwareService
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
    this._items = arrayUniqueEquipmentItems([...this._items, ...[item]]);
  }

  remove(item: EquipmentItem): void {
    const previousAmount = this.amount();
    this._items = this._items.filter(x => x.id !== item.id);

    if (this.amount() === previousAmount) {
      throw new Error(CompareServiceError.ITEM_NOT_FOUND);
    }
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
      const service = this.equipmentItemServiceFactory.getService(this.get(0));
      const printableProperties = service.getSupportedPrintableProperties();

      let data: ComparisonInterface;

      for (const item of this.getAll()) {
        for (const printableProperty of printableProperties) {
          data = {
            ...(data || {}),
            ...{
              [item.id]: []
            }
          };

          data[item.id].push({
            name: service.getPrintablePropertyName(printableProperty, true),
            value$: service.getPrintableProperty$(item, printableProperty)
          });
        }
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
          for (const resultData of result) {
            data[resultData["itemId"]].find(property => property.name === resultData["name"]).value =
              resultData["value"];
          }
        }

        observer.next(data);
        observer.complete();
      });
    });
  }
}
