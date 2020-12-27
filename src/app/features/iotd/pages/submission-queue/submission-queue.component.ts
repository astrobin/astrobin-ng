import { Component, OnInit } from "@angular/core";
import { ShowFullscreenImage } from "@app/store/actions/fullscreen-image.actions";
import { SubmissionInterface } from "@features/iotd/services/submission-queue-api.service";
import {
  DeleteSubmission,
  LoadSubmissionQueue,
  LoadSubmissions,
  PostSubmission
} from "@features/iotd/store/iotd.actions";
import { IotdState, SubmissionImageInterface } from "@features/iotd/store/iotd.reducer";
import {
  selectSubmissionForImage,
  selectSubmissionQueue,
  selectSubmissions
} from "@features/iotd/store/iotd.selectors";
import { select, Store } from "@ngrx/store";
import { TranslateService } from "@ngx-translate/core";
import { ImageAlias } from "@shared/enums/image-alias.enum";
import { PaginatedApiResultInterface } from "@shared/services/api/interfaces/paginated-api-result.interface";
import { LoadingService } from "@shared/services/loading.service";
import { PaginationService } from "@shared/services/pagination.service";
import { TitleService } from "@shared/services/title/title.service";
import { Observable, of } from "rxjs";
import { distinctUntilChanged, map, share, take, tap } from "rxjs/operators";

@Component({
  selector: "astrobin-submission-queue",
  templateUrl: "./submission-queue.component.html",
  styleUrls: ["./submission-queue.component.scss"]
})
export class SubmissionQueueComponent implements OnInit {
  page = 1;
  ImageAlias = ImageAlias;
  submissionQueue$: Observable<PaginatedApiResultInterface<SubmissionImageInterface>> = this.store$.pipe(
    select(selectSubmissionQueue)
  );
  submissions$: Observable<SubmissionInterface[]> = this.store$.pipe(select(selectSubmissions));

  constructor(
    public readonly store$: Store<IotdState>,
    public readonly titleService: TitleService,
    public readonly translate: TranslateService,
    public readonly paginationService: PaginationService,
    public readonly loadingService: LoadingService
  ) {}

  ngOnInit(): void {
    this.titleService.setTitle(this.translate.instant("Submission queue"));
    this.refresh();
  }

  refresh(): void {
    this.store$.dispatch(new LoadSubmissionQueue());
    this.store$.dispatch(new LoadSubmissions());
  }

  viewFullscreen(imageId: number): void {
    this.store$.dispatch(new ShowFullscreenImage(imageId));
  }

  pageChange(page: number): void {
    this.page = page;
    this.store$.dispatch(new LoadSubmissionQueue({ page }));
  }

  postSubmission(imageId: number): void {
    this.store$.dispatch(new PostSubmission({ imageId }));
  }

  deleteSubmission(imageId: number): void {
    this.store$
      .select(selectSubmissionForImage, imageId)
      .pipe(
        take(1),
        tap(submission => this.store$.dispatch(new DeleteSubmission({ id: submission.id })))
      )
      .subscribe();
  }

  isSubmitted$(imageId: number): Observable<boolean> {
    return this.store$.select(selectSubmissionForImage, imageId).pipe(
      map(submission => submission !== null),
      distinctUntilChanged()
    );
  }
}
