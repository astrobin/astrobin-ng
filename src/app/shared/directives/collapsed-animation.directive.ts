import { isPlatformBrowser } from "@angular/common";
import type { AfterViewInit, ChangeDetectorRef, ElementRef, OnChanges, OnDestroy, Renderer2 } from "@angular/core";
import { Directive, Inject, Input, PLATFORM_ID } from "@angular/core";
import type { UtilsService } from "@core/services/utils/utils.service";

const ANIMATION_DURATION = 150;

@Directive({
  selector: "[collapseAnimation]"
})
export class CollapseAnimationDirective implements AfterViewInit, OnChanges, OnDestroy {
  @Input() collapsed = false;

  private _observer?: ResizeObserver;

  private _contentHeight = 0;
  private _initialPaddingTop?: number;
  private _initialPaddingBottom?: number;
  private _initialMarginTop?: number;
  private _initialMarginBottom?: number;
  private _initialized = false;
  private _firstUpdate = true;

  constructor(
    public readonly elementRef: ElementRef,
    public readonly renderer: Renderer2,
    public readonly changeDetectorRef: ChangeDetectorRef,
    @Inject(PLATFORM_ID) public readonly platformId: Object,
    public readonly utilsService: UtilsService
  ) {}

  async ngAfterViewInit() {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    try {
      // Get ResizeObserver (native or polyfill)
      const ResizeObserverClass = await this.utilsService.getResizeObserver();
      let resizeTimeout: any;

      this._observer = new ResizeObserverClass(() => {
        if (resizeTimeout) {
          return;
        }

        resizeTimeout = setTimeout(() => {
          this._updateContentHeight();
          clearTimeout(resizeTimeout);
          this.changeDetectorRef.markForCheck();
        }, 100);
      });

      // Initial setup in requestAnimationFrame as before
      requestAnimationFrame(() => {
        this._captureInitialMeasurements();
        this._observer?.observe(this.elementRef.nativeElement);
        this._initialized = true;
        this._updateStyles();
        this.changeDetectorRef.markForCheck();
      });
    } catch (e) {
      console.error("Failed to initialize ResizeObserver:", e);
    }
  }

  ngOnDestroy() {
    if (isPlatformBrowser(this.platformId) && this._observer) {
      this._observer.disconnect();
    }
  }

  ngOnChanges() {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    if (this._initialized && !this._firstUpdate) {
      this.renderer.setStyle(this.elementRef.nativeElement, "transition", `all ${ANIMATION_DURATION}ms ease-out`);
      this._updateStyles();
      this.changeDetectorRef.markForCheck();
    }
    this._firstUpdate = false;
  }

  private _captureInitialMeasurements() {
    const computedStyle = getComputedStyle(this.elementRef.nativeElement);
    this._initialPaddingTop = parseFloat(computedStyle.paddingTop);
    this._initialPaddingBottom = parseFloat(computedStyle.paddingBottom);
    this._initialMarginTop = parseFloat(computedStyle.marginTop);
    this._initialMarginBottom = parseFloat(computedStyle.marginBottom);
    this._contentHeight = this.elementRef.nativeElement.scrollHeight;
  }

  private _updateContentHeight() {
    if (!this._initialized || this.collapsed) {
      return;
    } // Prevent updates before setup or when collapsed
    this._contentHeight = this.elementRef.nativeElement.scrollHeight;
    this._updateStyles();
  }

  private _updateStyles() {
    const element = this.elementRef.nativeElement;
    this.renderer.setStyle(element, "will-change", "max-height, opacity, margin, padding");

    if (!this.collapsed) {
      this._contentHeight = this.elementRef.nativeElement.scrollHeight; // Measure once

      this.renderer.setStyle(element, "max-height", `${this._contentHeight}px`);
      this.renderer.setStyle(element, "opacity", "1");
      this.renderer.setStyle(element, "padding-top", `${this._initialPaddingTop}px`);
      this.renderer.setStyle(element, "padding-bottom", `${this._initialPaddingBottom}px`);
      this.renderer.setStyle(element, "margin-top", `${this._initialMarginTop}px`);
      this.renderer.setStyle(element, "margin-bottom", `${this._initialMarginBottom}px`);

      // Reset height to auto after animation to avoid future reflows
      this.utilsService.delay(ANIMATION_DURATION + ANIMATION_DURATION / 3).subscribe(() => {
        this.renderer.setStyle(element, "max-height", "none");
        this.renderer.removeStyle(element, "will-change"); // Cleanup
      });
    } else {
      this.renderer.setStyle(element, "max-height", "0");
      this.renderer.setStyle(element, "opacity", "0");
      this.renderer.setStyle(element, "padding-top", "0");
      this.renderer.setStyle(element, "padding-bottom", "0");
      this.renderer.setStyle(element, "margin-top", "0");
      this.renderer.setStyle(element, "margin-bottom", "0");
    }
  }
}
