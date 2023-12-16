import { Injectable } from "@angular/core";
import { LoadingService } from "@shared/services/loading.service";
import { ContentTypeInterface } from "@shared/interfaces/content-type.interface";
import { Observable } from "rxjs";
import { NestedCommentInterface } from "@shared/interfaces/nested-comment.interface";
import { BaseClassicApiService } from "@shared/services/api/classic/base-classic-api.service";
import { HttpClient } from "@angular/common/http";
import { map } from "rxjs/operators";
import { UtilsService } from "@shared/services/utils/utils.service";

@Injectable({
  providedIn: "root"
})
export class NestedCommentsApiService extends BaseClassicApiService {
  configUrl = this.baseUrl + "/nestedcomments";

  constructor(public loadingService: LoadingService, public readonly http: HttpClient) {
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
}
