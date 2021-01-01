import { Component, ElementRef, OnInit, QueryList, ViewChildren } from "@angular/core";
import { selectApp } from "@app/store/selectors/app/app.selectors";
import { State } from "@app/store/state";
import { environment } from "@env/environment";
import { SubmissionInterface } from "@features/iotd/services/submission-queue-api.service";
import { InitHiddenSubmissionEntries, LoadSubmissionQueue, LoadSubmissions } from "@features/iotd/store/iotd.actions";
import { SubmissionImageInterface } from "@features/iotd/store/iotd.reducer";
import {
  selectHiddenSubmissionEntries,
  selectSubmissionQueue,
  selectSubmissions
} from "@features/iotd/store/iotd.selectors";
import { Store } from "@ngrx/store";
import { TranslateService } from "@ngx-translate/core";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { ImageAlias } from "@shared/enums/image-alias.enum";
import { PaginatedApiResultInterface } from "@shared/services/api/interfaces/paginated-api-result.interface";
import { LoadingService } from "@shared/services/loading.service";
import { PaginationService } from "@shared/services/pagination.service";
import { PopNotificationsService } from "@shared/services/pop-notifications.service";
import { TitleService } from "@shared/services/title/title.service";
import { distinctUntilChangedObj } from "@shared/services/utils/utils.service";
import { Observable } from "rxjs";
import { filter, map, switchMap, takeUntil } from "rxjs/operators";

@Component({
  selector: "astrobin-submission-queue",
  templateUrl: "./submission-queue.component.html",
  styleUrls: ["./submission-queue.component.scss"]
})
export class SubmissionQueueComponent extends BaseComponentDirective implements OnInit {
  page = 1;
  ImageAlias = ImageAlias;
  classicUrl = `${environment.classicBaseUrl}/iotd/submission-queue`;
  submissionQueue$: Observable<PaginatedApiResultInterface<SubmissionImageInterface>> = this.store$.select(
    selectSubmissionQueue
  );
  hiddenSubmissionEntries$: Observable<number[]> = this.store$.select(selectHiddenSubmissionEntries);
  submissions$: Observable<SubmissionInterface[]> = this.store$.select(selectSubmissions);

  @ViewChildren("submissionQueueEntries")
  submissionQueueEntries: QueryList<ElementRef>;

  constructor(
    public readonly store$: Store<State>,
    public readonly titleService: TitleService,
    public readonly translateService: TranslateService,
    public readonly paginationService: PaginationService,
    public readonly loadingService: LoadingService,
    public readonly popNotificationsService: PopNotificationsService
  ) {
    super();
  }

  ngOnInit(): void {
    this.titleService.setTitle(this.translateService.instant("Submission queue"));

    this.store$
      .select(selectApp)
      .pipe(
        takeUntil(this.destroyed$),
        map(state => state.backendConfig),
        filter(backendConfig => !!backendConfig),
        distinctUntilChangedObj(),
        switchMap(backendConfig =>
          this.store$.select(selectSubmissions).pipe(map(submissions => ({ backendConfig, submissions })))
        )
      )
      .subscribe(({ backendConfig, submissions }) => {
        if (submissions.length === backendConfig.IOTD_SUBMISSION_MAX_PER_DAY) {
          this.popNotificationsService.info(
            this.translateService.instant(
              "Please note: you don't <strong>have to</strong> use all your slots. It's ok to use fewer if you " +
                "don't think there are that many worthy images today."
            ),
            null,
            {
              enableHtml: true
            }
          );
        }
      });

    this.refresh();
  }

  refresh(): void {
    this.store$.dispatch(new InitHiddenSubmissionEntries());
    this.store$.dispatch(new LoadSubmissionQueue());
    this.store$.dispatch(new LoadSubmissions());
  }

  pageChange(page: number): void {
    this.page = page;
    this.store$.dispatch(new LoadSubmissionQueue({ page }));
  }

  entryExists(imageId: number): boolean {
    return this._getEntryElement(imageId) !== null;
  }

  scrollToEntry(imageId: number): void {
    const element = this._getEntryElement(imageId);

    if (element) {
      element.nativeElement.scrollIntoView({ behavior: "smooth" });
    }
  }

  filterHiddenSubmissionEntries(
    submissionEntries: SubmissionImageInterface[],
    hiddenSubmissionEntries: number[]
  ): SubmissionImageInterface[] {
    return submissionEntries.filter(entry => {
      return hiddenSubmissionEntries.indexOf(entry.pk) === -1;
    });
  }

  private _getEntryElement(imageId: number): ElementRef | null {
    const matches = this.submissionQueueEntries.filter(
      entry => entry.nativeElement.id === `submission-queue-entry-${imageId}`
    );

    if (matches.length > 0) {
      return matches[0];
    }

    return null;
  }
}
