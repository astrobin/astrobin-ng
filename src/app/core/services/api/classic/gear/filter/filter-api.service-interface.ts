import type { FilterInterface } from "@core/interfaces/filter.interface";
import type { Observable } from "rxjs";

export interface FilterApiServiceInterface {
  get(id: number): Observable<FilterInterface>;
}
