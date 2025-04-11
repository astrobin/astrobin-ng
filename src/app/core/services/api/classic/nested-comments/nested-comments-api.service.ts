import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { ContentTypeInterface } from "@core/interfaces/content-type.interface";
import { NestedCommentInterface } from "@core/interfaces/nested-comment.interface";
import { BaseClassicApiService } from "@core/services/api/classic/base-classic-api.service";
import { LoadingService } from "@core/services/loading.service";
import { UtilsService } from "@core/services/utils/utils.service";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";

@Injectable({
  providedIn: "root"
})
export class NestedCommentsApiService extends BaseClassicApiService {
  configUrl = this.baseUrl + "/nestedcomments";

  constructor(
    public loadingService: LoadingService,
    public readonly http: HttpClient
  ) {
    super(loadingService);
  }

  getForContentTypeIdAndObjectId(
    contentTypeId: ContentTypeInterface["id"],
    objectId: number
  ): Observable<NestedCommentInterface[]> {
    return this.http
      .get(`${this.configUrl}/nestedcomments/?content_type=${contentTypeId}&object_id=${objectId}`)
      .pipe(map((comments: any[]) => comments.map(comment => UtilsService.objectToCamelCase(comment))));
  }

  getById(id: NestedCommentInterface["id"]): Observable<NestedCommentInterface> {
    return this.http
      .get(`${this.configUrl}/nestedcomments/${id}/`)
      .pipe(map((comment: any) => UtilsService.objectToCamelCase(comment)));
  }

  create(nestedComment: Partial<NestedCommentInterface>): Observable<NestedCommentInterface> {
    return this.http
      .post<NestedCommentInterface>(`${this.configUrl}/nestedcomments/`, UtilsService.objectToSnakeCase(nestedComment))
      .pipe(map(createdNestedComment => UtilsService.objectToCamelCase(createdNestedComment)));
  }

  update(nestedComment: NestedCommentInterface): Observable<NestedCommentInterface> {
    return this.http
      .put<NestedCommentInterface>(
        `${this.configUrl}/nestedcomments/${nestedComment.id}/`,
        UtilsService.objectToSnakeCase(nestedComment)
      )
      .pipe(map(updatedNestedComment => UtilsService.objectToCamelCase(updatedNestedComment)));
  }

  approve(id: NestedCommentInterface["id"]): Observable<NestedCommentInterface> {
    return this.http.post<NestedCommentInterface>(`${this.configUrl}/nestedcomments/${id}/approve/`, {});
  }

  delete(id: NestedCommentInterface["id"]): Observable<void> {
    return this.http.delete<void>(`${this.configUrl}/nestedcomments/${id}/`);
  }
}
