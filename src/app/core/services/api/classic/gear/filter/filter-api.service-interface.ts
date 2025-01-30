import { FilterInterface } from "@core/interfaces/filter.interface";
import { Observable } from "rxjs";

export interface FilterApiServiceInterface {
  get(id: number): Observable<FilterInterface>;
}
