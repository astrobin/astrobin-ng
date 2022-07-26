import { Injectable } from "@angular/core";
import { BaseClassicApiService } from "@shared/services/api/classic/base-classic-api.service";
import { LoadingService } from "@shared/services/loading.service";
import { HttpClient } from "@angular/common/http";
import { ForumInterface } from "@shared/interfaces/forums/forum.interface";
import { Observable } from "rxjs";
import { PaginatedApiResultInterface } from "@shared/services/api/interfaces/paginated-api-result.interface";
import { TopicInterface } from "@shared/interfaces/forums/topic.interface";
import { UtilsService } from "@shared/services/utils/utils.service";
import { CategoryInterface } from "@shared/interfaces/forums/category.interface";

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

  loadTopics(forumId: ForumInterface["id"], page = 1): Observable<PaginatedApiResultInterface<TopicInterface>> {
    let url = this.configUrl + "/topic/";

    url = UtilsService.addOrUpdateUrlParam(url, "forum", forumId.toString());
    url = UtilsService.addOrUpdateUrlParam(url, "page", page.toString());

    return this.http.get<PaginatedApiResultInterface<TopicInterface>>(url);
  }
}
