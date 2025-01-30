import { Observable } from "rxjs";
import { LocationInterface } from "@core/interfaces/location.interface";

export interface LocationApiServiceInterface {
  create(location: Omit<LocationInterface, "id">): Observable<LocationInterface>;
}
