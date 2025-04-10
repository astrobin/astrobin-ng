import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { ImageInterface } from "@core/interfaces/image.interface";
import { BaseClassicApiService } from "@core/services/api/classic/base-classic-api.service";
import { PaginatedApiResultInterface } from "@core/services/api/interfaces/paginated-api-result.interface";
import { LoadingService } from "@core/services/loading.service";
import { IotdArchiveInterface } from "@features/iotd/types/iotd-archive.interface";
import { IotdStatsInterface } from "@features/iotd/types/iotd-stats.interface";
import { JudgementImageInterface } from "@features/iotd/types/judgement-image.interface";
import { ReviewImageInterface } from "@features/iotd/types/review-image.interface";
import { StaffMemberSettingsInterface } from "@features/iotd/types/staff-member-settings.interface";
import { SubmissionImageInterface } from "@features/iotd/types/submission-image.interface";
import { TopPickArchiveInterface } from "@features/iotd/types/top-pick-archive.interface";
import { TopPickNominationArchiveInterface } from "@features/iotd/types/top-pick-nomination-archive.interface";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";

export interface SubmissionInterface {
  id: number;
  submitter: number;
  image: number;
  date: string;
}

export interface VoteInterface {
  id: number;
  reviewer: number;
  image: number;
  date: string;
}

export interface IotdInterface {
  id: number;
  judge: number;
  image: number;
  date: string;
  thumbnail: string;
  title: string;
  userDisplayNames: string;
}

export interface HiddenImage {
  id: number;
  user: number;
  image: number;
  created: string;
}

export interface SubmitterSeenImage {
  id: number;
  user: number;
  image: number;
  created: string;
}

export interface ReviewerSeenImage {
  id: number;
  user: number;
  image: number;
  created: string;
}

export interface DismissedImage {
  id: number;
  user: number;
  image: number;
  created: string;
}

@Injectable({
  providedIn: "root"
})
export class IotdApiService extends BaseClassicApiService {
  constructor(public readonly loadingService: LoadingService, public readonly http: HttpClient) {
    super(loadingService);
  }

  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  // GENERIC
  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  getStaffMemberSettings(): Observable<StaffMemberSettingsInterface | null> {
    return this.http.get<StaffMemberSettingsInterface[]>(`${this.baseUrl}/iotd/staff-member-settings/`).pipe(
      map(response => {
        if (response.length === 0) {
          return null;
        }

        return response[0];
      })
    );
  }

  loadHiddenImages(): Observable<HiddenImage[]> {
    return this.http.get<HiddenImage[]>(`${this.baseUrl}/iotd/hidden-image/`);
  }

  hideImage(id: number): Observable<HiddenImage> {
    return this.http.post<HiddenImage>(`${this.baseUrl}/iotd/hidden-image/`, { image: id });
  }

  showImage(hiddenImage: HiddenImage): Observable<number> {
    return this.http
      .delete<void>(`${this.baseUrl}/iotd/hidden-image/${hiddenImage.id}/`)
      .pipe(map(() => hiddenImage.image));
  }

  loadSubmitterSeenImages(): Observable<SubmitterSeenImage[]> {
    return this.http.get<SubmitterSeenImage[]>(`${this.baseUrl}/iotd/submitter-seen-image/`);
  }

  markSubmitterSeenImage(id: ImageInterface["pk"]): Observable<SubmitterSeenImage> {
    return this.http.post<SubmitterSeenImage>(`${this.baseUrl}/iotd/submitter-seen-image/`, { image: id });
  }

  loadReviewerSeenImages(): Observable<ReviewerSeenImage[]> {
    return this.http.get<ReviewerSeenImage[]>(`${this.baseUrl}/iotd/reviewer-seen-image/`);
  }

  markReviewerSeenImage(id: ImageInterface["pk"]): Observable<ReviewerSeenImage> {
    return this.http.post<ReviewerSeenImage>(`${this.baseUrl}/iotd/reviewer-seen-image/`, { image: id });
  }

  loadDismissedImages(): Observable<DismissedImage[]> {
    return this.http.get<DismissedImage[]>(`${this.baseUrl}/iotd/dismissed-image/`);
  }

