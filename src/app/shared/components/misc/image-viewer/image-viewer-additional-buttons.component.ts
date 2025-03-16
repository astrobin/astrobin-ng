import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Inject, Input, OnChanges, Output, PLATFORM_ID, SimpleChanges, TemplateRef, ViewChild } from "@angular/core";
import { SafeHtml } from "@angular/platform-browser";
import { ImageInterface, ImageRevisionInterface } from "@core/interfaces/image.interface";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { ImageApiService } from "@core/services/api/classic/images/image/image-api.service";
import { ImageAlias } from "@core/enums/image-alias.enum";
import { ImageService } from "@core/services/image/image.service";
import { TranslateService } from "@ngx-translate/core";
import { DeviceService } from "@core/services/device.service";

@Component({
  selector: "astrobin-image-viewer-additional-buttons",
  template: `
    <button
      *ngIf="isTouchOnly && hasMouseHover"
      (click)="toggleViewMouseHover.emit()"
      astrobinEventPreventDefault
      class="force-view-mousehover-button btn btn-link text-light"
      [class.active]="forceViewMouseHover"
    >
      <fa-icon icon="computer-mouse"></fa-icon>
    </button>

    <button
      *ngIf="!isTouchOnly && hasMouseHover"
      (click)="allowTogglingAnnotationsOnMouseHover && toggleAnnotationsOnMouseHover.emit()"
      (mouseenter)="onToggleAnnotationsOnMouseHoverEnter.emit()"
      (mouseleave)="onToggleAnnotationsOnMouseHoverLeave.emit()"
      astrobinEventPreventDefault
      class="force-toggle-annotations-on-mousehover-button btn btn-link text-light"
      [class.active]="allowTogglingAnnotationsOnMouseHover && showAnnotationsOnMouseHover"
      [class.disabled]="!allowTogglingAnnotationsOnMouseHover"
    >
      <fa-icon
        [ngbTooltip]="toggleAnnotationsOnMouseHoverTooltip"
        container="body"
        icon="crosshairs"
      ></fa-icon>
    </button>

    <button
      *ngIf="revision?.solution?.pixscale"
      (click)="toggleMoonOverlay.emit()"
      astrobinEventPreventDefault
      class="moon-scale-button btn btn-link"
      [class.active-moon]="moonOverlayActive"
      [class.text-light]="!moonOverlayActive"
    >
      <fa-icon
        [ngbTooltip]="'Show Moon scale (M)' | translate"
        container="body"
        icon="moon"
      ></fa-icon>
    </button>

    <button
      *ngIf="revision?.solution && (revision?.solution.skyplotZoom1 || revision?.solution.pixinsightFindingChart)"
      (click)="openSkyplot()"
      astrobinEventPreventDefault
      class="skyplot-button btn btn-link text-light"
    >
      <fa-icon
        [ngbTooltip]="'View sky map' | translate"
        container="body"
        icon="map"
      ></fa-icon>
    </button>

    <button
      *ngIf="!revision?.videoFile"
      class="histogram-button btn btn-link text-light"
      (click)="openHistogram()"
    >
      <fa-icon
        [ngbTooltip]="'View histogram' | translate"
        container="body"
        icon="chart-simple"
      ></fa-icon>
    </button>

    <button
      *ngIf="
        image.allowImageAdjustmentsWidget === true || (
          image.allowImageAdjustmentsWidget === null &&
          image.defaultAllowImageAdjustmentsWidget
        )"
      (click)="showAdjustmentsEditor.emit()"
      astrobinEventPreventDefault
      astrobinEventStopPropagation
      class="adjustments-editor-button btn btn-link text-light d-none d-md-block"
    >
      <fa-icon
        [ngbTooltip]="'Image adjustments' | translate"
        container="body"
        icon="sliders"
      ></fa-icon>
    </button>

    <ng-template #skyplotModalTemplate>
      <div class="modal-body">
        <img
          [src]="revision?.solution?.pixinsightFindingChart || revision?.solution?.skyplotZoom1"
          [ngStyle]="{'filter': revision.solution.pixinsightFindingChart ? 'none' : 'grayscale(100%)'}"
          class="w-100"
          alt=""
        />
      </div>
    </ng-template>

    <ng-template #histogramModalTemplate>
      <div class="modal-body">
        <img *ngIf="!loadingHistogram; else loadingTemplate" [src]="histogram" alt="" />
      </div>
    </ng-template>

    <ng-template #loadingTemplate>
      <astrobin-loading-indicator></astrobin-loading-indicator>
    </ng-template>
  `,
  styleUrls: ["./image-viewer-additional-buttons.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ImageViewerAdditionalButtonComponent implements OnChanges {
  @Input() image: ImageInterface;
  @Input() revisionLabel: string;

  @Input() allowTogglingAnnotationsOnMouseHover: boolean;
  @Input() showAnnotationsOnMouseHover: boolean;
  @Input() hasMouseHover: boolean;
  @Input() inlineSvg: SafeHtml;
  @Input() forceViewMouseHover: boolean;
  @Input() moonOverlayActive = false;

  // Only for desktops.
  @Output() toggleAnnotationsOnMouseHover = new EventEmitter<void>();
  @Output() onToggleAnnotationsOnMouseHoverEnter = new EventEmitter<void>();
  @Output() onToggleAnnotationsOnMouseHoverLeave = new EventEmitter<void>();

  // This is the one for mobile devices.
  @Output() toggleViewMouseHover = new EventEmitter<void>();

  @Output() showAdjustmentsEditor = new EventEmitter<void>();
  @Output() toggleMoonOverlay = new EventEmitter<void>();

  @ViewChild("skyplotModalTemplate")
  skyplotModalTemplate: TemplateRef<any>;

  @ViewChild("histogramModalTemplate")
  histogramModalTemplate: TemplateRef<any>;

  protected readonly isBrowser: boolean;
  protected readonly isTouchOnly: boolean;

  protected revision: ImageInterface | ImageRevisionInterface;
  protected loadingHistogram = false;
  protected histogram: string;
  protected toggleAnnotationsOnMouseHoverTooltip: string;

  constructor(
    public readonly modalService: NgbModal,
    public readonly imageApiService: ImageApiService,
    public readonly imageService: ImageService,
    public readonly changeDetectorRef: ChangeDetectorRef,
    public readonly translateService: TranslateService,
    public readonly deviceService: DeviceService,
  ) {
    this.isTouchOnly = this.deviceService.isTouchEnabled() && !this.deviceService.isHybridPC();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.image || changes.revisionLabel) {
      this.revision = this.imageService.getRevision(this.image, this.revisionLabel);
      
      // Reset moon overlay active state when image changes
      if (changes.image && changes.image.previousValue !== changes.image.currentValue) {
        this.moonOverlayActive = false;
      }
    }

    if (changes.allowTogglingAnnotationsOnMouseHover || changes.showAnnotationsOnMouseHover || changes.hasMouseHover) {
      this._updateToggleAnnotationsOnMouseHoverTooltip();
    }
  }

  openSkyplot(): void {
    this.modalService.open(this.skyplotModalTemplate, { size: "md" });
  }

  openHistogram(): void {
    if (this.loadingHistogram) {
      return;
    }

    this.modalService.open(this.histogramModalTemplate, { size: "sm" });
    this.loadingHistogram = true;

    this.imageApiService.getThumbnail(
      this.image.hash || this.image.pk, this.revisionLabel, ImageAlias.HISTOGRAM
    ).subscribe(thumbnail => {
      this.loadingHistogram = false;
      this.histogram = thumbnail.url;
      this.changeDetectorRef.markForCheck();
    });
  }

  private _updateToggleAnnotationsOnMouseHoverTooltip(): void {
    if (this.allowTogglingAnnotationsOnMouseHover) {
      this.toggleAnnotationsOnMouseHoverTooltip = this.showAnnotationsOnMouseHover
        ? this.translateService.instant(
          "Click to show annotations on button hover only (or hold A)"
        )
        : this.translateService.instant(
          "Click to show annotations on image hover (or hold A)"
        );
    } else {
      this.toggleAnnotationsOnMouseHoverTooltip = null;
    }
  }
}
