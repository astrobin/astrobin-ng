import { TelescopeInterface } from "@core/interfaces/telescope.interface";
import { Observable } from "rxjs";

export interface TelescopeApiServiceInterface {
  get(id: number): Observable<TelescopeInterface>;
}
