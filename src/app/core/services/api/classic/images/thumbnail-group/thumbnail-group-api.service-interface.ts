import type { ThumbnailGroupInterface } from "@core/interfaces/thumbnail-group.interface";
import type { Observable } from "rxjs";

export interface ThumbnailGroupApiServiceInterface {
  getThumbnailGroup(imageId: number, revision: string): Observable<ThumbnailGroupInterface>;
}
