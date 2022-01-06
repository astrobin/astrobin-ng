import { AccessoryInterface } from "@shared/interfaces/accessory.interface";
import { Observable } from "rxjs";

export interface AccessoryApiServiceInterface {
  get(id: number): Observable<AccessoryInterface>;
}
