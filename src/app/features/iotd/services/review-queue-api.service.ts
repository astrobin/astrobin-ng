import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { ReviewImageInterface } from "@features/iotd/store/iotd.reducer";
import { BaseClassicApiService } from "@shared/services/api/classic/base-classic-api.service";
import { PaginatedApiResultInterface } from "@shared/services/api/interfaces/paginated-api-result.interface";
import { LoadingService } from "@shared/services/loading.service";
import { Observable } from "rxjs";

export interface VoteInterface {
  id: number;
  reviewer: number;
  image: number;
  date: string;
}

@Injectable()
export class ReviewQueueApiService extends BaseClassicApiService {
  constructor(public readonly loadingService: LoadingService, public readonly http: HttpClient) {
    super(loadingService);
  }

  getEntries(page = 1): Observable<PaginatedApiResultInterface<ReviewImageInterface>> {
    return this.http.get<PaginatedApiResultInterface<ReviewImageInterface>>(
      `${this.baseUrl}/iotd/review-queue/?page=${page}`
    );
  }

  getVotes(): Observable<VoteInterface[]> {
    return this.http.get<VoteInterface[]>(`${this.baseUrl}/iotd/vote/`);
  }

  addVote(imageId: number): Observable<VoteInterface> {
    return this.http.post<VoteInterface>(`${this.baseUrl}/iotd/vote/`, { image: imageId });
  }

  retractVote(id: number): Observable<VoteInterface> {
    return this.http.delete<VoteInterface>(`${this.baseUrl}/iotd/vote/${id}/`);
  }
}
