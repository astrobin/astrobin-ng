import { Component, OnInit } from "@angular/core";
import { ContestsService } from "@features/contests/services/contests.service";
import { TranslateService } from "@ngx-translate/core";
import { BaseComponent } from "@shared/components/base.component";
import { Constants } from "@shared/constants";
import { TitleService } from "@shared/services/title/title.service";
import { UserStoreService } from "@shared/services/user-store.service";
import { BehaviorSubject, interval } from "rxjs";
import { startWith, takeUntil } from "rxjs/operators";

@Component({
  selector: "astrobin-contests-list",
  templateUrl: "./contests-list.component.html",
  styleUrls: ["./contests-list.component.scss"]
})
export class ContestsListComponent extends BaseComponent implements OnInit {
  readonly autoRefresh$ = interval(Constants.AUTO_REFRESH_INTERVAL).pipe(startWith(0), takeUntil(this.destroyed$));

  readonly refreshRunningContestsSubject = new BehaviorSubject(undefined);
  readonly refreshOpenContestsSubject = new BehaviorSubject(undefined);
  readonly refreshClosedContestsSubject = new BehaviorSubject(undefined);

  readonly runningContests$ = this.refreshRunningContestsSubject.asObservable();
  readonly openContests$ = this.refreshOpenContestsSubject.asObservable();
  readonly closedContests$ = this.refreshClosedContestsSubject.asObservable();

  refreshingRunningContests = false;
  refreshingOpenContests = false;
  refreshingClosedContests = false;

  constructor(
    public contestsService: ContestsService,
    public titleService: TitleService,
    public userStore: UserStoreService,
    public translate: TranslateService
  ) {
    super();
    titleService.setTitle(translate.instant("Contests"));
  }

  ngOnInit(): void {
    this.autoRefresh$.subscribe(() => {
      this.refreshRunningContests();
      this.refreshOpenContests();
      this.refreshClosedContests();
    });
  }

  refreshRunningContests(): void {
    this.refreshingRunningContests = true;
    this.contestsService.listRunning().subscribe(response => {
      this.refreshRunningContestsSubject.next(response);
      this.refreshingRunningContests = false;
    });
  }

  refreshOpenContests(): void {
    this.refreshingOpenContests = true;
    this.contestsService.listOpen().subscribe(response => {
      this.refreshOpenContestsSubject.next(response);
      this.refreshingOpenContests = false;
    });
  }

  refreshClosedContests(): void {
    this.refreshingClosedContests = true;
    this.contestsService.listClosed().subscribe(response => {
      this.refreshClosedContestsSubject.next(response);
      this.refreshingClosedContests = false;
    });
  }
}
