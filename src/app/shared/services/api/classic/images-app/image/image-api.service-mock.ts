import { Observable, of } from "rxjs";
import { ImageGenerator } from "../../../../../generators/image.generator";
import { ImageInterface } from "../../../../../interfaces/image.interface";
import { ImageApiServiceInterface } from "./image-api.service-interface";

export class ImageApiServiceMock implements ImageApiServiceInterface {
  getImage(id: number): Observable<ImageInterface> {
    return of(ImageGenerator.image());
  }
}
