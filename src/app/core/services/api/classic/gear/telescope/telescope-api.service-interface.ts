import type { TelescopeInterface } from "@core/interfaces/telescope.interface";
import type { Observable } from "rxjs";

export interface TelescopeApiServiceInterface {
  get(id: number): Observable<TelescopeInterface>;
}
