import { Component, Inject, Input, PLATFORM_ID, TemplateRef, ViewChild } from "@angular/core";
import { ImageInterface, ImageRevisionInterface } from "@shared/interfaces/image.interface";
import { ClassicRoutesService } from "@shared/services/classic-routes.service";
import { ImageService } from "@shared/services/image/image.service";
import { ImageViewerSectionBaseComponent } from "@shared/components/misc/image-viewer/image-viewer-section-base.component";
import { select, Store } from "@ngrx/store";
import { MainState } from "@app/store/state";
import { SearchService } from "@features/search/services/search.service";
import { Router } from "@angular/router";
import { ImageViewerService } from "@shared/services/image-viewer.service";
import { ContentTypeInterface } from "@shared/interfaces/content-type.interface";
import { NgbOffcanvas } from "@ng-bootstrap/ng-bootstrap";
import { DeviceService } from "@shared/services/device.service";
import { WindowRefService } from "@shared/services/window-ref.service";
import { filter, take } from "rxjs/operators";
import { TranslateService } from "@ngx-translate/core";
import { selectContentType } from "@app/store/selectors/app/content-type.selectors";
import { LoadContentType } from "@app/store/actions/content-type.actions";
import { FormGroup } from "@angular/forms";
import { FormlyFieldConfig } from "@ngx-formly/core";
import { ImageAlias } from "@shared/enums/image-alias.enum";
import { isPlatformBrowser } from "@angular/common";
import { UtilsService } from "@shared/services/utils/utils.service";


@Component({
  selector: "astrobin-image-viewer-social-buttons",
  template: `
    <ng-container *ngIf="currentUserWrapper$ | async as currentUserWrapper">
      <div class="social-buttons d-flex gap-2 align-items-center">
        <ng-container *ngIf="imageContentType && currentUserWrapper$ | async as currentUserWrapper">
          <div *ngIf="showLike" class="like">
            <astrobin-toggle-property
              [contentType]="imageContentType.id"
              [disabled]="currentUserWrapper.user?.id === image.user"
              [objectId]="image.pk"
              [showLabel]="false"
              [userId]="currentUserWrapper.user?.id"
              [count]="image.likeCount"
              class="btn-no-block"
              btnClass="btn btn-no-block {{ btnExtraClasses }}"
              propertyType="like"
            ></astrobin-toggle-property>
          </div>

          <div *ngIf="showBookmark" class="bookmark">
            <astrobin-toggle-property
              [contentType]="imageContentType.id"
              [objectId]="image.pk"
              [userId]="currentUserWrapper.user?.id"
              [showLabel]="false"
              [count]="image.bookmarkCount"
              class="btn-no-block"
              btnClass="btn btn-no-block {{ btnExtraClasses }}"
              propertyType="bookmark"
            ></astrobin-toggle-property>
          </div>

          <div *ngIf="image.allowComments && showComments" class="comment">
            <button
              (click)="scrollToComments($event)"
              class="btn btn-no-block {{ btnExtraClasses }}"
            >
              <fa-icon
                [ngbTooltip]="'Comments' | translate"
                triggers="hover click"
                container="body"
                icon="comments"
              ></fa-icon>

              <span class="count">
                <astrobin-nested-comments-count
                  [contentType]="imageContentType"
                  [objectId]="image.pk"
                ></astrobin-nested-comments-count>
              </span>
            </button>
          </div>

          <div *ngIf="showShare" class="share">
            <astrobin-image-viewer-share-button
              [image]="image"
              [revisionLabel]="revisionLabel"
            ></astrobin-image-viewer-share-button>
          </div>
        </ng-container>
      </div>
    </ng-container>
  `,
  styleUrls: ["./image-viewer-social-buttons.component.scss"]
})
export class ImageViewerSocialButtonsComponent extends ImageViewerSectionBaseComponent {
  @Input()
  image: ImageInterface;

  @Input()
  revision: ImageInterface | ImageRevisionInterface;

  @Input() showLike = true;
  @Input() showBookmark = true;
  @Input() showComments = true;
  @Input() showShare = true;
  @Input() btnExtraClasses = ""

  @ViewChild("shareTemplate")
  shareTemplate: TemplateRef<any>;

  protected imageContentType: ContentTypeInterface;

  constructor(
    public readonly store$: Store<MainState>,
    public readonly searchService: SearchService,
    public readonly router: Router,
    public readonly imageViewerService: ImageViewerService,
    public readonly classicRoutesService: ClassicRoutesService,
    public readonly imageService: ImageService,
    public readonly offcanvasService: NgbOffcanvas,
    public readonly deviceService: DeviceService,
    public readonly windowRefService: WindowRefService,
    public readonly translateService: TranslateService,
    @Inject(PLATFORM_ID) public readonly platformId: Object,
    public readonly utilsService: UtilsService
  ) {
    super(store$, searchService, router, imageViewerService, windowRefService);

    this.store$.pipe(
      select(selectContentType, { appLabel: "astrobin", model: "image" }),
      filter(contentType => !!contentType),
      take(1)
    ).subscribe(contentType => {
      this.imageContentType = contentType;
    });

    this.store$.dispatch(new LoadContentType({
      appLabel: "astrobin",
      model: "image"
    }));
  }

  protected scrollToComments(event: MouseEvent) {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const nativeWindow = this.windowRefService.nativeWindow;
    const document = nativeWindow.document;

    const adManagerElement: HTMLElement | null = document.querySelector(
      "astrobin-image-viewer .data-area astrobin-ad-manager"
    );

    const floatingTitleElement: HTMLElement | null = document.querySelector(
      "astrobin-image-viewer astrobin-image-viewer-floating-title"
    );

    let offsetHeight = 0;

    if (adManagerElement) {
      const computedStyle = nativeWindow.getComputedStyle(adManagerElement);
      if (computedStyle.position === "sticky" || computedStyle.position === "fixed") {
        offsetHeight += adManagerElement.offsetHeight;
      }
    }

    if (floatingTitleElement) {
      offsetHeight += floatingTitleElement.offsetHeight;
    }

    const commentsSection: HTMLElement | null = document.getElementById("image-viewer-comments-header");
    const scrollArea: HTMLElement | null = this._getScrollArea();

    if (commentsSection && scrollArea) {
      // Calculate the position of commentsSection relative to scrollArea
      const commentsRect = commentsSection.getBoundingClientRect();
      const scrollAreaRect = scrollArea.getBoundingClientRect();
      const offset = commentsRect.top - scrollAreaRect.top + scrollArea.scrollTop - offsetHeight - 10;

      scrollArea.scrollTo({
        top: offset,
        behavior: "smooth"
      });
    }
  }

  private _getScrollArea(): HTMLElement {
    let scrollArea: HTMLElement;

    const windowWidth = this.windowRefService.nativeWindow.innerWidth;
    const windowHeight = this.windowRefService.nativeWindow.innerHeight;
    const viewPortAspectRatio = windowWidth / windowHeight;
    const sideToSideLayout = this.deviceService.lgMin() || viewPortAspectRatio > 1;

    if (sideToSideLayout) {
      scrollArea = this.windowRefService.nativeWindow.document.querySelector(
        "astrobin-image-viewer > .main-area > .data-area-container > .data-area"
      );
    } else {
      scrollArea = this.windowRefService.nativeWindow.document.querySelector("astrobin-image-viewer > .main-area");
    }

    return scrollArea;
  }
}
