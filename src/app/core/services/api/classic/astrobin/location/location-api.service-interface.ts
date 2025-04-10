import type { LocationInterface } from "@core/interfaces/location.interface";
import type { Observable } from "rxjs";

export interface LocationApiServiceInterface {
  create(location: Omit<LocationInterface, "id">): Observable<LocationInterface>;
}
