import { ChangeDetectionStrategy, Component, Input, OnChanges, TemplateRef, ViewChild } from "@angular/core";
import { ImageInterface, ImageRevisionInterface } from "@shared/interfaces/image.interface";
import { ImageService } from "@shared/services/image/image.service";
import { NgbOffcanvas } from "@ng-bootstrap/ng-bootstrap";
import { DeviceService } from "@shared/services/device.service";
import { TranslateService } from "@ngx-translate/core";
import { FormGroup } from "@angular/forms";
import { FormlyFieldConfig } from "@ngx-formly/core";
import { ImageAlias } from "@shared/enums/image-alias.enum";


enum SharingMode {
  LINK = "link",
  BBCODE = "bbcode",
  HTML = "html"
}

@Component({
  selector: "astrobin-image-viewer-share-button",
  template: `
    <button
      (click)="openShare($event)"
      class="btn btn-no-block btn-link link-secondary"
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
      </div>
    </ng-template>
  `,
  styleUrls: ["./image-viewer-share-button.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ImageViewerShareButtonComponent implements OnChanges {
  @Input()
  image: ImageInterface;

  @Input()
  revisionLabel: ImageRevisionInterface["label"];

  @ViewChild("shareTemplate")
  shareTemplate: TemplateRef<any>;

  protected revision: ImageInterface | ImageRevisionInterface;

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
    public readonly offcanvasService: NgbOffcanvas,
    public readonly deviceService: DeviceService,
    public readonly translateService: TranslateService,
    public readonly imageService: ImageService
  ) {
  }

  ngOnChanges(): void {
    this.revision = this.imageService.getRevision(this.image, this.revisionLabel);
  }

  openShare(event: MouseEvent): void {
    event.preventDefault();

    const isNativeShareSupported = typeof navigator !== 'undefined' && !!navigator.share;
    const isMobile = this.deviceService.isMobile();

    if (isNativeShareSupported && isMobile) {
      try {
        navigator.share({
          title: this.image.title,
          url: this.getSharingValue(SharingMode.LINK)
        }).catch(error => {
          console.error('Sharing failed:', error);
        })
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.error('Sharing failed:', error);
        }
      }
    } else {
      this.shareModel = {
        sharingMode: SharingMode.LINK,
        copyThis: this.getSharingValue(SharingMode.LINK)
      };

      this.offcanvasService.open(this.shareTemplate, {
        position: this.deviceService.offcanvasPosition(),
        panelClass: "image-viewer-share-offcanvas"
      });
    }
  }

  protected getSharingValue(sharingMode: SharingMode): string {
    if (!this.revision) {
      return "";
    }

    const galleryThumbnailUrl = this.revision.thumbnails.find(thumbnail => thumbnail.alias === ImageAlias.GALLERY).url;
    const url = this.imageService.getShareUrl(this.image, this.revision ? this.revisionLabel : null);

    switch (sharingMode) {
      case SharingMode.LINK:
        return url;
      case SharingMode.BBCODE:
        return `[url=${url}][img]${galleryThumbnailUrl}[/img][/url]`;
      case SharingMode.HTML:
        return `<a href="${url}"><img src="${galleryThumbnailUrl}" /></a>`;
    }
  }
}
