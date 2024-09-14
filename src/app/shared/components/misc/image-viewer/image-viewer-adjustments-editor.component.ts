import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, TemplateRef, ViewChild } from "@angular/core";
import { ImageComponent } from "@shared/components/misc/image/image.component";
import { Options } from "@angular-slider/ngx-slider";
import { DeviceService } from "@shared/services/device.service";
import { NgbOffcanvas } from "@ng-bootstrap/ng-bootstrap";
import { FormGroup } from "@angular/forms";
import { TranslateService } from "@ngx-translate/core";
import { WindowRefService } from "@shared/services/window-ref.service";
import { ImageInterface, ImageRevisionInterface } from "@shared/interfaces/image.interface";
import { ImageService } from "@shared/services/image/image.service";
import { UtilsService } from "@shared/services/utils/utils.service";
import { ActivatedRoute, Router } from "@angular/router";
import { PopNotificationsService } from "@shared/services/pop-notifications.service";

const DEFAULT_BRIGHTNESS = 100;
const DEFAULT_CONTRAST = 100;
const DEFAULT_SATURATION = 100;

@Component({
  selector: "astrobin-image-viewer-adjustment-editor",
  template: `
    <div class="d-flex justify-content-center align-items-baseline flex-nowrap gap-3">
      <div class="adjuster flex-grow-1">
        <fa-icon
          [ngbTooltip]="'Brightness' | translate"
          container="body"
          icon="sun"
        ></fa-icon>
        <ngx-slider
          [options]="brightnessSliderOptions"
          [(value)]="brightness"
          (valueChange)="applyFilters()"
        ></ngx-slider>
      </div>

      <div class="adjuster flex-grow-1">
        <fa-icon
          [ngbTooltip]="'Contrast' | translate"
          container="body"
          icon="circle-half-stroke"
        ></fa-icon>
        <ngx-slider
          [options]="contrastSliderOptions"
          [(value)]="contrast"
          (valueChange)="applyFilters()"
        ></ngx-slider>
      </div>

      <div class="adjuster flex-grow-1">
        <fa-icon
          [ngbTooltip]="'Saturation' | translate"
          container="body"
          icon="droplet"
        ></fa-icon>
        <ngx-slider
          [options]="saturationSliderOptions"
          [(value)]="saturation"
          (valueChange)="applyFilters()"
        ></ngx-slider>
      </div>

      <div class="d-flex flex-nowrap">
        <button
          class="btn btn-link text-light m-0"
          (click)="reset()"
          astrobinEventPreventDefault
        >
          <fa-icon icon="undo"></fa-icon>
        </button>

        <button
          class="btn btn-link text-light m-0"
          (click)="share()"
          astrobinEventPreventDefault
        >
          <fa-icon icon="share"></fa-icon>
        </button>

        <button
          class="btn btn-link text-light m-0"
          (click)="close()"
          astrobinEventPreventDefault
        >
          <fa-icon icon="times-circle"></fa-icon>
        </button>
      </div>
    </div>

    <ng-template #shareOffcanvasTemplate let-offcanvas>
      <div class="offcanvas-header">
        <h5 class="offcanvas-title">{{ "Share" | translate }}</h5>
        <button
          type="button"
          class="btn-close text-reset"
          (click)="offcanvas.close()"
          aria-label="Close"
        ></button>
      </div>
      <div class="offcanvas-body">
        <p class="alert alert-dark mb-5">
          <fa-icon icon="info-circle"></fa-icon>
          {{
            "These settings do not really the image, but only the way it is displayed in your browser. You " +
            "can share a link to this page with these settings applied." | translate
          }}
        </p>

        <form [formGroup]="shareForm">
          <formly-form [form]="shareForm" [fields]="shareFields" [model]="shareModel"></formly-form>
        </form>
      </div>
    </ng-template>
  `,
  styleUrls: ["./image-viewer-adjustments-editor.component.scss"]
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

  protected brightness: number;
  protected contrast: number;
  protected saturation: number;

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
    public readonly router: Router
  ) {
  }

  ngOnInit() {
    if (
      this.activatedRoute.snapshot.queryParams.brightness ||
      this.activatedRoute.snapshot.queryParams.contrast ||
      this.activatedRoute.snapshot.queryParams.saturation
    ) {
      try {
        this.brightness = parseInt(this.activatedRoute.snapshot.queryParams.brightness || DEFAULT_BRIGHTNESS, 10);
        this.contrast = parseInt(this.activatedRoute.snapshot.queryParams.contrast || DEFAULT_CONTRAST, 10);
        this.saturation = parseInt(this.activatedRoute.snapshot.queryParams.saturation || DEFAULT_SATURATION, 10);
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

    this.shareModel = {
      shareUrl: url
    };

    this.imageComponent.elementRef.nativeElement.style.filter =
      `brightness(${this.brightness}%) ` +
      `contrast(${this.contrast}%) ` +
      `saturate(${this.saturation}%)`;
  }

  reset() {
    this.brightness = DEFAULT_BRIGHTNESS;
    this.contrast = DEFAULT_CONTRAST;
    this.saturation = DEFAULT_SATURATION;

    this.removeQueryParams();
    this.shareModel = {
      shareUrl: this.imageService.getShareUrl(this.image, this.revisionLabel)
    };

    this.applyFilters();
  }

  share() {
    this.offcanvasService.open(this.shareOffcanvasTemplate, {
      position: this.deviceService.offcanvasPosition()
    });
  }

  removeQueryParams() {
    const queryParams = { ...this.activatedRoute.snapshot.queryParams };

    for (const paramKey of ["brightness", "contrast", "saturation"]) {
      delete queryParams[paramKey];
    }

    this.router.navigate([], {
      relativeTo: this.activatedRoute,
      queryParams: queryParams
    });
  }
}
