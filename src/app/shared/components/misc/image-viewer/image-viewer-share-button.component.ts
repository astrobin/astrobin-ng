import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnChanges, OnDestroy, TemplateRef, ViewChild } from "@angular/core";
import { ImageInterface, ImageRevisionInterface } from "@core/interfaces/image.interface";
import { ImageService } from "@core/services/image/image.service";
import { NgbOffcanvas } from "@ng-bootstrap/ng-bootstrap";
import { DeviceService } from "@core/services/device.service";
import { TranslateService } from "@ngx-translate/core";
import { FormGroup } from "@angular/forms";
import { FormlyFieldConfig } from "@ngx-formly/core";
import { ImageAlias } from "@core/enums/image-alias.enum";
import { WindowRefService } from "@core/services/window-ref.service";
import { PopNotificationsService } from "@core/services/pop-notifications.service";
import { UtilsService } from "@core/services/utils/utils.service";
import { takeUntil } from "rxjs/operators";
import { Subject } from "rxjs";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { Store } from "@ngrx/store";
import { MainState } from "@app/store/state";

enum SharingMode {
  LINK = "link",
  BBCODE = "bbcode",
  HTML = "html"
}

enum ThumbnailSize {
  SMALL = "small",
  MEDIUM = "medium",
  LARGE = "large"
}

