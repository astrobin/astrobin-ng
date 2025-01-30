import { isPlatformBrowser } from "@angular/common";
import { Inject, Injectable, PLATFORM_ID } from "@angular/core";
import { TimeagoDefaultClock } from "ngx-timeago";
import { EMPTY, Observable } from "rxjs";

@Injectable({
  providedIn: "root"
})
export class TimeagoAppClock extends TimeagoDefaultClock {
  constructor(
    @Inject(PLATFORM_ID) private readonly platformId: Record<string, unknown>
  ) {
    super();
  }

  tick(then: number): Observable<unknown> {
    return isPlatformBrowser(this.platformId) ? super.tick(then) : EMPTY;
  }
}
