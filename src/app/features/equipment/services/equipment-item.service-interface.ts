import { EquipmentItemBaseInterface } from "@features/equipment/types/equipment-item-base.interface";
import { Observable } from "rxjs";
import { WeightUnit } from "@shared/types/weight-unit.enum";

export interface EquipmentItemServiceInterface {
  humanizeType?(type: any);

  getSupportedPrintableProperties(): string[];

  getPrintableProperty$(
    item: EquipmentItemBaseInterface,
    propertyName: any,
    propertyValue: any,
    options: { weightUnit?: WeightUnit }
  ): Observable<string | null>;

  getPrintablePropertyName(propertyName: any, shortForm: boolean): string;
}
