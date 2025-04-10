import { isPlatformBrowser } from "@angular/common";
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Inject,
  Input,
  OnChanges,
  OnInit,
  Output,
  PLATFORM_ID,
  SimpleChanges,
  TemplateRef,
  ViewChild
} from "@angular/core";
import { SafeHtml } from "@angular/platform-browser";
import { ImageAlias } from "@core/enums/image-alias.enum";
import { ImageInterface, ImageRevisionInterface } from "@core/interfaces/image.interface";
import { ImageApiService } from "@core/services/api/classic/images/image/image-api.service";
import { DeviceService } from "@core/services/device.service";
import { ImageService } from "@core/services/image/image.service";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { TranslateService } from "@ngx-translate/core";

@Component({
  selector: "astrobin-image-viewer-additional-buttons",
  template: `
    <div
      class="btn-container"
      [class.collapsed]="isCollapsed"
      [class.expanded]="!isCollapsed"
      (mouseenter)="handleMouseEnter()"
      (mouseleave)="handleMouseLeave()"
    >
      <!-- Toggle button - only visible when collapsed -->
      <button
        *ngIf="isCollapsed"
        (click)="toggleCollapse($event)"
        astrobinEventPreventDefault
        class="toggle-buttons-btn"
        [ngbTooltip]="'Show tools' | translate"
        container="body"
      >
        <fa-icon icon="chevron-left"></fa-icon>
      </button>

      <!-- Buttons wrapper - expandable container -->
      <div class="buttons-wrapper">
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
          <fa-icon [ngbTooltip]="toggleAnnotationsOnMouseHoverTooltip" container="body" icon="crosshairs"></fa-icon>
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
            [ngbTooltip]="moonOverlayActive ? hideMoonScaleTooltip : showMoonScaleTooltip"
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
          <fa-icon [ngbTooltip]="'View sky map' | translate" container="body" icon="map"></fa-icon>
        </button>

        <button *ngIf="!revision?.videoFile" class="histogram-button btn btn-link text-light" (click)="openHistogram()">
          <fa-icon [ngbTooltip]="'View histogram' | translate" container="body" icon="chart-simple"></fa-icon>
        </button>

        <!-- Measurement tool button - opens fullscreen mode with measurement tool -->
        <button
          *ngIf="!revision?.videoFile"
          (click)="toggleMeasurementTool.emit($event)"
          astrobinEventPreventDefault
          class="measurement-tool-button btn btn-link text-light"
        >
          <fa-icon [ngbTooltip]="'Measurement tool' | translate" container="body" icon="ruler"></fa-icon>
        </button>

        <!-- Annotation button - opens fullscreen mode with annotations -->
        <button
          *ngIf="!revision?.videoFile"
          (click)="toggleAnnotations.emit($event)"
          (mouseenter)="hasUrlAnnotations && onToggleAnnotationsOnMouseHoverEnter.emit()"
          (mouseleave)="hasUrlAnnotations && onToggleAnnotationsOnMouseHoverLeave.emit()"
          astrobinEventPreventDefault
          class="annotation-mode-button btn btn-link"
          [class.text-light]="true"
          [class.active]="hasUrlAnnotations"
        >
          <fa-icon
            [ngbTooltip]="
              hasUrlAnnotations ? ('Annotations from URL available' | translate) : ('Annotation tool' | translate)
            "
            container="body"
            icon="file-text"
          ></fa-icon>
        </button>

        <button
          *ngIf="
            image.allowImageAdjustmentsWidget === true ||
            (image.allowImageAdjustmentsWidget === null && image.defaultAllowImageAdjustmentsWidget)
          "
          (click)="showAdjustmentsEditor.emit()"
          astrobinEventPreventDefault
          astrobinEventStopPropagation
          class="adjustments-editor-button btn btn-link text-light d-none d-md-block"
        >
          <fa-icon [ngbTooltip]="'Image adjustments' | translate" container="body" icon="sliders"></fa-icon>
        </button>
      </div>
    </div>

    <ng-template #skyplotModalTemplate>
      <div class="modal-body">
        <img
          [src]="revision?.solution?.pixinsightFindingChart || revision?.solution?.skyplotZoom1"
          [ngStyle]="{ filter: revision.solution.pixinsightFindingChart ? 'none' : 'grayscale(100%)' }"
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
export class ImageViewerAdditionalButtonComponent implements OnChanges, OnInit {
  @Input() image: ImageInterface;
  @Input() revisionLabel: string;

  @Input() allowTogglingAnnotationsOnMouseHover: boolean;
  @Input() showAnnotationsOnMouseHover: boolean;
  @Input() hasMouseHover: boolean;
  @Input() inlineSvg: SafeHtml;
  @Input() forceViewMouseHover: boolean;
  @Input() moonOverlayActive = false;
  @Input() annotationsActive = false;
  @Input() annotationsReadOnly = true;
  @Input() hasUrlAnnotations = false;

  // Only for desktops.
  @Output() toggleAnnotationsOnMouseHover = new EventEmitter<void>();
  @Output() onToggleAnnotationsOnMouseHoverEnter = new EventEmitter<void>();
  @Output() onToggleAnnotationsOnMouseHoverLeave = new EventEmitter<void>();

  // This is the one for mobile devices.
  @Output() toggleViewMouseHover = new EventEmitter<void>();

  @Output() showAdjustmentsEditor = new EventEmitter<void>();
  @Output() toggleMoonOverlay = new EventEmitter<void>();
  @Output() toggleMeasurementTool = new EventEmitter<MouseEvent>();
  @Output() toggleAnnotations = new EventEmitter<MouseEvent>();
  @Output() toggleAnnotationEditMode = new EventEmitter<void>();

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
  protected showMoonScaleTooltip: string;
  protected hideMoonScaleTooltip: string;

  // Collapsible state
  protected isCollapsed = true;
  private _hoverTimeout: any;
  private _touchTimeout: any;

  constructor(
    public readonly modalService: NgbModal,
    public readonly imageApiService: ImageApiService,
    public readonly imageService: ImageService,
    public readonly changeDetectorRef: ChangeDetectorRef,
    public readonly translateService: TranslateService,
    public readonly deviceService: DeviceService,
    @Inject(PLATFORM_ID) private platformId: object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
    this.isTouchOnly = this.deviceService.isTouchEnabled() && !this.deviceService.isHybridPC();

    // Initialize tooltip texts for i18n extraction
    this.showMoonScaleTooltip = this.translateService.instant("Show Moon scale (M)");
    this.hideMoonScaleTooltip = this.translateService.instant("Hide Moon scale (M)");
  }

  ngOnInit(): void {
    // Start collapsed
    this.isCollapsed = true;
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

    this.imageApiService
      .getThumbnail(this.image.hash || this.image.pk, this.revisionLabel, ImageAlias.HISTOGRAM)
      .subscribe(thumbnail => {
        this.loadingHistogram = false;
        this.histogram = thumbnail.url;
        this.changeDetectorRef.markForCheck();
      });
  }

  /**
   * Show tools when clicking the chevron button
   */
  toggleCollapse(event: MouseEvent): void {
    event.preventDefault();
    event.stopPropagation();

    // Always expand, never collapse on click
    this.isCollapsed = false;
    this.changeDetectorRef.markForCheck();

    // Clear any pending timeouts
    if (this._hoverTimeout) {
      clearTimeout(this._hoverTimeout);
      this._hoverTimeout = null;
    }

    // For touch devices, auto-hide after a longer timeout
    if (this.isTouchOnly) {
      // Clear any existing timeouts
      if (this._touchTimeout) {
        clearTimeout(this._touchTimeout);
      }

      // Set a timeout to auto-collapse on touch devices
      this._touchTimeout = setTimeout(() => {
        this.isCollapsed = true;
        this.changeDetectorRef.markForCheck();
      }, 3000); // 3 seconds is enough time to interact with buttons
    }
  }

  /**
   * Handle mouse enter - expand immediately
   * Only applies to non-touch devices
   */
  handleMouseEnter(): void {
    // Only auto-expand on non-touch devices
    if (!this.isTouchOnly && this.isCollapsed) {
      // Clear any pending collapse timeout
      if (this._hoverTimeout) {
        clearTimeout(this._hoverTimeout);
      }

      // Expand immediately without delay
      this.isCollapsed = false;
      this.changeDetectorRef.markForCheck();
    }
  }

  /**
   * Handle mouse leave - collapse after a delay
   * Only applies to non-touch devices
   */
  handleMouseLeave(): void {
    // Only auto-collapse on non-touch devices
    if (!this.isTouchOnly && !this.isCollapsed) {
      // Clear any pending expand timeout
      if (this._hoverTimeout) {
        clearTimeout(this._hoverTimeout);
      }

      // Set a longer delay before collapsing to allow user to move cursor to the buttons
      this._hoverTimeout = setTimeout(() => {
        this.isCollapsed = true;
        this.changeDetectorRef.markForCheck();
      }, 1000);
    }
  }

  /**
   * Cleanup any timeouts when component is destroyed
   */
  ngOnDestroy(): void {
    if (this._hoverTimeout) {
      clearTimeout(this._hoverTimeout);
    }

    if (this._touchTimeout) {
      clearTimeout(this._touchTimeout);
    }
  }

  private _updateToggleAnnotationsOnMouseHoverTooltip(): void {
    if (this.allowTogglingAnnotationsOnMouseHover) {
      this.toggleAnnotationsOnMouseHoverTooltip = this.showAnnotationsOnMouseHover
        ? this.translateService.instant("Click to show annotations on button hover only (or hold A)")
        : this.translateService.instant("Click to show annotations on image hover (or hold A)");
    } else {
      this.toggleAnnotationsOnMouseHoverTooltip = null;
    }
  }
}
