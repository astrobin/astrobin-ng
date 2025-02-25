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
import { UserService } from "@core/services/user.service";
import { DatePipe } from "@angular/common";
import { EquipmentService } from "@core/services/equipment.service";
import { FilterTypePriority } from "@features/equipment/types/filter.interface";
import { FilterService } from "@features/equipment/services/filter.service";

enum SharingMode {
  LINK = "link",
  BBCODE = "bbcode",
  HTML = "html",
  DETAILED = "detailed"
}

enum ThumbnailSize {
  SMALL = "small",
  MEDIUM = "medium",
  LARGE = "large"
}

@Component({
  selector: "astrobin-image-viewer-share-button",
  providers: [DatePipe],
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
    sharingMode: SharingMode.DETAILED,
    code: ""
  };

  protected readonly shareFields: FormlyFieldConfig[] = [
    {
      key: "sharingMode",
      type: "ng-select",
      wrappers: ["default-wrapper"],
      defaultValue: SharingMode.DETAILED,
      props: {
        label: this.translateService.instant("Sharing mode"),
        options: [
          { value: SharingMode.DETAILED, label: this.translateService.instant("Detailed information") },
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
        hide: () => this.shareModel.sharingMode === SharingMode.LINK || this.shareModel.sharingMode === SharingMode.DETAILED
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
        rows: 20,
        readonly: true
      }
    }
  ];

  protected copyButtonLabel = this.translateService.instant("Copy");
  protected smallThumbnail: string;
  protected mediumThumbnail: string;
  protected largeThumbnail: string;
  protected extraLargeThumbnail: string;
  protected detailedInformation: string;

  constructor(
    public readonly store$: Store<MainState>,
    public readonly offcanvasService: NgbOffcanvas,
    public readonly deviceService: DeviceService,
    public readonly translateService: TranslateService,
    public readonly imageService: ImageService,
    public readonly equipmentService: EquipmentService,
    public readonly userService: UserService,
    public readonly windowRefService: WindowRefService,
    public readonly popNotificationsService: PopNotificationsService,
    public readonly utilsService: UtilsService,
    public readonly changeDetectorRef: ChangeDetectorRef,
    private readonly datePipe: DatePipe,
    private readonly filterService: FilterService
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
    this.detailedInformation = this.getDetailedImageInformation();
  }

  openShare(event: MouseEvent): void {
    event.preventDefault();

    const isNativeShareSupported = typeof navigator !== "undefined" && !!navigator.share;
    const isMobile = this.deviceService.isMobile();

    if (isNativeShareSupported && isMobile) {
      try {
        navigator.share({
          title: this.image.title,
          url: this.getSharingValue(SharingMode.DETAILED)
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
        sharingMode: SharingMode.DETAILED,
        code: this.getSharingValue(SharingMode.DETAILED)
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

    if (sharingMode === SharingMode.DETAILED) {
      return this.getDetailedImageInformation();
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

  protected getDetailedImageInformation(): string {
    if (!this.image || !this.revision) {
      return "";
    }

    const lines: string[] = [];

    // Add basic image information
    this.addTitleInformation(lines);

    // Add photographers information
    this.addPhotographersInformation(lines);

    // Add publication date
    this.addPublicationDate(lines);

    // Add acquisition details
    this.addAcquisitionDetails(lines);

    // Add equipment details
    this.addEquipmentDetails(lines);

    // Add url
    this.addShareUrlInformation(lines);

    return lines.join("\n");
  }

  /**
   * Adds title information
   */
  private addTitleInformation(lines: string[]): void {
    lines.push(`${this.image.title}`);
  }

  /**
   * Adds information about the photographers (user and collaborators)
   */
  private addPhotographersInformation(lines: string[]): void {
    const photographers: string[] = [];
    const translatedBy = this.translateService.instant("by");

    if (this.image.userDisplayName) {
      photographers.push(this.image.userDisplayName);
    }

    if (this.image.collaborators && this.image.collaborators.length > 0) {
      for (const collaborator of this.image.collaborators) {
        photographers.push(collaborator.displayName);
      }
    }

    if (photographers.length > 0) {
      lines.push(`${translatedBy} ${photographers.join(", ")}`);
      lines.push("");
    }
  }

  /**
   * Adds the publication date information
   */
  private addPublicationDate(lines: string[]): void {
    if (this.image.published) {
      const publicationDate = this.datePipe.transform(this.image.published, "mediumDate");
      if (publicationDate) {
        lines.push(`${this.translateService.instant("Published")}: ${publicationDate}`);
        lines.push("");
      }
    }
  }

  /**
   * Adds acquisition details (deep sky integration or solar system acquisition)
   */
  private addAcquisitionDetails(lines: string[]): void {
    const deepSkyIntegration = this.imageService.getDeepSkyIntegration(this.image);
    const solarSystemIntegration = this.imageService.getSolarSystemIntegration(this.image);

    if (this.image.subjectType === "DEEP_SKY" && deepSkyIntegration) {
      this.addDeepSkyIntegration(lines);
    } else if (this.image.subjectType === "SOLAR_SYSTEM" && solarSystemIntegration) {
      this.addSolarSystemAcquisition(lines, solarSystemIntegration);
    }
  }

  /**
   * Adds deep sky integration information, including per-filter details
   */
  private addDeepSkyIntegration(lines: string[]): void {
    // Extract the total integration time in seconds for plain text display
    const totalIntegrationSeconds = this.image.deepSkyAcquisitions?.length > 0 ?
      this.image.deepSkyAcquisitions
        .filter(acq => acq.number !== null && acq.duration !== null)
        .map(acq => acq.number * parseFloat(acq.duration))
        .reduce((acc, val) => acc + val, 0) : 0;

    const plainTextIntegration = this.imageService.formatIntegration(totalIntegrationSeconds, false);
    lines.push(`${this.translateService.instant("Total integration")}: ${plainTextIntegration}`);

    // Build and add filter summaries
    const filterSummaries = this.buildFilterSummaries();
    this.addFilterSummaries(lines, filterSummaries);

    lines.push("");
  }

  /**
   * Builds filter summaries from image acquisition data
   */
  private buildFilterSummaries(): { [key: string]: { totalIntegration: number, number: number, duration: string } } {
    const filterSummaries: { [key: string]: { totalIntegration: number, number: number, duration: string } } = {};

    if (this.image.deepSkyAcquisitions?.length > 0) {
      this.image.deepSkyAcquisitions.forEach(acquisition => {
        let filterType = acquisition.filter2Type || acquisition.filterType || "UNKNOWN";

        if (filterType === "UNKNOWN" || filterType === "OTHER" || filterType === "CLEAR_OR_COLOR") {
          if (acquisition.filter2) {
            filterType = `${acquisition.filter2Brand} ${acquisition.filter2Name}`;
          } else if (acquisition.filterMake && acquisition.filterName) {
            filterType = acquisition.filterMake + " " + acquisition.filterName;
          }
        }

        const duration = parseFloat(acquisition.duration).toFixed(2).replace(".00", "");

        if (!filterSummaries[filterType]) {
          filterSummaries[filterType] = {
            totalIntegration: 0,
            number: 0,
            duration
          };
        }

        if (acquisition.number !== null && acquisition.duration !== null) {
          filterSummaries[filterType].totalIntegration += acquisition.number * parseFloat(acquisition.duration);

          const fixedAcquisitionDuration = parseFloat(acquisition.duration).toFixed(2).replace(".00", "");
          const filterExistingDuration = parseFloat(filterSummaries[filterType].duration).toFixed(2).replace(".00", "");

          if (filterExistingDuration === fixedAcquisitionDuration) {
            filterSummaries[filterType].number += acquisition.number;
          } else {
            filterSummaries[filterType].number = null;
            filterSummaries[filterType].duration = null;
          }
        }
      });
    }

    return filterSummaries;
  }

  /**
   * Adds filter summaries to the output lines
   */
  private addFilterSummaries(lines: string[], filterSummaries: {
    [key: string]: { totalIntegration: number, number: number, duration: string }
  }): void {
    if (Object.keys(filterSummaries).length > 0) {
      lines.push("");
      lines.push(this.translateService.instant("Integration per filter") + ":");

      // Get filter types and sort them by priority
      const sortedFilterTypes = Object.keys(filterSummaries).sort((a, b) => {
        const priorityA = FilterTypePriority[a as keyof typeof FilterTypePriority] ?? Number.MAX_SAFE_INTEGER;
        const priorityB = FilterTypePriority[b as keyof typeof FilterTypePriority] ?? Number.MAX_SAFE_INTEGER;
        return priorityA - priorityB;
      });

      for (const filterType of sortedFilterTypes) {
        const summary = filterSummaries[filterType];
        const integrationStr = this.imageService.formatIntegration(summary.totalIntegration, false); // Use plain text format
        let framesStr = "";

        if (summary.number && summary.duration) {
          framesStr = ` (${summary.number} × ${summary.duration}')`;
        }

        // Humanize the filter type if possible
        let humanizedFilterType = this.filterService.humanizeTypeShort(filterType as any) || filterType;

        // Match image-viewer-acquisition.component.ts behavior: display UNKNOWN as "No filter"
        if (filterType === "UNKNOWN") {
          humanizedFilterType = this.translateService.instant("No filter");
        }

        lines.push(`- ${humanizedFilterType}: ${integrationStr}${framesStr}`);
      }
    }
  }

  /**
   * Adds solar system acquisition details
   */
  private addSolarSystemAcquisition(lines: string[], solarSystemIntegration: string): void {
    // Remove HTML from solar system integration string
    const plainTextSolarSystemIntegration = solarSystemIntegration
      .replace(/<span[^>]*>/g, "")
      .replace(/<\/span>/g, "")
      .replace(/&times;/g, "×");

    lines.push(`${this.translateService.instant("Acquisition")}: ${plainTextSolarSystemIntegration}`);
    lines.push("");
  }

  /**
   * Adds equipment details, including telescopes, cameras, mounts, etc.
   */
  private addEquipmentDetails(lines: string[]): void {
    if (this.imageService.hasEquipment(this.image)) {
      lines.push(this.translateService.instant("Equipment") + ":");

      // Determine proper singular/plural labels for each equipment type
      const labels = this.getEquipmentLabels();

      // Add equipment by type
      this.addTelescopesEquipment(lines, labels.telescopes);
      this.addCamerasEquipment(lines, labels.cameras);
      this.addMountsEquipment(lines, labels.mounts);
      this.addFiltersEquipment(lines, labels.filters);
      this.addAccessoriesEquipment(lines, labels.accessories);
      this.addFocalReducersEquipment(lines);
      this.addSoftwareEquipment(lines, labels.software);

      lines.push("");
    }
  }

  /**
   * Gets equipment type labels (singular or plural based on quantity)
   */
  private getEquipmentLabels(): {
    telescopes: string;
    cameras: string;
    mounts: string;
    filters: string;
    accessories: string;
    software: string;
  } {
    // Telescopes
    let telescopesLabel: string;
    if (this.image.imagingTelescopes2?.length === 1) {
      telescopesLabel = this.equipmentService.humanizeTelescopeType(this.image.imagingTelescopes2[0]);
    } else if (this.image.imagingTelescopes?.length === 1) {
      telescopesLabel = this.translateService.instant("Optics");
    } else {
      telescopesLabel = this.translateService.instant("Optics");
    }

    // Cameras
    let camerasLabel: string;
    if (this.image.imagingCameras2?.length === 1) {
      camerasLabel = this.equipmentService.humanizeCameraType(this.image.imagingCameras2[0]);
    } else if (this.image.imagingCameras?.length === 1) {
      camerasLabel = this.translateService.instant("Camera");
    } else {
      camerasLabel = this.translateService.instant("Cameras");
    }

    // Mounts
    const mountsLabel = (this.image.mounts2?.length || 0) + (this.image.mounts?.length || 0) === 1
      ? this.translateService.instant("Mount")
      : this.translateService.instant("Mounts");

    // Filters
    const filtersLabel = (this.image.filters2?.length || 0) + (this.image.filters?.length || 0) === 1
      ? this.translateService.instant("Filter")
      : this.translateService.instant("Filters");

    // Accessories
    const accessoriesLabel = (this.image.accessories2?.length || 0) + (this.image.accessories?.length || 0) === 1
      ? this.translateService.instant("Accessory")
      : this.translateService.instant("Accessories");

    // Software
    const softwareLabel = this.translateService.instant("Software");

    return {
      telescopes: telescopesLabel,
      cameras: camerasLabel,
      mounts: mountsLabel,
      filters: filtersLabel,
      accessories: accessoriesLabel,
      software: softwareLabel
    };
  }

  /**
   * Adds telescope equipment information
   */
  private addTelescopesEquipment(lines: string[], label: string): void {
    // Telescopes (newer version)
    if (this.image.imagingTelescopes2?.length > 0) {
      const telescopes = this.image.imagingTelescopes2.map(telescope =>
        `${telescope.brandName} ${telescope.name}`
      );
      lines.push(`- ${label}: ${telescopes.join(", ")}`);
    }

    // Telescopes (legacy)
    if (this.image.imagingTelescopes?.length > 0) {
      const telescopes = this.image.imagingTelescopes.map(telescope =>
        telescope.make ? `${telescope.make} ${telescope.name}` : telescope.name
      );
      lines.push(`- ${label}: ${telescopes.join(", ")}`);
    }
  }

  /**
   * Adds camera equipment information
   */
  private addCamerasEquipment(lines: string[], label: string): void {
    // Cameras (newer version)
    if (this.image.imagingCameras2?.length > 0) {
      const cameras = this.image.imagingCameras2.map(camera =>
        `${camera.brandName} ${camera.name}`
      );
      lines.push(`- ${label}: ${cameras.join(", ")}`);
    }

    // Cameras (legacy)
    if (this.image.imagingCameras?.length > 0) {
      const cameras = this.image.imagingCameras.map(camera =>
        camera.make ? `${camera.make} ${camera.name}` : camera.name
      );
      lines.push(`- ${label}: ${cameras.join(", ")}`);
    }
  }

  /**
   * Adds mount equipment information
   */
  private addMountsEquipment(lines: string[], label: string): void {
    // Mounts (newer version)
    if (this.image.mounts2?.length > 0) {
      const mounts = this.image.mounts2.map(mount =>
        `${mount.brandName} ${mount.name}`
      );
      lines.push(`- ${label}: ${mounts.join(", ")}`);
    }

    // Mounts (legacy)
    if (this.image.mounts?.length > 0) {
      const mounts = this.image.mounts.map(mount =>
        mount.make ? `${mount.make} ${mount.name}` : mount.name
      );
      lines.push(`- ${label}: ${mounts.join(", ")}`);
    }
  }

  /**
   * Adds filter equipment information
   */
  private addFiltersEquipment(lines: string[], label: string): void {
    // Filters (newer version)
    if (this.image.filters2?.length > 0) {
      const filters = this.image.filters2.map(filter =>
        `${filter.brandName} ${filter.name}`
      );
      lines.push(`- ${label}: ${filters.join(", ")}`);
    }

    // Filters (legacy)
    if (this.image.filters?.length > 0) {
      const filters = this.image.filters.map(filter =>
        filter.make ? `${filter.make} ${filter.name}` : filter.name
      );
      lines.push(`- ${label}: ${filters.join(", ")}`);
    }
  }

  /**
   * Adds accessories equipment information
   */
  private addAccessoriesEquipment(lines: string[], label: string): void {
    // Accessories (newer version)
    if (this.image.accessories2?.length > 0) {
      const accessories = this.image.accessories2.map(accessory =>
        `${accessory.brandName} ${accessory.name}`
      );
      lines.push(`- ${label}: ${accessories.join(", ")}`);
    }

    // Accessories (legacy)
    if (this.image.accessories?.length > 0) {
      const accessories = this.image.accessories.map(accessory =>
        accessory.make ? `${accessory.make} ${accessory.name}` : accessory.name
      );
      lines.push(`- ${label}: ${accessories.join(", ")}`);
    }
  }

  /**
   * Adds focal reducer equipment information
   */
  private addFocalReducersEquipment(lines: string[]): void {
    // Focal reducers (legacy)
    if (this.image.focalReducers?.length > 0) {
      const focalReducersLabel = this.image.focalReducers.length > 1 ?
        this.translateService.instant("Focal reducers") :
        this.translateService.instant("Focal reducer");
      const focalReducers = this.image.focalReducers.map(fr =>
        fr.make ? `${fr.make} ${fr.name}` : fr.name
      );
      lines.push(`- ${focalReducersLabel}: ${focalReducers.join(", ")}`);
    }
  }

  /**
   * Adds software information
   */
  private addSoftwareEquipment(lines: string[], label: string): void {
    // Software (newer version)
    if (this.image.software2?.length > 0) {
      const software = this.image.software2.map(sw =>
        `${sw.brandName} ${sw.name}`
      );
      lines.push(`- ${label}: ${software.join(", ")}`);
    }

    // Software (legacy)
    if (this.image.software?.length > 0) {
      const software = this.image.software.map(sw =>
        sw.make ? `${sw.make} ${sw.name}` : sw.name
      );
      lines.push(`- ${label}: ${software.join(", ")}`);
    }
  }

  /**
   * Adds share URL
   */
  private addShareUrlInformation(lines: string[]): void {
    const url = this.imageService.getShareUrl(this.image, this.revision ? this.revisionLabel : null);
    lines.push(this.translateService.instant("For more information, visit AstroBin") + ":");
    lines.push(url);
    lines.push("");
  }
}
