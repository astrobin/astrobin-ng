import { Observable, of } from "rxjs";
import { ThumbnailGroupGenerator } from "../../../../../generators/thumbnail-group.generator";
import { ThumbnailGroupInterface } from "../../../../../interfaces/thumbnail-group.interface";
import { ThumbnailGroupApiServiceInterface } from "./thumbnail-group-api.service-interface";

export class ThumbnailGroupApiServiceMock implements ThumbnailGroupApiServiceInterface {
  getThumbnailGroup(imageId: number, revision: string): Observable<ThumbnailGroupInterface> {
    return of(ThumbnailGroupGenerator.thumbnailGroup());
  }
}
