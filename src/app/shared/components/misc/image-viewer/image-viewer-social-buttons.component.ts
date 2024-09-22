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


enum SharingMode {
  LINK = "link",
  BBCODE = "bbcode",
  HTML = "html"
}

@Component({
  selector: "astrobin-image-viewer-social-buttons",
  template: `
    <ng-container *ngIf="currentUserWrapper$ | async as currentUserWrapper">
      <div class="social-buttons d-flex gap-2 align-items-start">
        <ng-container *ngIf="imageContentType && currentUserWrapper$ | async as currentUserWrapper">
          <div class="like">
            <astrobin-toggle-property
              [contentType]="imageContentType.id"
              [disabled]="currentUserWrapper.user?.id === image.user"
              [objectId]="image.pk"
              [showLabel]="false"
              [userId]="currentUserWrapper.user?.id"
              [count]="image.likeCount"
              class="btn-no-block"
              btnClass="btn btn-sm btn-no-block"
              propertyType="like"
            ></astrobin-toggle-property>
          </div>

          <div class="bookmark">
            <astrobin-toggle-property
              [contentType]="imageContentType.id"
              [objectId]="image.pk"
              [userId]="currentUserWrapper.user?.id"
              [showLabel]="false"
              [count]="image.bookmarkCount"
              class="btn-no-block"
              btnClass="btn btn-sm btn-no-block"
              propertyType="bookmark"
            ></astrobin-toggle-property>
          </div>

          <div *ngIf="image.allowComments" class="comment">
            <button
              (click)="scrollToComments($event)"
              class="btn btn-sm btn-no-block"
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

          <div class="share">
            <button
              (click)="openShare($event)"
              class="btn btn-sm btn-no-block"
            >
              <fa-icon
                [ngbTooltip]="'Share' | translate"
                triggers="hover click"
                container="body"
                icon="share"
              ></fa-icon>
            </button>
          </div>
        </ng-container>
      </div>
    </ng-container>

    <ng-template #shareTemplate let-offcanvas>
      <div class="offcanvas-header">
        <h5 class="offcanvas-title">{{ 'Share' | translate }}</h5>
        <button
          type="button"
          class="btn-close"
          (click)="offcanvas.dismiss()"
          aria-label="Close"
        ></button>
      </div>
      <div class="offcanvas-body">
        <form>
          <formly-form
            [form]="shareForm"
            [fields]="shareFields"
            [model]="shareModel"
          ></formly-form>
        </form>
      </div>
    </ng-template>
  `,
  styleUrls: ["./image-viewer-social-buttons.component.scss"]
})
export class ImageViewerSocialButtonsComponent extends ImageViewerSectionBaseComponent {
  @Input()
  image: ImageInterface;

  @Input()
  revision: ImageInterface | ImageRevisionInterface;

  @ViewChild("shareTemplate")
  shareTemplate: TemplateRef<any>;

  protected imageContentType: ContentTypeInterface;
  protected readonly shareForm: FormGroup = new FormGroup({});
  protected shareModel: {
    sharingMode: SharingMode;
    copyThis: string;
  } = {
    sharingMode: SharingMode.LINK,
    copyThis: ""
  };
  protected readonly shareFields: FormlyFieldConfig[] = [
    {
      key: "sharingMode",
      type: "ng-select",
      wrappers: ["default-wrapper"],
      defaultValue: SharingMode.LINK,
      props: {
        label: this.translateService.instant("Sharing mode"),
        options: [
          { value: SharingMode.LINK, label: this.translateService.instant("Simple link") },
          { value: SharingMode.BBCODE, label: this.translateService.instant("Forums (BBCode)") },
          { value: SharingMode.HTML, label: this.translateService.instant("HTML") }
        ],
        searchable: false,
        clearable: false
      },
      hooks: {
        onInit: field => {
          field.formControl.valueChanges.subscribe(() => {
            this.shareModel = {
              ...this.shareModel,
              copyThis: this.getSharingValue(this.shareModel.sharingMode)
            };
          });
        }
      }
    },
    {
      key: "copyThis",
      type: "textarea",
      wrappers: ["default-wrapper"],
      defaultValue: this.getSharingValue(SharingMode.LINK),
      props: {
        label: this.translateService.instant("Copy this"),
        rows: 5,
        readonly: true
      }
    }
  ];

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

  openShare(event: MouseEvent): void {
    event.preventDefault();

    this.shareModel = {
      sharingMode: SharingMode.LINK,
      copyThis: this.getSharingValue(SharingMode.LINK)
    };

    this.offcanvasService.open(this.shareTemplate, {
      position: this.deviceService.offcanvasPosition(),
      panelClass: "image-viewer-share-offcanvas"
    });
  }

  protected getSharingValue(sharingMode: SharingMode): string {
    if (!this.revision) {
      return "";
    }

    const galleryThumbnailUrl = this.revision.thumbnails.find(thumbnail => thumbnail.alias === ImageAlias.GALLERY).url;
    const url = this.imageService.getShareUrl(this.image, this.revisionLabel);

    switch (sharingMode) {
      case SharingMode.LINK:
        return url;
      case SharingMode.BBCODE:
        return `[url=${url}][img]${galleryThumbnailUrl}[/img][/url]`;
      case SharingMode.HTML:
        return `<a href="${url}"><img src="${galleryThumbnailUrl}" /></a>`;
    }
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
