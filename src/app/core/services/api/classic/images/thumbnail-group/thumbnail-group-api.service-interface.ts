import { ThumbnailGroupInterface } from "@core/interfaces/thumbnail-group.interface";
import { Observable } from "rxjs";

export interface ThumbnailGroupApiServiceInterface {
  getThumbnailGroup(imageId: number, revision: string): Observable<ThumbnailGroupInterface>;
}
