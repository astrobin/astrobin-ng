import { Directive, ElementRef, EventEmitter, Inject, Input, OnDestroy, OnInit, Output, PLATFORM_ID } from "@angular/core";
import { isPlatformBrowser } from "@angular/common";

@Directive({
  selector: "[astrobinIntersectionObserver]"
})
export class IntersectionObserverDirective implements OnInit, OnDestroy {
  @Input() threshold = 0;
  @Input() rootMargin = "0px";
  @Output() intersectionChange = new EventEmitter<boolean>();

  private observer: IntersectionObserver | null = null;
  private readonly _isBrowser: boolean;

  constructor(
    private elementRef: ElementRef,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this._isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit() {
    if (this._isBrowser) {
      this.createObserver();
    }
  }

  ngOnDestroy() {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
  }

  private createObserver() {
    const options = {
      rootMargin: this.rootMargin,
      threshold: this.threshold
    };

    this.observer = new IntersectionObserver(([entry]) => {
      this.intersectionChange.emit(entry.isIntersecting);
    }, options);

    this.observer.observe(this.elementRef.nativeElement);
  }
}
