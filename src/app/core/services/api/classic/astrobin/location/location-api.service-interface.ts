import { LocationInterface } from "@core/interfaces/location.interface";
import { Observable } from "rxjs";

export interface LocationApiServiceInterface {
  create(location: Omit<LocationInterface, "id">): Observable<LocationInterface>;
}
