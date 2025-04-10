import type { MountInterface } from "@core/interfaces/mount.interface";
import type { Observable } from "rxjs";

export interface MountApiServiceInterface {
  get(id: number): Observable<MountInterface>;
}
