import { Component, Inject, Input, OnInit, PLATFORM_ID } from "@angular/core";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { Store } from "@ngrx/store";
import { State } from "@app/store/state";
import { interval, Subscription } from "rxjs";
import { takeUntil } from "rxjs/operators";
import { isPlatformBrowser } from "@angular/common";

@Component({
  selector: "astrobin-count-down",
  templateUrl: "./count-down.component.html",
  styleUrls: ["./count-down.component.scss"]
})
export class CountDownComponent extends BaseComponentDirective implements OnInit {
  readonly MILLISECONDS_IN_A_SECOND = 1000;
  readonly HOURS_IN_A_DAY = 24;
  readonly MINUTES_IN_AN_HOUR = 60;
  readonly SECONDS_IN_A_MINUTE = 60;

  now = new Date();

  @Input()
  targetDate: string;

  @Input()
  showSeconds = true;

  timeDifference;
  secondsToTargetDate;
  minutesToTargetDate;
  hoursToTargetDate;
  daysToTargetDate;

  constructor(public readonly store$: Store<State>, @Inject(PLATFORM_ID) public readonly platformId) {
    super(store$);
  }

  ngOnInit() {
    super.ngOnInit();

    this.getTimeDifference();

    if (isPlatformBrowser(this.platformId)) {
      interval(this.showSeconds ? 1000 : 60000)
        .pipe(takeUntil(this.destroyed$))
        .subscribe(x => {
          if (!!this.targetDate) {
            this.getTimeDifference();
          }
        });
    }
  }

  private getTimeDifference() {
    this.timeDifference = new Date(this.targetDate).getTime() - new Date().getTime();
    this.allocateTimeUnits(this.timeDifference);
  }

  private allocateTimeUnits(timeDifference) {
    this.secondsToTargetDate = Math.floor((timeDifference / this.MILLISECONDS_IN_A_SECOND) % this.SECONDS_IN_A_MINUTE);
    this.minutesToTargetDate = Math.floor(
      (timeDifference / (this.MILLISECONDS_IN_A_SECOND * this.MINUTES_IN_AN_HOUR)) % this.SECONDS_IN_A_MINUTE
    );
    this.hoursToTargetDate = Math.floor(
      (timeDifference / (this.MILLISECONDS_IN_A_SECOND * this.MINUTES_IN_AN_HOUR * this.SECONDS_IN_A_MINUTE)) %
        this.HOURS_IN_A_DAY
    );
    this.daysToTargetDate = Math.floor(
      timeDifference /
        (this.MILLISECONDS_IN_A_SECOND * this.MINUTES_IN_AN_HOUR * this.SECONDS_IN_A_MINUTE * this.HOURS_IN_A_DAY)
    );
  }
}
