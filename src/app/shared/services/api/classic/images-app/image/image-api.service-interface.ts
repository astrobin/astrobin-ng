import { ImageInterface } from "@shared/interfaces/image.interface";
import { Observable } from "rxjs";

export interface ImageApiServiceInterface {
  getImage(id: number): Observable<ImageInterface>;
}
