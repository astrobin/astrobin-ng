import { Injectable } from "@angular/core";
import { ImageInterface } from "@core/interfaces/image.interface";
import { EquipmentService } from "@core/services/equipment.service";
import { FilterAcquisitionService } from "@features/equipment/services/filter-acquisition.service";
import { TranslateService } from "@ngx-translate/core";

/**
 * Service to handle shared image information formatting
 * Extracted common logic from image-viewer-share-button and image-viewer-acquisition
 */
@Injectable({
  providedIn: "root"
})
export class ImageInfoService {
  constructor(
    private readonly translateService: TranslateService,
    private readonly equipmentService: EquipmentService,
    private readonly filterAcquisitionService: FilterAcquisitionService
  ) {}

  /**
   * Gets equipment type labels (singular or plural based on quantity)
   */
  getEquipmentLabels(image: ImageInterface): {
    telescopes: string;
    cameras: string;
    mounts: string;
    filters: string;
    accessories: string;
    software: string;
  } {
    // Telescopes
    let telescopesLabel: string;
    if (image.imagingTelescopes2?.length === 1) {
      telescopesLabel = this.equipmentService.humanizeTelescopeLabel(image.imagingTelescopes2[0]);
    } else {
      telescopesLabel = this.translateService.instant("Optics");
    }

    // Cameras
    let camerasLabel: string;
    if (image.imagingCameras2?.length === 1) {
      camerasLabel = this.equipmentService.humanizeCameraLabel(image.imagingCameras2[0]);
    } else if (image.imagingCameras?.length === 1) {
      camerasLabel = this.translateService.instant("Camera");
    } else {
      camerasLabel = this.translateService.instant("Cameras");
    }

    // Mounts
    let mountsLabel: string;
    if ((image.mounts2?.length || 0) + (image.mounts?.length || 0) === 1) {
      if (image.mounts2?.length === 1) {
        mountsLabel = this.equipmentService.humanizeMountLabel(image.mounts2[0]);
      } else {
        mountsLabel = this.translateService.instant("Mount");
      }
    } else {
      mountsLabel = this.translateService.instant("Mounts");
    }

    // Filters
    let filtersLabel: string;
    if ((image.filters2?.length || 0) + (image.filters?.length || 0) === 1) {
      if (image.filters2?.length === 1) {
        filtersLabel = this.equipmentService.humanizeFilterLabel(image.filters2[0]);
      } else {
        filtersLabel = this.translateService.instant("Filter");
      }
    } else {
      filtersLabel = this.translateService.instant("Filters");
    }

    // Accessories
    let accessoriesLabel: string;
    if ((image.accessories2?.length || 0) + (image.accessories?.length || 0) === 1) {
      accessoriesLabel = this.equipmentService.humanizeAccessoryLabel();
    } else {
      accessoriesLabel = this.translateService.instant("Accessories");
    }

    // Software
    const softwareLabel = this.equipmentService.humanizeSoftwareLabel();

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
   * Formats equipment items for display, handling both legacy and new equipment models
   */
  formatEquipmentItem(item: any): string {
    if (!item) {
      return "";
    }

    if (item.hasOwnProperty("make")) {
      return `${item.make} ${item.name}`;
    }

    return `${item.brand ? item.brandName : this.translateService.instant("DIY")} ${item.name}`;
  }

  /**
   * Adds telescopes equipment information to an array of lines
   */
  addTelescopesEquipment(image: ImageInterface, lines: string[], label: string): void {
    // Telescopes (newer version)
    if (image.imagingTelescopes2?.length > 0) {
      const telescopes = image.imagingTelescopes2.map(telescope => this.formatEquipmentItem(telescope));
      lines.push(`- ${label}: ${telescopes.join(", ")}`);
    }

    // Telescopes (legacy)
    if (!image.imagingTelescopes2?.length && image.imagingTelescopes?.length > 0) {
      const telescopes = image.imagingTelescopes.map(telescope => this.formatEquipmentItem(telescope));
      lines.push(`- ${label}: ${telescopes.join(", ")}`);
    }
  }

  /**
   * Adds cameras equipment information to an array of lines
   */
  addCamerasEquipment(image: ImageInterface, lines: string[], label: string): void {
    // Cameras (newer version)
    if (image.imagingCameras2?.length > 0) {
      const cameras = image.imagingCameras2.map(camera => this.formatEquipmentItem(camera));
      lines.push(`- ${label}: ${cameras.join(", ")}`);
    }

    // Cameras (legacy)
    if (!image.imagingCameras2?.length && image.imagingCameras?.length > 0) {
      const cameras = image.imagingCameras.map(camera => this.formatEquipmentItem(camera));
      lines.push(`- ${label}: ${cameras.join(", ")}`);
    }
  }

  /**
   * Adds mount equipment information to an array of lines
   */
  addMountsEquipment(image: ImageInterface, lines: string[], label: string): void {
    // Mounts (newer version)
    if (image.mounts2?.length > 0) {
      const mounts = image.mounts2.map(mount => this.formatEquipmentItem(mount));
      lines.push(`- ${label}: ${mounts.join(", ")}`);
    }

    // Mounts (legacy)
    if (!image.mounts2?.length && image.mounts?.length > 0) {
      const mounts = image.mounts.map(mount => this.formatEquipmentItem(mount));
      lines.push(`- ${label}: ${mounts.join(", ")}`);
    }
  }

  /**
   * Adds filter equipment information to an array of lines
   */
  addFiltersEquipment(image: ImageInterface, lines: string[], label: string): void {
    // Filters (newer version)
    if (image.filters2?.length > 0) {
      const filters = image.filters2.map(filter => this.formatEquipmentItem(filter));
      lines.push(`- ${label}: ${filters.join(", ")}`);
    }

    // Filters (legacy)
    if (!image.filters2?.length && image.filters?.length > 0) {
      const filters = image.filters.map(filter => this.formatEquipmentItem(filter));
      lines.push(`- ${label}: ${filters.join(", ")}`);
    }
  }

  /**
   * Adds accessories equipment information to an array of lines
   */
  addAccessoriesEquipment(image: ImageInterface, lines: string[], label: string): void {
    // Accessories (newer version)
    if (image.accessories2?.length > 0) {
      const accessories = image.accessories2.map(accessory => this.formatEquipmentItem(accessory));
      lines.push(`- ${label}: ${accessories.join(", ")}`);
    }

    // Accessories (legacy)
    if (!image.accessories2?.length && image.accessories?.length > 0) {
      const accessories = image.accessories.map(accessory => this.formatEquipmentItem(accessory));
      lines.push(`- ${label}: ${accessories.join(", ")}`);
    }
  }

  /**
   * Adds focal reducer equipment information to an array of lines
   */
  addFocalReducersEquipment(image: ImageInterface, lines: string[]): void {
    // Focal reducers (legacy)
    if (image.focalReducers?.length > 0) {
      const focalReducersLabel =
        image.focalReducers.length > 1
          ? this.translateService.instant("Focal reducers")
          : this.translateService.instant("Focal reducer");
      const focalReducers = image.focalReducers.map(fr => this.formatEquipmentItem(fr));
      lines.push(`- ${focalReducersLabel}: ${focalReducers.join(", ")}`);
    }
  }

  /**
   * Adds software information to an array of lines
   */
  addSoftwareEquipment(image: ImageInterface, lines: string[], label: string): void {
    // Software (newer version)
    if (image.software2?.length > 0) {
      const software = image.software2.map(sw => this.formatEquipmentItem(sw));
      lines.push(`- ${label}: ${software.join(", ")}`);
    }

    // Software (legacy)
    if (!image.software2?.length && image.software?.length > 0) {
      const software = image.software.map(sw => this.formatEquipmentItem(sw));
      lines.push(`- ${label}: ${software.join(", ")}`);
    }
  }

  /**
   * Adds all equipment details to an array of lines
   */
  addEquipmentDetails(image: ImageInterface, lines: string[]): void {
    if (this.hasEquipment(image)) {
      lines.push(this.translateService.instant("Equipment") + ":");

      // Determine proper singular/plural labels for each equipment type
      const labels = this.getEquipmentLabels(image);

      // Add equipment by type
      this.addTelescopesEquipment(image, lines, labels.telescopes);
      this.addCamerasEquipment(image, lines, labels.cameras);
      this.addMountsEquipment(image, lines, labels.mounts);
      this.addFiltersEquipment(image, lines, labels.filters);
      this.addAccessoriesEquipment(image, lines, labels.accessories);
      this.addFocalReducersEquipment(image, lines);
      this.addSoftwareEquipment(image, lines, labels.software);

      lines.push("");
    }
  }

  /**
   * Adds deep sky integration information, including per-filter details
   */
  addDeepSkyIntegration(image: ImageInterface, lines: string[], imageService: any): void {
    // Build and add filter summaries
    const filterSummaries = this.filterAcquisitionService.buildFilterSummaries(image);
    this.addFilterSummaries(lines, filterSummaries, imageService);
  }

  /**
   * Adds filter summaries to the output lines
   */
  addFilterSummaries(lines: string[], filterSummaries: { [key: string]: any }, imageService: any): void {
    if (Object.keys(filterSummaries).length > 0) {
      lines.push("");
      lines.push(this.translateService.instant("Integration per filter") + ":");

      // Get filter types and sort them by priority
      const sortedFilterSummaries = this.filterAcquisitionService.getSortedFilterSummaries(filterSummaries);

      for (const entry of sortedFilterSummaries) {
        const filterType = entry.filterType;
        const summary = entry.summary;
        const integrationStr = imageService.formatIntegration(summary.totalIntegration, false); // Use plain text format
        let framesStr = "";

        if (summary.number && summary.duration) {
          framesStr = ` (${summary.number} × ${summary.duration}')`;
        }

        // Humanize the filter type
        const humanizedFilterType = this.filterAcquisitionService.humanizeFilterType(filterType);

        lines.push(`- ${humanizedFilterType}: ${integrationStr}${framesStr}`);
      }
    }
  }

  /**
   * Determines if an image has any equipment
   */
  hasEquipment(image: ImageInterface): boolean {
    return (
      image.imagingTelescopes2?.length > 0 ||
      image.imagingCameras2?.length > 0 ||
      image.mounts2?.length > 0 ||
      image.filters2?.length > 0 ||
      image.accessories2?.length > 0 ||
      image.software2?.length > 0 ||
      image.guidingTelescopes2?.length > 0 ||
      image.guidingCameras2?.length > 0 ||
      image.imagingTelescopes?.length > 0 ||
      image.imagingCameras?.length > 0 ||
      image.mounts?.length > 0 ||
      image.filters?.length > 0 ||
      image.accessories?.length > 0 ||
      image.focalReducers?.length > 0 ||
      image.software?.length > 0
    );
  }
}
