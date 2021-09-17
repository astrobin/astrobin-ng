import { EquipmentItemBaseInterface } from "@features/equipment/interfaces/equipment-item-base.interface";
import { Observable } from "rxjs";

export interface EquipmentItemServiceInterface {
  humanizeType?(type: any);

  getPrintableProperty$(item: EquipmentItemBaseInterface, property: any): Observable<string>;

  getPrintablePropertyName(propertyName: any, shortForm: boolean): string;
}
