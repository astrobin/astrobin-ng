import { CameraInterface } from "@core/interfaces/camera.interface";
import { Observable } from "rxjs";

export interface CameraApiServiceInterface {
  get(id: number): Observable<CameraInterface>;
}
