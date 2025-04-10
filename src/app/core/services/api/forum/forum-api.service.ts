import type { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import type { CategoryInterface } from "@core/interfaces/forums/category.interface";
import type { ForumInterface } from "@core/interfaces/forums/forum.interface";
import type { TopicInterface } from "@core/interfaces/forums/topic.interface";
import type { PaginatedApiResultInterface } from "@core/services/api/interfaces/paginated-api-result.interface";
import type { LoadingService } from "@core/services/loading.service";
import { UtilsService } from "@core/services/utils/utils.service";
import type { Observable } from "rxjs";

import { BaseClassicApiService } from "../classic/base-classic-api.service";

@Injectable({
  providedIn: "root"
})
export class ForumApiService extends BaseClassicApiService {
  configUrl = this.baseUrl + "/forum";

  constructor(public readonly loadingService: LoadingService, public readonly http: HttpClient) {
    super(loadingService);
  }

  getCategory(categoryId: CategoryInterface["id"]): Observable<CategoryInterface> {
    return this.http.get<CategoryInterface>(`${this.configUrl}/category/${categoryId}/`);
  }

  getForum(forumId: ForumInterface["id"]): Observable<ForumInterface> {
    return this.http.get<ForumInterface>(`${this.configUrl}/forum/${forumId}/`);
  }

  loadTopics(forumId?: ForumInterface["id"], page = 1): Observable<PaginatedApiResultInterface<TopicInterface>> {
    let url = this.configUrl + "/topic/";

    if (forumId) {
      url = UtilsService.addOrUpdateUrlParam(url, "forum", forumId.toString());
    }

    url = UtilsService.addOrUpdateUrlParam(url, "page", page.toString());

    return this.http.get<PaginatedApiResultInterface<TopicInterface>>(url);
  }

  latestTopics(page = 1): Observable<PaginatedApiResultInterface<TopicInterface>> {
    return this.http.get<PaginatedApiResultInterface<TopicInterface>>(`${this.configUrl}/topic/latest/?page=${page}`);
  }
}