@Component({
  selector: "astrobin-image-viewer-share-button",
  template: `
    <button
      (click)="openShare($event)"
      class="btn btn-no-block btn-link link-secondary open-share"
    >
      <fa-icon
        [ngbTooltip]="'Share' | translate"
        triggers="hover click"
        class="m-0"
        container="body"
        icon="share"
      ></fa-icon>
    </button>

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

        <button class="btn btn-secondary mt-3" (click)="copyShareModelCode()">{{ copyButtonLabel }}</button>

        <ng-container *ngIf="currentUser$ | async as currentUser">
          <div *ngIf="currentUser?.id === image.user" class="mt-5">
            <label>
              {{ "Grab direct image links" | translate }}
              <astrobin-private-information class="d-inline-block ms-2"></astrobin-private-information>
            </label>

            <p class="small">
              {{ "If embedding direct links to images hosted on the AstroBin servers, kindly provide a link to AstroBin." | translate }}
            </p>

            <ul class="mt-3">
              <li>
                <span>{{ "Thumbnail" | translate }}</span>
                <fa-icon
                  *ngIf="smallThumbnail; else thumbnailNotAvailableTemplate"
                  (click)="copyDirectLink(smallThumbnail)"
                  icon="copy"
                  class="ms-2"
                ></fa-icon>
              </li>
              <li>
                <span>{{ "Medium" | translate }}</span>
                <fa-icon
                  *ngIf="mediumThumbnail; else thumbnailNotAvailableTemplate"
                  (click)="copyDirectLink(mediumThumbnail)"
                  icon="copy"
                  class="ms-2"
                ></fa-icon>
              </li>
              <li>
                <span>{{ "Large" | translate }}</span>
                <fa-icon
                  *ngIf="largeThumbnail; else thumbnailNotAvailableTemplate"
                  (click)="copyDirectLink(largeThumbnail)"
                  icon="copy"
                  class="ms-2"
                ></fa-icon>
              </li>
              <li>
                <span>{{ "Extra-large" | translate }}</span>
                <fa-icon
                  *ngIf="extraLargeThumbnail; else thumbnailNotAvailableTemplate"
                  (click)="copyDirectLink(extraLargeThumbnail)"
                  icon="copy"
                  class="ms-2"
                ></fa-icon>
              </li>
            </ul>
          </div>
        </ng-container>
      </div>
    </ng-template>

    <ng-template #thumbnailNotAvailableTemplate>
      <span class="d-inline-block ms-2">{{ "n/a" | translate }}</span>
    </ng-template>
  `,
  styleUrls: ["./image-viewer-share-button.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ImageViewerShareButtonComponent extends BaseComponentDirective implements OnChanges, OnDestroy {
  @Input()
  image: ImageInterface;

  @Input()
  revisionLabel: ImageRevisionInterface["label"];

  @ViewChild("shareTemplate")
  shareTemplate: TemplateRef<any>;

  protected revision: ImageInterface | ImageRevisionInterface;
  protected formDestroyed$ = new Subject<void>();
  protected readonly shareForm: FormGroup = new FormGroup({});

  protected shareModel: {
    sharingMode: SharingMode;
    thumbnailSize?: ThumbnailSize;
    code: string;
  } = {
    sharingMode: SharingMode.LINK,
    code: ""
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
          field.formControl.valueChanges
            .pipe(takeUntil(this.formDestroyed$))
            .subscribe(value => {
              this.shareModel = {
                ...this.shareModel,
                code: this.getSharingValue(value, this.shareModel.thumbnailSize)
              };
              this.changeDetectorRef.markForCheck();
            });
        }
      }
    },
    {
      key: "thumbnailSize",
      type: "ng-select",
      wrappers: ["default-wrapper"],
      defaultValue: ThumbnailSize.SMALL,
      expressions: {
        hide: () => this.shareModel.sharingMode === SharingMode.LINK
      },
      props: {
        label: this.translateService.instant("Thumbnail size"),
        options: [
          { value: ThumbnailSize.SMALL, label: this.translateService.instant("Small") },
          { value: ThumbnailSize.MEDIUM, label: this.translateService.instant("Medium") },
          { value: ThumbnailSize.LARGE, label: this.translateService.instant("Large") }
        ],
        searchable: false,
        clearable: false
      },
      hooks: {
        onInit: field => {
          field.formControl.valueChanges
            .pipe(takeUntil(this.formDestroyed$))
            .subscribe(value => {
              this.shareModel = {
                ...this.shareModel,
                code: this.getSharingValue(this.shareModel.sharingMode, value)
              };
              this.changeDetectorRef.markForCheck();
            });
        }
      }
    },
    {
      key: "code",
      type: "textarea",
      wrappers: ["default-wrapper"],
      defaultValue: this.getSharingValue(SharingMode.LINK),
      props: {
        label: this.translateService.instant("Code"),
        rows: 5,
        readonly: true
      }
    }
  ];

  protected copyButtonLabel = this.translateService.instant("Copy");

  protected smallThumbnail: string;
  protected mediumThumbnail: string;
  protected largeThumbnail: string;
  protected extraLargeThumbnail: string;

  constructor(
    public readonly store$: Store<MainState>,
    public readonly offcanvasService: NgbOffcanvas,
    public readonly deviceService: DeviceService,
    public readonly translateService: TranslateService,
    public readonly imageService: ImageService,
    public readonly windowRefService: WindowRefService,
    public readonly popNotificationsService: PopNotificationsService,
    public readonly utilsService: UtilsService,
    public readonly changeDetectorRef: ChangeDetectorRef
  ) {
    super(store$);
  }

  ngOnChanges(): void {
    this.revision = this.imageService.getRevision(this.image, this.revisionLabel);

    if (!this.revision || !this.revision.thumbnails) {
      return;
    }

    this.smallThumbnail = this.revision.thumbnails.find(thumb => thumb.alias === ImageAlias.GALLERY)?.url;
    this.mediumThumbnail = this.revision.thumbnails.find(thumb => thumb.alias === ImageAlias.REGULAR)?.url;
    this.largeThumbnail = this.revision.thumbnails.find(thumb => thumb.alias === ImageAlias.HD)?.url;
    this.extraLargeThumbnail = this.revision.thumbnails.find(thumb => thumb.alias === ImageAlias.QHD)?.url;
  }

  openShare(event: MouseEvent): void {
    event.preventDefault();

    const isNativeShareSupported = typeof navigator !== "undefined" && !!navigator.share;
    const isMobile = this.deviceService.isMobile();

    if (isNativeShareSupported && isMobile) {
      try {
        navigator.share({
          title: this.image.title,
          url: this.getSharingValue(SharingMode.LINK)
        }).catch(error => {
          console.error("Sharing failed:", error);
        });
      } catch (error) {
        if (error.name !== "AbortError") {
          console.error("Sharing failed:", error);
        }
      }
    } else {
      // Clean up previous form subscriptions
      this.formDestroyed$.next();
      this.formDestroyed$.complete();
      this.formDestroyed$ = new Subject<void>();

      // Reset the form and model when opening
      this.shareForm.reset();
      this.shareModel = {
        sharingMode: SharingMode.LINK,
        code: this.getSharingValue(SharingMode.LINK)
      };

      this.offcanvasService.open(this.shareTemplate, {
        position: this.deviceService.offcanvasPosition(),
        panelClass: "image-viewer-offcanvas image-viewer-share-offcanvas",
        backdropClass: "image-viewer-offcanvas-backdrop"
      });
    }
  }

  ngOnDestroy() {
    this.formDestroyed$.next();
    this.formDestroyed$.complete();
  }

  protected getSharingValue(sharingMode: SharingMode, thumbnailSize?: ThumbnailSize): string {
    if (!this.revision) {
      return "";
    }

    const url = this.imageService.getShareUrl(this.image, this.revision ? this.revisionLabel : null);

    if (sharingMode === SharingMode.LINK) {
      return url;
    }

    let alias: ImageAlias;

    if (thumbnailSize === ThumbnailSize.SMALL) {
      alias = ImageAlias.GALLERY;
    } else if (thumbnailSize === ThumbnailSize.MEDIUM) {
      alias = ImageAlias.REGULAR;
    } else if (thumbnailSize === ThumbnailSize.LARGE) {
      alias = ImageAlias.HD;
    }

    const galleryThumbnailUrl = this.revision.thumbnails.find(thumbnail => thumbnail.alias === alias).url;

    switch (sharingMode) {
      case SharingMode.BBCODE:
        return `[url=${url}][img]${galleryThumbnailUrl}[/img][/url]`;
      case SharingMode.HTML:
        return `<a href="${url}"><img src="${galleryThumbnailUrl}" /></a>`;
      default:
        return url;
    }
  }

  protected async copyShareModelCode() {
    const result: boolean = await this.windowRefService.copyToClipboard(this.shareModel.code);

    if (!result) {
      this.popNotificationsService.error(this.translateService.instant("Failed to copy link to clipboard."));
      return;
    }

    this.copyButtonLabel = this.translateService.instant("Copied!");
    this.changeDetectorRef.markForCheck();

    this.utilsService.delay(2000).subscribe(() => {
      this.copyButtonLabel = this.translateService.instant("Copy");
      this.changeDetectorRef.markForCheck();
    });
  }

  protected async copyDirectLink(value: string) {
    const result: boolean = await this.windowRefService.copyToClipboard(value);

    if (result) {
      this.popNotificationsService.info(this.translateService.instant("Copied!"));
    } else {
      this.popNotificationsService.error(this.translateService.instant("Failed to copy link to clipboard."));
    }
  }
}
