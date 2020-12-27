import { Component, OnInit } from "@angular/core";
import { ShowFullscreenImage } from "@app/store/actions/fullscreen-image.actions";
import { LoadSubmissionQueue } from "@features/iotd/store/iotd.actions";
import { IotdState } from "@features/iotd/store/iotd.reducer";
import { selectSubmissionQueue } from "@features/iotd/store/iotd.selectors";
import { select, Store } from "@ngrx/store";
import { TranslateService } from "@ngx-translate/core";
import { ImageAlias } from "@shared/enums/image-alias.enum";
import { ImageInterface } from "@shared/interfaces/image.interface";
import { PaginatedApiResultInterface } from "@shared/services/api/interfaces/paginated-api-result.interface";
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
  submissionQueue$: Observable<PaginatedApiResultInterface<ImageInterface>> = this.store$.pipe(
    select(selectSubmissionQueue)
  );

  constructor(
    public readonly store$: Store<IotdState>,
    public readonly titleService: TitleService,
    public readonly translate: TranslateService,
    public readonly paginationService: PaginationService
  ) {}

  ngOnInit(): void {
    this.titleService.setTitle(this.translate.instant("Submission queue"));
    this.refresh();
  }

  refresh(): void {
    this.store$.dispatch(new LoadSubmissionQueue());
  }

  viewFullscreen(id: number): void {
    this.store$.dispatch(new ShowFullscreenImage(id));
  }

  pageChange(page: number): void {
    this.page = page;
    this.store$.dispatch(new LoadSubmissionQueue({ page }));
  }
}