  dismissImage(id: number): Observable<DismissedImage> {
    return this.http.post<DismissedImage>(`${this.baseUrl}/iotd/dismissed-image/`, { image: id });
  }

  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  // SUBMISSIONS
  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  getSubmissionQueueEntries(
    page = 1,
    sort: "newest" | "oldest" | "default" = "default"
  ): Observable<PaginatedApiResultInterface<SubmissionImageInterface>> {
    return this.http.get<PaginatedApiResultInterface<SubmissionImageInterface>>(
      `${this.baseUrl}/iotd/submission-queue/?page=${page}&sort=${sort}`
    );
  }

  getSubmissions(): Observable<SubmissionInterface[]> {
    return this.http.get<SubmissionInterface[]>(`${this.baseUrl}/iotd/submission/`);
  }

  addSubmission(imageId: number): Observable<SubmissionInterface> {
    return this.http.post<SubmissionInterface>(`${this.baseUrl}/iotd/submission/`, { image: imageId });
  }

  retractSubmission(id: number): Observable<SubmissionInterface> {
    return this.http.delete<SubmissionInterface>(`${this.baseUrl}/iotd/submission/${id}/`);
  }

  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  // REVIEWS
  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  getReviewQueueEntries(
    page = 1,
    sort: "newest" | "oldest" | "default" = "default"
  ): Observable<PaginatedApiResultInterface<ReviewImageInterface>> {
    return this.http.get<PaginatedApiResultInterface<ReviewImageInterface>>(
      `${this.baseUrl}/iotd/review-queue/?page=${page}&sort=${sort}`
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

  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  // JUDGEMENT
  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  getJudgementQueueEntries(
    page = 1,
    sort: "newest" | "oldest" | "default" = "default"
  ): Observable<PaginatedApiResultInterface<JudgementImageInterface>> {
    return this.http.get<PaginatedApiResultInterface<JudgementImageInterface>>(
      `${this.baseUrl}/iotd/judgement-queue/?page=${page}&sort=${sort}`
    );
  }

  getFutureIotds(): Observable<IotdInterface[]> {
    return this.http.get<IotdInterface[]>(`${this.baseUrl}/iotd/future-iotds/`);
  }

  addIotd(imageId: number): Observable<IotdInterface> {
    return this.http.post<IotdInterface>(`${this.baseUrl}/iotd/future-iotds/`, { image: imageId });
  }

  retractIotd(id: number): Observable<IotdInterface> {
    return this.http.delete<IotdInterface>(`${this.baseUrl}/iotd/future-iotds/${id}/`);
  }

  getCannotSelectNowReason(): Observable<string | null> {
    return this.http
      .get<{ reason: string | null }>(`${this.baseUrl}/iotd/judgement-queue/cannot-select-now-reason/`)
      .pipe(map(response => response.reason));
  }

  getNextAvailableSelectionTime(): Observable<string | null> {
    return this.http
      .get<{ nextAvailableSelectionTime: string | null }>(
        `${this.baseUrl}/iotd/judgement-queue/next-available-selection-time/`
      )
      .pipe(map(response => response.nextAvailableSelectionTime));
  }

  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  // IOTD
  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  getCurrentIotd(): Observable<IotdInterface | null> {
    return this.http.get<IotdInterface[]>(`${this.baseUrl}/iotd/current-iotd/`).pipe(
      map(response => {
        if (response.length === 0) {
          return null;
        }

        return response[0];
      })
    );
  }

  getStats(): Observable<PaginatedApiResultInterface<IotdStatsInterface>> {
    return this.http.get<PaginatedApiResultInterface<IotdStatsInterface>>(`${this.baseUrl}/iotd/stats/`);
  }

  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  // ARCHIVE
  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  getIotdArchive(page = 1): Observable<PaginatedApiResultInterface<IotdArchiveInterface>> {
    return this.http.get<PaginatedApiResultInterface<IotdArchiveInterface>>(
      `${this.baseUrl}/iotd/iotd-archive/?page=${page}`
    );
  }

  getTopPickArchive(page = 1): Observable<PaginatedApiResultInterface<TopPickArchiveInterface>> {
    return this.http.get<PaginatedApiResultInterface<TopPickArchiveInterface>>(
      `${this.baseUrl}/iotd/top-pick-archive/?page=${page}`
    );
  }

  getTopPickNominationsArchive(page = 1): Observable<PaginatedApiResultInterface<TopPickNominationArchiveInterface>> {
    return this.http.get<PaginatedApiResultInterface<TopPickNominationArchiveInterface>>(
      `${this.baseUrl}/iotd/top-pick-nominations-archive/?page=${page}`
    );
  }
}
