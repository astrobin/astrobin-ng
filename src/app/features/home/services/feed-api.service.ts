import { Injectable } from "@angular/core";
import { LoadingService } from "@shared/services/loading.service";
import { PaginatedApiResultInterface } from "@shared/services/api/interfaces/paginated-api-result.interface";
import { FeedItemInterface } from "@features/home/interfaces/feed-item.interface";
import { Observable } from "rxjs";
import { BaseClassicApiService } from "@shared/services/api/classic/base-classic-api.service";
import { HttpClient } from "@angular/common/http";
import { FrontPageSection } from "@shared/interfaces/user-profile.interface";
import { ImageInterface } from "@shared/interfaces/image.interface";

@Injectable({
  providedIn: "root"
})
export class FeedApiService extends BaseClassicApiService {
  private readonly _url = this.baseUrl + "/astrobin/frontpage-feed";

  constructor(
    public readonly loadingService: LoadingService,
    public readonly httpClient: HttpClient
  ) {
    super(loadingService);
  }

  getFeed(
    page: number,
    feedType?: FrontPageSection
  ): Observable<PaginatedApiResultInterface<FeedItemInterface | ImageInterface>> {
    let url = `${this._url}/?page=${page}`;

    if (feedType === FrontPageSection.PERSONAL) {
      url += `&personal`;
    } else if (feedType === FrontPageSection.FOLLOWED) {
      url += `&followed`;
    } else if (feedType === FrontPageSection.RECENT) {
      url += `&recent`;
    }

    return this.httpClient.get<PaginatedApiResultInterface<FeedItemInterface>>(url);
  }
}
