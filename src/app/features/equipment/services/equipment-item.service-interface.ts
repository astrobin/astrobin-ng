import { EquipmentItemBaseInterface } from "@features/equipment/types/equipment-item-base.interface";
import { Observable } from "rxjs";

export interface EquipmentItemServiceInterface {
  humanizeType?(type: any);

  getPrintableProperty$(item: EquipmentItemBaseInterface, propertyName: any, propertyValue?: any): Observable<string>;

  getPrintablePropertyName(propertyName: any, shortForm: boolean): string;
}
