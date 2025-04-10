import { SoftwareInterface } from "@core/interfaces/software.interface";
import { Observable } from "rxjs";

export interface SoftwareApiServiceInterface {
  get(id: number): Observable<SoftwareInterface>;
}
