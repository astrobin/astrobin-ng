import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { ImageInterface } from "@shared/interfaces/image.interface";
import { BaseClassicApiService } from "@shared/services/api/classic/base-classic-api.service";
import { PaginatedApiResultInterface } from "@shared/services/api/interfaces/paginated-api-result.interface";
import { LoadingService } from "@shared/services/loading.service";
import { Observable } from "rxjs";

export interface SubmissionQueueEntryInterface {
  image: ImageInterface;
}

@Injectable()
export class SubmissionQueueApiService extends BaseClassicApiService {
  constructor(public readonly loadingService: LoadingService, public readonly http: HttpClient) {
    super(loadingService);
  }

  getEntries(page = 1): Observable<PaginatedApiResultInterface<SubmissionQueueEntryInterface>> {
    return this.http.get<PaginatedApiResultInterface<SubmissionQueueEntryInterface>>(
      `${this.baseUrl}/iotd/submission-queue/?page=${page}`
    );
  }
}
