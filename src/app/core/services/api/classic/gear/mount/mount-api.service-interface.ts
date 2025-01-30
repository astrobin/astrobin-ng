import { MountInterface } from "@core/interfaces/mount.interface";
import { Observable } from "rxjs";

export interface MountApiServiceInterface {
  get(id: number): Observable<MountInterface>;
}
