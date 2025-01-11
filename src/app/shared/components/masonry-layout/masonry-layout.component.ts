import { AfterViewInit, Component, ContentChild, ElementRef, EventEmitter, Inject, Input, OnChanges, OnDestroy, OnInit, Output, PLATFORM_ID, Renderer2, SimpleChanges, TemplateRef, ViewChild } from "@angular/core";
import { auditTime, fromEvent, merge, Subject, throttleTime } from "rxjs";
import { WindowRefService } from "@shared/services/window-ref.service";
import { isPlatformBrowser } from "@angular/common";
import { debounceTime, takeUntil } from "rxjs/operators";
import { UtilsService } from "@shared/services/utils/utils.service";
import { Breakpoint } from "@shared/services/device.service";

export interface MasonryBreakpoints {
  xs?: number;
  sm?: number;
  md?: number;
  lg?: number;
  xl?: number;
}

export interface MasonryLoadable {
  loaded: EventEmitter<void>;
}

interface MasonryItem<T> {
  data: T;
  visible: boolean;
  height?: number;
}

@Component({
  selector: "astrobin-masonry-layout",
  template: `
    <div
      #container
      class="masonry-container"
      [style.--gutter]="gutter"
    >
      <div
        *ngFor="let item of itemStates; trackBy: trackByFn"
        class="masonry-item"
        [attr.data-masonry-id]="item.data[this.idProperty]"
        [style.height.px]="item.height || null"
        [style.--columns-xs]="breakpointColumns.xs"
        [style.--columns-sm]="breakpointColumns.sm"
        [style.--columns-md]="breakpointColumns.md"
        [style.--columns-lg]="breakpointColumns.lg"
        [style.--columns-xl]="breakpointColumns.xl"
        [style.--gutter]="gutter"
      >
        <ng-container
          *ngIf="item.visible"
          [ngTemplateOutlet]="itemTemplate"
          [ngTemplateOutletContext]="getTemplateContext(item.data)"
        >
        </ng-container>
      </div>
    </div>
  `,
  styleUrls: ["./masonry-layout.component.scss"]

})
export class MasonryLayoutComponent<T> implements OnInit, AfterViewInit, OnChanges, OnDestroy {
  @Input() items: T[] = [];
  @Input() idProperty = "id";
  @Input() gutter = 20;

  @Output() layoutReady = new EventEmitter<void>();

  @ViewChild("container") container!: ElementRef;

  @ContentChild(TemplateRef) itemTemplate!: TemplateRef<{
    $implicit: T;
    notifyReady: () => void;
  }>;

  protected breakpointColumns: Required<MasonryBreakpoints> = {
    xs: 1,
    sm: 2,
    md: 2,
    lg: 3,
    xl: 3
  };
  protected itemStates: MasonryItem<T>[] = [];
  protected MasonryModule: any;
  protected masonry: any;

  private readonly _isBrowser: boolean;
  private readonly _READY_TIMEOUT = 5000;
  private readonly _SCROLL_BUFFER: number;

  private _masonryLoaded = false;
  private _pendingReadyItems = new Set<string | number>();
  private _layoutInProgress = false;
  private _readyItems = new Set<string | number>();
  private _previousItemCount = 0;
  private _currentBreakpoint?: string;
  private _readyTimeouts = new Map<string | number, any>();
  private _destroyed$ = new Subject<void>();

  constructor(
    public readonly windowRefService: WindowRefService,
    @Inject(PLATFORM_ID) public readonly platformId: Object,
    public readonly renderer: Renderer2,
    public readonly utilsService: UtilsService
  ) {
    this._isBrowser = isPlatformBrowser(platformId);

    if (this._isBrowser) {
      this._SCROLL_BUFFER = this.windowRefService.nativeWindow.innerHeight * 2;
    }
  }

  @Input() set breakpoints(value: MasonryBreakpoints) {
    this.breakpointColumns = {
      xs: value.xs ?? 1,
      sm: value.sm ?? 2,
      md: value.md ?? 2,
      lg: value.lg ?? 3,
      xl: value.xl ?? 3
    };

    this._reloadMasonry();
  }

