import { AfterViewInit, ChangeDetectorRef, Component, ContentChild, ElementRef, EventEmitter, Inject, Input, OnChanges, OnDestroy, Output, PLATFORM_ID, Renderer2, SimpleChanges, TemplateRef, ViewChild } from "@angular/core";
import { auditTime, fromEvent, Subject } from "rxjs";
import { WindowRefService } from "@shared/services/window-ref.service";
import { isPlatformBrowser } from "@angular/common";
import { takeUntil } from "rxjs/operators";
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
        item.ready = false;
        item.rowSpan = undefined;
      });

      this.utilsService.delay(200).subscribe(() => {
        requestAnimationFrame(() => {
          this._updateLayout();
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

  private _calculateLayout(item: HTMLElement): { rowSpan: number } | null {
    if (!this.container) {
      return null;
    }

    const content = item.querySelector(".masonry-content");
    if (!content) {
      return null;
    }

    const grid = this.container.nativeElement;
    const computedStyle = getComputedStyle(grid);
    const rowGap = parseInt(computedStyle.getPropertyValue("grid-row-gap") || "0");
    const rowHeight = parseInt(computedStyle.getPropertyValue("grid-auto-rows") || "1");
    const contentHeight = content.getBoundingClientRect().height;

    return {
      rowSpan: Math.ceil((contentHeight + rowGap) / (rowHeight + rowGap))
    };
  }

  private _updateItemLayout(item: HTMLElement): void {
    const itemId = item.getAttribute("data-masonry-id");
    const stateIndex = this.itemStates.findIndex(
      state => state.data[this.idProperty].toString() === itemId
    );

    if (stateIndex !== -1) {
      const layout = this._calculateLayout(item);
      if (layout) {
        this.itemStates[stateIndex].rowSpan = layout.rowSpan;
        this.itemStates[stateIndex].ready = true;
      }
    }
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

    Promise.all([...unreadyItems].map(item =>
      new Promise<void>(resolve => {
        const imgLoad = imagesLoaded(item);

        imgLoad.on("done", () => {
          requestAnimationFrame(() => {
            this._updateItemLayout(item);
            this.changeDetectorRef.markForCheck();
            resolve();
          });
        });

        imgLoad.on("fail", () => resolve());
      })
    )).then(() => {
      this.layoutReady.emit(true);
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
      .subscribe(() => this._updateLayout());
  }

  private _updateLayout() {
    if (!this._isBrowser || !this.container) {
      return;
    }

    const unreadyItems = this.container.nativeElement.querySelectorAll(".masonry-item:not(.ready)");

    if (unreadyItems.length > 0) {
      requestAnimationFrame(() => {
        unreadyItems.forEach(item => this._updateItemLayout(item));
        this.changeDetectorRef.markForCheck();
      });
    }
  }
}
