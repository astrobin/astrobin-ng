import type { CameraInterface } from "@core/interfaces/camera.interface";
import type { Observable } from "rxjs";

export interface CameraApiServiceInterface {
  get(id: number): Observable<CameraInterface>;
}
