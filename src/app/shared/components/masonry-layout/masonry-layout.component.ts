import { AfterViewInit, ChangeDetectorRef, Component, ContentChild, ElementRef, EventEmitter, Inject, Input, OnChanges, OnDestroy, Output, PLATFORM_ID, Renderer2, SimpleChanges, TemplateRef, ViewChild } from "@angular/core";
import { auditTime, defer, from, fromEvent, Observable, of, Subject, switchMap, toArray } from "rxjs";
import { WindowRefService } from "@shared/services/window-ref.service";
import { isPlatformBrowser } from "@angular/common";
import { catchError, filter, map, mergeMap, retry, take, takeUntil, tap } from "rxjs/operators";
import { UtilsService } from "@shared/services/utils/utils.service";
import imagesLoaded from "imagesloaded";

export interface MasonryBreakpoints {
  xs?: number;
  sm?: number;
  md?: number;
  lg?: number;
  xl?: number;
}

interface MasonryItem<T> {
  data: T;
  visible: boolean;
  ready: boolean;
  rowSpan?: number;
}

@Component({
  selector: "astrobin-masonry-layout",
  template: `
    <div
      #container
      class="masonry-container"
      [style.--columns-xs]="breakpointColumns.xs"
      [style.--columns-sm]="breakpointColumns.sm"
      [style.--columns-md]="breakpointColumns.md"
      [style.--columns-lg]="breakpointColumns.lg"
      [style.--columns-xl]="breakpointColumns.xl"
      [style.--gutter]="gutter + 'px'"
    >
      <div
        *ngFor="let item of itemStates; trackBy: trackByFn"
        [attr.data-masonry-id]="item.data[this.idProperty]"
        [style.gridRowEnd]="item.rowSpan ? 'span ' + item.rowSpan : null"
        [class.ready]="item.ready"
        class="masonry-item"
      >
        <div class="masonry-content">
          <ng-container
            [ngTemplateOutlet]="itemTemplate"
            [ngTemplateOutletContext]="getTemplateContext(item.data)"
          >
          </ng-container>
        </div>
      </div>
    </div>
  `,
  styleUrls: [`./masonry-layout.component.scss`]
})
export class MasonryLayoutComponent<T> implements AfterViewInit, OnChanges, OnDestroy {
  @Input() items: T[] = [];
  @Input() idProperty = "id";
  @Input() gutter = 16;

  @Output() layoutReady = new EventEmitter<boolean>();

  @ViewChild("container") container!: ElementRef;

  @ContentChild(TemplateRef) itemTemplate!: TemplateRef<{
    $implicit: T;
  }>;

  protected breakpointColumns: Required<MasonryBreakpoints> = {
    xs: 1,
    sm: 2,
    md: 2,
    lg: 3,
    xl: 3
  };
  protected itemStates: MasonryItem<T>[] = [];

  private readonly _isBrowser: boolean;
  private _destroyed$ = new Subject<void>();

  constructor(
    public readonly windowRefService: WindowRefService,
    @Inject(PLATFORM_ID) public readonly platformId: Object,
    public readonly renderer: Renderer2,
    public readonly utilsService: UtilsService,
    public readonly changeDetectorRef: ChangeDetectorRef
  ) {
    this._isBrowser = isPlatformBrowser(platformId);
  }

