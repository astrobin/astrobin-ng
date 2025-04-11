import { isPlatformBrowser } from "@angular/common";
import {
  OnDestroy,
  OnInit,
  TemplateRef,
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Inject,
  Input,
  Output,
  PLATFORM_ID,
  ViewChild
} from "@angular/core";
import { FormGroup } from "@angular/forms";
import { ActivatedRoute } from "@angular/router";
import { Options } from "@angular-slider/ngx-slider";
import { ImageInterface, ImageRevisionInterface } from "@core/interfaces/image.interface";
import { DeviceService } from "@core/services/device.service";
import { ImageService } from "@core/services/image/image.service";
import { PopNotificationsService } from "@core/services/pop-notifications.service";
import { UtilsService } from "@core/services/utils/utils.service";
import { WindowRefService } from "@core/services/window-ref.service";
import { NgbOffcanvas } from "@ng-bootstrap/ng-bootstrap";
import { TranslateService } from "@ngx-translate/core";
import { ImageComponent } from "@shared/components/misc/image/image.component";

const DEFAULT_BRIGHTNESS = 100;
const DEFAULT_CONTRAST = 100;
const DEFAULT_SATURATION = 100;
const DEFAULT_INVERT = 0;

@Component({
  selector: "astrobin-image-viewer-adjustment-editor",
  template: `
    <div class="d-flex justify-content-center align-items-baseline flex-nowrap gap-3">
      <div class="adjuster flex-grow-1">
        <fa-icon [ngbTooltip]="'Brightness' | translate" container="body" icon="sun"></fa-icon>
        <ngx-slider
          [options]="brightnessSliderOptions"
          (valueChange)="applyFilters()"
          [(value)]="brightness"
        ></ngx-slider>
      </div>

      <div class="adjuster flex-grow-1">
        <fa-icon [ngbTooltip]="'Contrast' | translate" container="body" icon="circle-half-stroke"></fa-icon>
        <ngx-slider [options]="contrastSliderOptions" (valueChange)="applyFilters()" [(value)]="contrast"></ngx-slider>
      </div>

      <div class="adjuster flex-grow-1">
        <fa-icon [ngbTooltip]="'Saturation' | translate" container="body" icon="droplet"></fa-icon>
        <ngx-slider
          [options]="saturationSliderOptions"
          (valueChange)="applyFilters()"
          [(value)]="saturation"
        ></ngx-slider>
      </div>

      <div class="adjuster">
        <fa-icon [class.active]="invert === 1" (click)="invertImage()" class="invert" icon="repeat"></fa-icon>
      </div>

      <div class="d-flex flex-nowrap">
        <button (click)="reset()" class="btn btn-link text-light m-0" astrobinEventPreventDefault>
          <fa-icon icon="undo"></fa-icon>
        </button>

        <button (click)="share()" class="btn btn-link text-light m-0" astrobinEventPreventDefault>
          <fa-icon icon="share"></fa-icon>
        </button>

        <button (click)="close()" class="btn btn-link text-light m-0" astrobinEventPreventDefault>
          <fa-icon icon="times-circle"></fa-icon>
        </button>
      </div>
    </div>

    <ng-template #shareOffcanvasTemplate let-offcanvas>
      <div class="offcanvas-header">
        <h5 class="offcanvas-title">{{ "Share" | translate }}</h5>
        <button (click)="offcanvas.close()" class="btn-close text-reset" aria-label="Close" type="button"></button>
      </div>
      <div class="offcanvas-body">
        <p class="alert alert-dark mb-5">
          <fa-icon icon="info-circle"></fa-icon>
          {{
            "These settings do not really alter the image, but only the way it is displayed in your browser. You " +
              "can share a link to this page with these settings applied." | translate
          }}
        </p>

        <form [formGroup]="shareForm">
          <formly-form [fields]="shareFields" [form]="shareForm" [model]="shareModel"></formly-form>
        </form>
      </div>
    </ng-template>
  `,
  styleUrls: ["./image-viewer-adjustments-editor.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ImageViewerAdjustmentsEditorComponent implements OnInit, OnDestroy {
  @Input() image: ImageInterface;
  @Input() revisionLabel: ImageRevisionInterface["label"];
  @Input() imageComponent: ImageComponent;

  @Output() closeClick = new EventEmitter<void>();

  @ViewChild("shareOffcanvasTemplate")
  shareOffcanvasTemplate: TemplateRef<any>;

  protected readonly commonSliderOptions: Options = {
    floor: 0,
    step: 1,
    showTicks: false,
    showTicksValues: false,
    hideLimitLabels: true,
    translate: (value: number): string => {
      return value + "%";
    }
  };

  protected readonly brightnessSliderOptions: Options = {
    ...this.commonSliderOptions,
    ceil: 400
  };

  protected readonly contrastSliderOptions: Options = {
    ...this.commonSliderOptions,
    ceil: 200
  };

  protected readonly saturationSliderOptions: Options = {
    ...this.commonSliderOptions,
    ceil: 200
  };

  protected readonly isBrowser: boolean;

  protected brightness: number;
  protected contrast: number;
  protected saturation: number;
  protected invert: number;

  protected readonly shareForm = new FormGroup({});
  protected shareModel = {};
  protected shareFields = [];

  constructor(
    public readonly offcanvasService: NgbOffcanvas,
    public readonly deviceService: DeviceService,
    public readonly translateService: TranslateService,
    public readonly windowRefService: WindowRefService,
    public readonly imageService: ImageService,
    public readonly activatedRoute: ActivatedRoute,
    public readonly popNotificationService: PopNotificationsService,
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngOnInit() {
    if (
      this.activatedRoute.snapshot.queryParams.brightness ||
      this.activatedRoute.snapshot.queryParams.contrast ||
      this.activatedRoute.snapshot.queryParams.saturation ||
      this.activatedRoute.snapshot.queryParams.invert
    ) {
      try {
        this.brightness = parseInt(this.activatedRoute.snapshot.queryParams.brightness || DEFAULT_BRIGHTNESS, 10);
        this.contrast = parseInt(this.activatedRoute.snapshot.queryParams.contrast || DEFAULT_CONTRAST, 10);
        this.saturation = parseInt(this.activatedRoute.snapshot.queryParams.saturation || DEFAULT_SATURATION, 10);
        this.invert = parseInt(this.activatedRoute.snapshot.queryParams.invert || DEFAULT_INVERT, 10);
        this.applyFilters();
      } catch (e) {
        this.popNotificationService.error(
          this.translateService.instant("Invalid URL parameters for image adjustments.")
        );
        this.reset();
      }
    } else {
      this.reset();
    }

    this.shareFields = [
      {
        key: "shareUrl",
        type: "textarea",
        templateOptions: {
          label: this.translateService.instant("Copy this"),
          readonly: true,
          rows: 3
        }
      }
    ];
  }

  ngOnDestroy() {
    this.reset();
  }

  close() {
    this.reset();
    this.closeClick.emit();
  }

  invertImage() {
    if (this.invert === 0) {
      this.invert = 1;
    } else {
      this.invert = 0;
    }

    this.applyFilters();
  }

  applyFilters() {
    let url = this.imageService.getShareUrl(this.image, this.revisionLabel);

    if (this.brightness !== DEFAULT_BRIGHTNESS) {
      url = UtilsService.addOrUpdateUrlParam(url, "brightness", this.brightness.toString());
    }

    if (this.contrast !== DEFAULT_CONTRAST) {
      url = UtilsService.addOrUpdateUrlParam(url, "contrast", this.contrast.toString());
    }

    if (this.saturation !== DEFAULT_SATURATION) {
      url = UtilsService.addOrUpdateUrlParam(url, "saturation", this.saturation.toString());
    }

    if (this.invert !== DEFAULT_INVERT) {
      url = UtilsService.addOrUpdateUrlParam(url, "invert", this.invert.toString());
    }

    this.shareModel = {
      shareUrl: url
    };

    if (this.imageComponent) {
      this.imageComponent.elementRef.nativeElement.style.filter =
        `brightness(${this.brightness}%) ` +
        `contrast(${this.contrast}%) ` +
        `saturate(${this.saturation}%)` +
        `invert(${this.invert})`;
    }
  }

  reset() {
    this.brightness = DEFAULT_BRIGHTNESS;
    this.contrast = DEFAULT_CONTRAST;
    this.saturation = DEFAULT_SATURATION;
    this.invert = DEFAULT_INVERT;

    this.removeQueryParams();
    this.shareModel = {
      shareUrl: this.imageService.getShareUrl(this.image, this.revisionLabel)
    };

    this.applyFilters();
  }

  share() {
    this.offcanvasService.open(this.shareOffcanvasTemplate, {
      panelClass: "image-viewer-offcanvas",
      backdropClass: "image-viewer-offcanvas-backdrop",
      position: this.deviceService.offcanvasPosition()
    });
  }

  removeQueryParams() {
    if (!this.isBrowser) {
      return;
    }

    const url = new URL(window.location.href);

    // Remove the specified parameters
    ["brightness", "contrast", "saturation", "invert"].forEach(param => {
      url.searchParams.delete(param);
    });

    // Replace the current URL without triggering navigation
    this.windowRefService.nativeWindow.history.replaceState({}, "", url);
  }
}
