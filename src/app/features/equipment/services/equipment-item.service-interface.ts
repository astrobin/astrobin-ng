import type { EquipmentItemBaseInterface } from "@features/equipment/types/equipment-item-base.interface";
import type { Observable } from "rxjs";

export interface EquipmentItemServiceInterface {
  humanizeType?(type: any);

  getSupportedPrintableProperties(): string[];

  getPrintableProperty$(
    item: EquipmentItemBaseInterface,
    propertyName: any,
    propertyValue?: any,
    shortForm?: boolean
  ): Observable<string | null>;

  getPrintablePropertyName(propertyName: any, shortForm: boolean): string;
}