  async ngOnInit() {
    if (this._isBrowser) {
      this.MasonryModule = await import("masonry-layout");
      this._masonryLoaded = true;

      // Process any pending ready items
      this._pendingReadyItems.forEach(itemId => {
        this._notifyItemReady(itemId);
      });
      this._pendingReadyItems.clear();
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.items) {
      this._updateItemStates();
    }

    if (
      this.masonry &&
      (changes.breakpoints && !changes.breakpoints.firstChange) ||
      (changes.gutter && !changes.gutter.firstChange)
    ) {
      this._reloadMasonry();
    }
  }

  ngAfterViewInit() {
    if (this._isBrowser) {
      this._initScrollListener();
      this._initResizeListener();
    }
  }

  ngOnDestroy() {
    this._destroyMasonry();

    if (this._isBrowser) {
      this._readyTimeouts.forEach(timeout => clearTimeout(timeout));
      this._readyTimeouts.clear();
    }

    this._destroyed$.next();
    this._destroyed$.complete();
  }

  protected getTemplateContext(item: T) {
    return {
      $implicit: item,
      notifyReady: () => this._notifyItemReady(item[this.idProperty])
    };
  }

  protected trackByFn(_: number, item: MasonryItem<T>): string | number {
    return item.data[this.idProperty];
  }

  private _getBreakpoint(): string {
    const width = this.windowRefService.nativeWindow.innerWidth;

    if (width < Breakpoint.XXS_MIN) {
      return "xxxs";
    }

    if (width < Breakpoint.XS_MIN) {
      return "xxs";
    }

    if (width < Breakpoint.SM_MIN) {
      return "xs";
    }

    if (width < Breakpoint.MD_MIN) {
      return "sm";
    }

    if (width < Breakpoint.LG_MIN) {
      return "md";
    }

    if (width < Breakpoint.XL_MIN) {
      return "lg";
    }

    if (width < Breakpoint.XXL_MIN) {
      return "xl";
    }

    return "xxl";
  }

  private _notifyItemReady(itemId: string | number) {
    if (this._isBrowser) {
      if (this._readyTimeouts.has(itemId)) {
        clearTimeout(this._readyTimeouts.get(itemId));
        this._readyTimeouts.delete(itemId);
      }
    }

    if (!this._masonryLoaded) {
      this._pendingReadyItems.add(itemId);
      return;
    }

    if (this._readyItems.has(itemId)) {
      return;
    }

    this._readyItems.add(itemId);

    if (this._readyItems.size === this.items.length) {
      if (!this.masonry) {
        this._initMasonry();
      } else {
        if (!this._layoutInProgress) {
          const items = this.container.nativeElement.querySelectorAll(".masonry-item") as NodeListOf<HTMLElement>;
          const newElements = Array.from(items).slice(this._previousItemCount);

          if (newElements.length > 0) {
            this._layoutInProgress = true;
            this.masonry.once("layoutComplete", () => this._masonryLayoutComplete());
            this.masonry.appended(newElements);
          }
        }
      }

      this._previousItemCount = this.items.length;
    }
  }

  private _updateItemStates() {
    this.itemStates = this.items ? this.items.map(item => {
      const existingState = this.itemStates.find(
        state => state.data[this.idProperty] === item[this.idProperty]
      );

      // Set timeout for new items that aren't already ready
      if (this._isBrowser) {
        if (!existingState && !this._readyItems.has(item[this.idProperty]) && !this._readyTimeouts.has(item[this.idProperty])) {
          this._readyTimeouts.set(item[this.idProperty], setTimeout(() => {
            this._notifyItemReady(item[this.idProperty]);
          }, this._READY_TIMEOUT));
        }
      }

      return existingState || {
        data: item,
        visible: true
      };
    }) : [];
  }

  private _initScrollListener() {
    const scrollableParent = UtilsService.getScrollableParent(this.container.nativeElement, this.windowRefService);

    fromEvent(scrollableParent, "scroll")
      .pipe(
        auditTime(100), // or throttleTime/debounceTime
        takeUntil(this._destroyed$)
      )
      .subscribe(() => this._updateVisibleItems());
  }

  private _initResizeListener() {
    fromEvent(this.windowRefService.nativeWindow, "resize")
      .pipe(debounceTime(100), takeUntil(this._destroyed$))
      .subscribe(() => {
        const newBreakpoint = this._getBreakpoint();
        const breakpointChanged = this._currentBreakpoint !== newBreakpoint;
        this._currentBreakpoint = newBreakpoint;

        this._relayout(breakpointChanged);
      });
  }

