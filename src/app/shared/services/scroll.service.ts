import { Inject, Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";
import { DOCUMENT } from "@angular/common";
import { PlatformService } from "@shared/services/platform.service";
import { ScrollCustomEvent } from "@ionic/angular";

@Injectable({ providedIn: "root" })
export class ScrollService {
  private _scrollSubject = new BehaviorSubject<ScrollCustomEvent>(undefined);
  private _scroll$ = this._scrollSubject.asObservable();

  constructor(
    @Inject(DOCUMENT) private _doc: Document,
    public readonly platformService: PlatformService
  ) {
  }

  get scroll() {
    return this._scroll$;
  }

  get nativeWindow() {
    return this.platformService.canAccessDOM() ? this._doc.defaultView : undefined;
  }

  emitScroll(event: ScrollCustomEvent) {
    this._scrollSubject.next(event);
  }
}
