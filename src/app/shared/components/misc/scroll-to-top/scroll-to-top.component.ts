import { Component, Inject, Input, OnInit, PLATFORM_ID } from "@angular/core";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { State } from "@app/store/state";
import { Store } from "@ngrx/store";
import { WindowRefService } from "@shared/services/window-ref.service";
import { fromEvent } from "rxjs";
import { debounceTime, distinctUntilChanged, takeUntil } from "rxjs/operators";
import { isPlatformBrowser, isPlatformServer } from "@angular/common";

@Component({
  selector: "astrobin-scroll-to-top",
  templateUrl: "./scroll-to-top.component.html",
  styleUrls: ["./scroll-to-top.component.scss"]
})
export class ScrollToTopComponent extends BaseComponentDirective implements OnInit {
  offset = 0;

  @Input()
  position: "left" | "right" = "right";

  constructor(
    public readonly store$: Store<State>,
    public windowRefService: WindowRefService,
    @Inject(PLATFORM_ID) public readonly platformId: Object
  ) {
    super(store$);
  }

  get show(): boolean {
    if (isPlatformServer(this.platformId)) {
      return false;
    }

    return this.offset > this.windowRefService.nativeWindow.innerHeight / 2;
  }

  ngOnInit(): void {
    super.ngOnInit();

    if (isPlatformBrowser(this.platformId)) {
      fromEvent(window, "scroll")
        .pipe(takeUntil(this.destroyed$), debounceTime(100), distinctUntilChanged())
        .subscribe(() => (this.offset = this.windowRefService.nativeWindow.pageYOffset));
    }
  }

  scrollToTop() {
    if (isPlatformServer(this.platformId)) {
      return;
    }

    this.windowRefService.nativeWindow.scrollTo({
      top: 0,
      left: 0,
      behavior: "smooth"
    });
  }
}