  @Input() set breakpoints(value: MasonryBreakpoints) {
    this.breakpointColumns = {
      xs: value.xs ?? 1,
      sm: value.sm ?? 2,
      md: value.md ?? 2,
      lg: value.lg ?? 3,
      xl: value.xl ?? 3
    };
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.items) {
      this.layoutReady.emit(false);
      this._updateItemStates();
      requestAnimationFrame(() => {
        this._update();
      });
    } else if (changes.gutter || changes.breakpoints) {
      this.layoutReady.emit(false);
      this.itemStates.forEach(item => {
        item.visible = true;
        item.ready = false;
        item.rowSpan = undefined;
      });

      this.changeDetectorRef.detectChanges();

      requestAnimationFrame(() => {
        this.utilsService.delay(1).subscribe(() => {
          this._update();
          this.layoutReady.emit(true);
        });
      });
    }
  }

  ngAfterViewInit() {
    if (this._isBrowser) {
      this._initResizeListener();
    }
  }

  ngOnDestroy() {
    this._destroyed$.next();
    this._destroyed$.complete();
  }

  protected getTemplateContext(item: T) {
    return {
      $implicit: item
    };
  }

  protected trackByFn(_: number, item: MasonryItem<T>): string | number {
    return item.data[this.idProperty];
  }

  private _calculateLayout(
    item: HTMLElement,
    rowGap: number,
    rowHeight: number
  ): Observable<{ rowSpan: number; contentHeight: number } | null> {
    if (!this.container) {
      return of(null);
    }

    const content = item.querySelector(".masonry-content");
    if (!content) {
      console.error(
        `Masonry item ${item.getAttribute("data-masonry-id")} does not have a .masonry-content element.`
      );
      return of(null);
    }

    return defer(() => {
      const rect = content.getBoundingClientRect();
      if (rect.height === 0) {
        console.error(`Zero height detected for item ${item.getAttribute("data-masonry-id")}`);
        throw new Error("Zero height detected");
      }

      const safetyMargin = 2;
      const rowSpan = Math.ceil((rect.height + rowGap + safetyMargin) / (rowHeight + rowGap));

      return of({ rowSpan, contentHeight: rect.height });
    }).pipe(
      retry({
        count: 3,
        delay: (error, retryCount) => {
          return this.utilsService.delay(100 * (retryCount + 1));
        }
      }),
      catchError(() => {
        // If we still have zero height after retries, use rowHeight as fallback
        const rowSpan = Math.ceil((rowHeight + rowGap + 2) / (rowHeight + rowGap));
        return of({ rowSpan, contentHeight: rowHeight });
      })
    );
  }

  private _updateItemLayout(
    item: HTMLElement,
    rowGap: number,
    rowHeight: number
  ): Observable<void> {
    const itemId = item.getAttribute("data-masonry-id");
    const stateIndex = this.itemStates.findIndex(
      state => state.data[this.idProperty].toString() === itemId
    );

    if (stateIndex === -1) {
      return of(void 0);
    }

    return this._calculateLayout(item, rowGap, rowHeight).pipe(
      tap(layout => {
        if (layout) {
          this.itemStates[stateIndex].rowSpan = layout.rowSpan;
          this.itemStates[stateIndex].visible = true;
          this.changeDetectorRef.markForCheck();
        }
      }),
      map(() => void 0)
    );
  }

  private _getGridRowGapAndHeight(): [number, number] {
    const grid = this.container.nativeElement;
    const computedStyle = getComputedStyle(grid);
    const rowGap = parseInt(computedStyle.getPropertyValue("grid-row-gap") || "0");
    const rowHeight = parseInt(computedStyle.getPropertyValue("grid-auto-rows") || "1");

    return [rowGap, rowHeight];
  }

  private _update() {
    if (!this.container) {
      this.utilsService.delay(25).subscribe(() => this._update());
      return;
    }

    const unreadyItems = this.container.nativeElement.querySelectorAll(".masonry-item:not(.ready)");

    if (unreadyItems.length === 0) {
      this.layoutReady.emit(true);
      return;
    }

    const [rowGap, rowHeight] = this._getGridRowGapAndHeight();

    const layoutUpdates$ = from(unreadyItems).pipe(
      mergeMap((item: HTMLElement) => {
        const hasImages = item.querySelectorAll("img").length > 0;

        if (!hasImages) {
          return this._updateItemLayout(item, rowGap, rowHeight);
        }

        const imgLoad = imagesLoaded(item);

        return new Observable<void>(subscriber => {

          imgLoad.on("done", () => {
            this.utilsService.delay(50).subscribe(() => {
              this._updateItemLayout(item, rowGap, rowHeight).subscribe({
                next: () => {
                  subscriber.next();
                  subscriber.complete();
                },
                error: (err) => {
                  console.error(`Error updating layout for item ${item.getAttribute("data-masonry-id")}:`, err);
                  subscriber.error(err);
                }
              });
            });
          });

          imgLoad.on("fail", (instance, image) => {
            console.warn(`Image load failed for item ${item.getAttribute("data-masonry-id")}:`, image);
            this._updateItemLayout(item, rowGap, rowHeight).subscribe({
              next: () => {
                subscriber.next();
                subscriber.complete();
              },
              error: (err) => subscriber.error(err)
            });
          });
        });
      }),
      tap({
        error: (err) => console.error("Error processing item:", err),
      }),
      toArray()
    );

    const markAllItemsReady = () => {
      this.utilsService.delay(1).subscribe(() => {
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            this.itemStates.forEach(item => {
              item.ready = true;
            });
            this.layoutReady.emit(true);
          });
        });
      });
    };

    layoutUpdates$.subscribe({
      complete: () => {
        markAllItemsReady();
      },
      error: (error) => {
        console.error("Error in layout updates:", error);
        markAllItemsReady();
      }
    });
  }

  private _updateItemStates() {
    this.itemStates = this.items?.map(item => {
      const existingState = this.itemStates.find(
        state => state.data[this.idProperty] === item[this.idProperty]
      );

      return {
        ...(existingState || {}),
        data: item,
        visible: existingState ? existingState.visible : true,
        ready: existingState ? existingState.ready : false,
        rowSpan: existingState ? existingState.rowSpan : undefined
      };
    }) || [];
  }

  private _initResizeListener() {
    fromEvent(this.windowRefService.nativeWindow, "resize")
      .pipe(
        auditTime(250),
        takeUntil(this._destroyed$)
      )
      .subscribe(() => {
        this.itemStates.forEach(item => {
          item.visible = false;
          item.ready = false;
          item.rowSpan = undefined;
        });
        this._updateLayout();
      });
  }

  private _updateLayout() {
    if (!this._isBrowser || !this.container) {
      return;
    }

    const unreadyItems = this.container.nativeElement.querySelectorAll(".masonry-item:not(.ready)");
    const [rowGap, rowHeight] = this._getGridRowGapAndHeight();
    if (unreadyItems.length > 0) {
      requestAnimationFrame(() => {
        unreadyItems.forEach((item: HTMLElement) => this._updateItemLayout(item, rowGap, rowHeight));
        this.changeDetectorRef.markForCheck();
      });
    }
  }
}
