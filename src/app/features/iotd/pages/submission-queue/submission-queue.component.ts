import { Component, ElementRef, OnInit, QueryList, ViewChildren } from "@angular/core";
import { State } from "@app/store/state";
import { environment } from "@env/environment";
import { SubmissionInterface } from "@features/iotd/services/submission-queue-api.service";
import { LoadSubmissionQueue, LoadSubmissions } from "@features/iotd/store/iotd.actions";
import { SubmissionImageInterface } from "@features/iotd/store/iotd.reducer";
import { selectSubmissionQueue, selectSubmissions } from "@features/iotd/store/iotd.selectors";
import { Store } from "@ngrx/store";
import { TranslateService } from "@ngx-translate/core";
import { ImageAlias } from "@shared/enums/image-alias.enum";
import { PaginatedApiResultInterface } from "@shared/services/api/interfaces/paginated-api-result.interface";
import { LoadingService } from "@shared/services/loading.service";
import { PaginationService } from "@shared/services/pagination.service";
import { TitleService } from "@shared/services/title/title.service";
import { Observable } from "rxjs";

@Component({
  selector: "astrobin-submission-queue",
  templateUrl: "./submission-queue.component.html",
  styleUrls: ["./submission-queue.component.scss"]
})
export class SubmissionQueueComponent implements OnInit {
  page = 1;
  ImageAlias = ImageAlias;
  classicUrl = `${environment.classicBaseUrl}/iotd/submission-queue`;
  submissionQueue$: Observable<PaginatedApiResultInterface<SubmissionImageInterface>> = this.store$.select(
    selectSubmissionQueue
  );
  submissions$: Observable<SubmissionInterface[]> = this.store$.select(selectSubmissions);

  @ViewChildren("submissionQueueEntries")
  submissionQueueEntries: QueryList<ElementRef>;

  constructor(
    public readonly store$: Store<State>,
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

  pageChange(page: number): void {
    this.page = page;
    this.store$.dispatch(new LoadSubmissionQueue({ page }));
  }

  scrollToEntry(imageId: number): void {
    const element = this.submissionQueueEntries.filter(
      entry => entry.nativeElement.id === `submission-queue-entry-${imageId}`
    )[0].nativeElement;
    element.scrollIntoView({ behavior: "smooth" });
  }
}
