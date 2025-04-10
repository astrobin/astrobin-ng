import type { AccessoryInterface } from "@core/interfaces/accessory.interface";
import type { Observable } from "rxjs";

export interface AccessoryApiServiceInterface {
  get(id: number): Observable<AccessoryInterface>;
}