  private _relayout(reloadItems: boolean) {
    if (this.masonry && !this._layoutInProgress) {
      this.itemStates = this.items.map(item => ({
        data: item,
        visible: true
      }));

      requestAnimationFrame(() => {
        this._layoutInProgress = true;

        if (reloadItems) {
          this.masonry.reloadItems();
        }

        this.masonry.once("layoutComplete", () => this._masonryLayoutComplete());
        this.masonry.layout();
      });
    }
  }

  private _updateVisibleItems() {
    if (
      !this._isBrowser ||
      !this.container ||
      this._layoutInProgress ||
      this._readyItems?.size !== this.items?.length
    ) {
      return;
    }

    const _win = this.windowRefService.nativeWindow;
    const _doc = _win.document;

    // Query all .masonry-item elements at once
    const elements = this.container.nativeElement.querySelectorAll(".masonry-item");

    // Build a Map of id -> element
    const elementsById = new Map<string, HTMLElement>();
    elements.forEach((el: HTMLElement) => {
      const itemId = el.getAttribute("data-masonry-id");
      if (itemId) {
        elementsById.set(itemId, el as HTMLElement);
      }
    });

    // Now iterate items and look up the element from the map
    this.itemStates.forEach(item => {
      const element = elementsById.get(String(item.data[this.idProperty]));

      if (element) {
        const rect = element.getBoundingClientRect();
        item.visible = (
          !this._readyItems.has(item.data[this.idProperty]) ||
          (
            rect.top + rect.height >= -this._SCROLL_BUFFER &&
            rect.top <= (_win.innerHeight || _doc.documentElement.clientHeight) + this._SCROLL_BUFFER
          )
        );

        // Only set opacity if item is visible
        if (item.visible) {
          this.renderer.setStyle(element, "opacity", "1");
        }
      }
    });
  }

  private _masonryLayoutComplete(firstIndex = 0) {
    const items = this.container.nativeElement.querySelectorAll(".masonry-item") as NodeListOf<HTMLElement>;

    Array.from(items).slice(firstIndex).forEach(item => {
      const itemId = item.getAttribute("data-masonry-id");
      const itemState = this.itemStates.find(state => state.data[this.idProperty].toString() === itemId);

      if (itemState) {
        itemState.height = item.getBoundingClientRect().height;
      }
    });

    requestAnimationFrame(() => {
      this._layoutInProgress = false;
      this._updateVisibleItems();
      this.layoutReady.emit();
    });
  }

  private _destroyMasonry() {
    if (this.masonry) {
      this.masonry.destroy();
      this.masonry = null;

      // Reset visibility states
      this.itemStates.forEach(item => {
        item.visible = true;
        item.height = undefined;
      });
    }
  }

  private _initMasonry() {
    if (!this._isBrowser || !this.MasonryModule || !this.container) {
      return;
    }

    this.masonry = new this.MasonryModule.default(this.container.nativeElement, {
      itemSelector: ".masonry-item",
      columnWidth: ".masonry-item",
      percentPosition: true,
      gutter: this.gutter,
      transitionDuration: "0"
    });

    this._layoutInProgress = true;
    this.masonry.once("layoutComplete", () => this._masonryLayoutComplete());
    this.masonry.layout();
  }

  private _reloadMasonry() {
    let currentScrollPosition: number;
    let scrollableParent: HTMLElement | Window;

    if (this.masonry) {
      if (this._isBrowser) {
        scrollableParent = UtilsService.getScrollableParent(
          this.container.nativeElement,
          this.windowRefService
        );

        if (scrollableParent) {
          if (scrollableParent === this.windowRefService.nativeWindow) {
            currentScrollPosition = this.windowRefService.nativeWindow.scrollY;
          } else {
            currentScrollPosition = (scrollableParent as HTMLElement).scrollTop;
          }
        }
      }

      this._destroyMasonry();
      this.utilsService.delay(100).subscribe(() => {
        requestAnimationFrame(() => {
          this._initMasonry();

          if (currentScrollPosition !== undefined) {
            scrollableParent.scrollTo(0, currentScrollPosition);
          }
        });
      });
    }
  }
}
