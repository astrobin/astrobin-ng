import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { ImageInterface } from "@core/interfaces/image.interface";
import { FrontpageSection } from "@core/interfaces/user-profile.interface";
import { BaseClassicApiService } from "@core/services/api/classic/base-classic-api.service";
import { PaginatedApiResultInterface } from "@core/services/api/interfaces/paginated-api-result.interface";
import { LoadingService } from "@core/services/loading.service";
import { FeedItemInterface } from "@features/home/interfaces/feed-item.interface";
import { Observable } from "rxjs";

@Injectable({
  providedIn: "root"
})
export class FeedApiService extends BaseClassicApiService {
  private readonly _url = this.baseUrl + "/astrobin/frontpage-feed";

  constructor(public readonly loadingService: LoadingService, public readonly httpClient: HttpClient) {
    super(loadingService);
  }

  getFeed(
    page: number,
    feedType?: FrontpageSection
  ): Observable<PaginatedApiResultInterface<FeedItemInterface | ImageInterface>> {
    let url = `${this._url}/?page=${page}`;

    if (feedType === FrontpageSection.PERSONAL) {
      url += `&personal`;
    } else if (feedType === FrontpageSection.FOLLOWED) {
      url += `&followed`;
    } else if (feedType === FrontpageSection.RECENT) {
      url += `&recent`;
    }

    return this.httpClient.get<PaginatedApiResultInterface<FeedItemInterface>>(url);
  }
}
