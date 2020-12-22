import { Component, OnInit } from "@angular/core";
import { LoadSubmissionQueue } from "@features/iotd/store/submission-queue.actions";
import { State } from "@features/iotd/store/submission-queue.reducer";
import { selectSubmissionQueue } from "@features/iotd/store/submission-queue.selectors";
import { select, Store } from "@ngrx/store";
import { TranslateService } from "@ngx-translate/core";
import { ImageAlias } from "@shared/enums/image-alias.enum";
import { TitleService } from "@shared/services/title/title.service";
import { Observable } from "rxjs";

@Component({
  selector: "astrobin-submission-queue",
  templateUrl: "./submission-queue.component.html",
  styleUrls: ["./submission-queue.component.scss"]
})
export class SubmissionQueueComponent implements OnInit {
  ImageAlias = ImageAlias;
  submissionQueue$: Observable<State> = this.store$.pipe(select(selectSubmissionQueue));

  constructor(
    public readonly store$: Store<State>,
    public readonly titleService: TitleService,
    public readonly translate: TranslateService
  ) {}

  ngOnInit(): void {
    this.titleService.setTitle(this.translate.instant("Submission queue"));
    this.refresh();
  }

  refresh(): void {
    this.store$.dispatch(new LoadSubmissionQueue());
  }
}
