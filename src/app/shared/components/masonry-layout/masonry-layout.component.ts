import { isPlatformBrowser } from "@angular/common";
import type { AfterViewInit, OnDestroy } from "@angular/core";
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ContentChild,
  ElementRef,
  Inject,
  Input,
  PLATFORM_ID,
  Renderer2,
  TemplateRef,
  ViewChild
} from "@angular/core";
import { UtilsService } from "@core/services/utils/utils.service";
import { WindowRefService } from "@core/services/window-ref.service";
import { auditTime, Subject } from "rxjs";
import { distinctUntilChanged, takeUntil } from "rxjs/operators";

@Component({
  selector: "astrobin-masonry-layout",
  template: `
    <div
      #container
      class="masonry-container d-flex flex-wrap flex-row"
      [class.ready]="!!containerWidth && !!layout"
      [class.small]="layout === 'small'"
      [class.medium]="layout === 'medium'"
      [class.large]="layout === 'large'"
      [class.xl]="layout === 'xl'"
      [style.--gutter]="'1rem'"
      [style.--container-width]="containerWidth"
    >
      <div
        *ngFor="let item of items; let i = index; trackBy: trackByFn"
        [attr.data-masonry-id]="item[this.idProperty]"
        class="masonry-item"
        [class.small]="layout === 'small'"
        [class.medium]="layout === 'medium'"
        [class.large]="layout === 'large'"
        [class.xl]="layout === 'xl'"
        [class.aspect-narrow]="
          item[widthProperty] && item[heightProperty] && item[widthProperty] / item[heightProperty] < 0.8
        "
        [class.aspect-square]="
          item[widthProperty] &&
          item[heightProperty] &&
          item[widthProperty] / item[heightProperty] >= 0.8 &&
          item[widthProperty] / item[heightProperty] <= 1.2
        "
        [class.aspect-wide]="
          item[widthProperty] && item[heightProperty] && item[widthProperty] / item[heightProperty] > 1.2
        "
        [class.aspect-panoramic]="
          item[widthProperty] && item[heightProperty] && item[widthProperty] / item[heightProperty] > 2
        "
      >
        <div class="masonry-content">
          <ng-container [ngTemplateOutlet]="itemTemplate" [ngTemplateOutletContext]="getTemplateContext(item)">
          </ng-container>
        </div>
      </div>

      <div *ngIf="leftAlignLastRow" class="masonry-spacer"></div>
    </div>
  `,
  styleUrls: [`./masonry-layout.component.scss`],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MasonryLayoutComponent<T> implements AfterViewInit, OnDestroy {
  @Input() items: T[] = [];
  @Input() layout: "small" | "medium" | "large" | "xl" | null = null;
  @Input() idProperty = "id";
  @Input() widthProperty = "w";
  @Input() heightProperty = "h";
  @Input() leftAlignLastRow = true;

  @ViewChild("container") container!: ElementRef;

  @ContentChild(TemplateRef) itemTemplate!: TemplateRef<{
    $implicit: T;
  }>;

  protected containerWidth = 0;

  private readonly _isBrowser: boolean;
  private _destroyed$ = new Subject<void>();
  private _resize$ = new Subject<number>();
  private _resizeObserver: ResizeObserver | null = null;

  constructor(
    public readonly windowRefService: WindowRefService,
    @Inject(PLATFORM_ID) public readonly platformId: object,
    public readonly renderer: Renderer2,
    public readonly utilsService: UtilsService,
    public readonly changeDetectorRef: ChangeDetectorRef
  ) {
    this._isBrowser = isPlatformBrowser(platformId);

    this._resize$.pipe(auditTime(16), distinctUntilChanged(), takeUntil(this._destroyed$)).subscribe(width => {
      this.containerWidth = width;
      this.changeDetectorRef.markForCheck();
    });
  }

  async ngAfterViewInit() {
    if (this._isBrowser && this.container) {
      // Immediate synchronous width calculation
      this.containerWidth = Math.round(this.container.nativeElement.getBoundingClientRect().width);
      this.changeDetectorRef.detectChanges();

      try {
        const ResizeObserverClass = await this.utilsService.getResizeObserver();

        this._resizeObserver = new ResizeObserverClass(entries => {
          const newWidth = Math.round(entries[0].contentRect.width);
          if (newWidth !== this.containerWidth) {
            this._resize$.next(newWidth);
          }
        });

        this._resizeObserver.observe(this.container.nativeElement);
      } catch (e) {
        console.error("Failed to initialize ResizeObserver:", e);
      }
    }
  }

  ngOnDestroy() {
    if (this._resizeObserver) {
      this._resizeObserver.disconnect();
    }

    this._destroyed$.next();
    this._destroyed$.complete();
  }

  protected getTemplateContext(item: T) {
    return {
      $implicit: item
    };
  }

  protected trackByFn(_: number, item: T): string | number {
    return item[this.idProperty];
  }
}
