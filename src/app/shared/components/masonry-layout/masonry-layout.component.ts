import { AfterViewInit, ChangeDetectorRef, Component, ContentChild, ElementRef, Inject, Input, OnDestroy, PLATFORM_ID, Renderer2, TemplateRef, ViewChild } from "@angular/core";
import { Subject } from "rxjs";
import { WindowRefService } from "@shared/services/window-ref.service";
import { isPlatformBrowser } from "@angular/common";
import { UtilsService } from "@shared/services/utils/utils.service";

interface MasonryItem<T> {
  data: T;
  visible: boolean;
}

@Component({
  selector: "astrobin-masonry-layout",
  template: `
    <div
      #container
      class="masonry-container"
      [class.ready]="!!containerWidth && !!layout"
      [class.small]="layout === 'small'"
      [class.medium]="layout === 'medium'"
      [class.large]="layout === 'large'"
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
        [class.aspect-narrow]="item['w'] && item['h'] && item['w'] / item['h'] < 0.8"
        [class.aspect-square]="item['w'] && item['h'] && item['w'] / item['h'] >= 0.8 && item['w'] / item['h'] <= 1.2"
        [class.aspect-wide]="item['w'] && item['h'] && item['w'] / item['h'] > 1.2"
        [class.aspect-panoramic]="item['w'] && item['h'] && item['w'] / item['h'] > 2"
      >
        <div class="masonry-content">
          <ng-container
            [ngTemplateOutlet]="itemTemplate"
            [ngTemplateOutletContext]="getTemplateContext(item)"
          >
          </ng-container>
        </div>
      </div>

      <div *ngIf="leftAlignLastRow" class="masonry-spacer"></div>
    </div>
  `,
  styleUrls: [`./masonry-layout.component.scss`]
})
export class MasonryLayoutComponent<T> implements AfterViewInit, OnDestroy {
  @Input() items: T[] = [];
  @Input() layout: "small" | "medium" | "large" | null = null;
  @Input() idProperty = "id";
  @Input() leftAlignLastRow = true;

  @ViewChild("container") container!: ElementRef;

  @ContentChild(TemplateRef) itemTemplate!: TemplateRef<{
    $implicit: T;
  }>;

  protected itemStates: MasonryItem<T>[] = [];
  protected containerWidth = 0;

  private readonly _isBrowser: boolean;
  private _destroyed$ = new Subject<void>();
  private _resizeObserver: ResizeObserver | null = null;

  constructor(
    public readonly windowRefService: WindowRefService,
    @Inject(PLATFORM_ID) public readonly platformId: Object,
    public readonly renderer: Renderer2,
    public readonly utilsService: UtilsService,
    public readonly changeDetectorRef: ChangeDetectorRef
  ) {
    this._isBrowser = isPlatformBrowser(platformId);
  }

  ngAfterViewInit() {
    if (this._isBrowser && this.container) {
      requestAnimationFrame(() => {
        if (this.container) {
          this.containerWidth = this.container.nativeElement.offsetWidth;
          this.changeDetectorRef.markForCheck();

          this._resizeObserver = new ResizeObserver(entries => {
            this.containerWidth = entries[0].contentRect.width;
            this.changeDetectorRef.markForCheck();
          });

          this._resizeObserver.observe(this.container.nativeElement);
        }
      });
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
