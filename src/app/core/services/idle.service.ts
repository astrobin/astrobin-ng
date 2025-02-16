import { Inject, Injectable, OnDestroy, PLATFORM_ID } from "@angular/core";
import { fromEvent, merge, Subscription } from "rxjs";
import { throttleTime } from "rxjs/operators";
import { isPlatformServer } from "@angular/common";

@Injectable({ providedIn: "root" })
export class IdleService implements OnDestroy {
  private _lastActivity = Date.now();
  private readonly _idleThreshold = 5 * 60 * 1000; // 5 minutes
  private _idleSubscription: Subscription;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this._initIdleDetector();
  }

  public isUserIdle(): boolean {
    return Date.now() - this._lastActivity > this._idleThreshold;
  }

  ngOnDestroy(): void {
    if (this._idleSubscription) {
      this._idleSubscription.unsubscribe();
    }
  }

  private _initIdleDetector(): void {
    if (isPlatformServer(this.platformId)) {
      return;
    }

    const options = { passive: true };
    const mouseMove$ = fromEvent(document, "mousemove", options);
    const keyDown$ = fromEvent(document, "keydown", options);
    const activity$ = merge(mouseMove$, keyDown$);

    this._idleSubscription = activity$
      .pipe(throttleTime(500))
      .subscribe(() => {
        this._lastActivity = Date.now();
      });
  }
}
