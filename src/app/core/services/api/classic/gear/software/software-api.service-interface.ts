import type { SoftwareInterface } from "@core/interfaces/software.interface";
import type { Observable } from "rxjs";

export interface SoftwareApiServiceInterface {
  get(id: number): Observable<SoftwareInterface>;
}
