import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { SubmissionImageInterface } from "@features/iotd/store/iotd.reducer";
import { BaseClassicApiService } from "@shared/services/api/classic/base-classic-api.service";
import { PaginatedApiResultInterface } from "@shared/services/api/interfaces/paginated-api-result.interface";
import { LoadingService } from "@shared/services/loading.service";
import { Observable } from "rxjs";

export interface SubmissionInterface {
  id: number;
  submitter: number;
  image: number;
  date: string;
}

@Injectable()
export class SubmissionQueueApiService extends BaseClassicApiService {
  constructor(public readonly loadingService: LoadingService, public readonly http: HttpClient) {
    super(loadingService);
  }

  getEntries(page = 1): Observable<PaginatedApiResultInterface<SubmissionImageInterface>> {
    return this.http.get<PaginatedApiResultInterface<SubmissionImageInterface>>(
      `${this.baseUrl}/iotd/submission-queue/?page=${page}`
    );
  }

  getSubmissions(): Observable<SubmissionInterface[]> {
    return this.http.get<SubmissionInterface[]>(`${this.baseUrl}/iotd/submission/`);
  }

  postSubmission(imageId: number): Observable<SubmissionInterface> {
    return this.http.post<SubmissionInterface>(`${this.baseUrl}/iotd/submission/`, { image: imageId });
  }

  deleteSubmission(id: number): Observable<SubmissionInterface> {
    return this.http.delete<SubmissionInterface>(`${this.baseUrl}/iotd/submission/${id}/`);
  }
}
