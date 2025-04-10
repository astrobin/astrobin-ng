import { Injectable } from "@angular/core";
import type { DeepSkyAcquisitionInterface } from "@core/interfaces/deep-sky-acquisition.interface";
import type { ImageInterface } from "@core/interfaces/image.interface";
import { FilterType, FilterTypePriority, LegacyFilterType } from "@features/equipment/types/filter.interface";
import { TranslateService } from "@ngx-translate/core";

import { FilterService } from "./filter.service";

// This includes total per filter type
export interface FilterSummary {
  totalIntegration: number;
  dates?: string[];
  averageMoonIllumination?: number;
  number: number;
  duration: string;
  _mix?: boolean;
}

/**
 * Service to handle filter acquisition data processing
 * Shared between image-viewer-share-button and image-viewer-acquisition components
 */
@Injectable({
  providedIn: "root"
})
export class FilterAcquisitionService {
  constructor(private readonly translateService: TranslateService, private readonly filterService: FilterService) {}

  /**
   * Determines the filter type from an acquisition
   */
  determineFilterType(acquisition: DeepSkyAcquisitionInterface | Partial<DeepSkyAcquisitionInterface>): string {
    let filterType = acquisition.filter2Type || acquisition.filterType || "UNKNOWN";

    if (filterType === "UNKNOWN" || filterType === "OTHER" || filterType === "CLEAR_OR_COLOR") {
      if (acquisition.filter2) {
        filterType = `${acquisition.filter2Brand || this.translateService.instant("DIY")} ${acquisition.filter2Name}`;
      } else if (acquisition.filter) {
        filterType = `${acquisition.filterMake} ${acquisition.filterName}`;
      }
    }

    return filterType;
  }

  /**
   * Normalizes a duration value for consistent display
   *
   * This fixes a TypeError that occurred when calling toString() on null values.
   * The method now safely handles null/undefined values by returning "0".
   * It also ensures consistent formatting of numbers by removing trailing zeros
   * for whole numbers (e.g., "60.00" becomes "60") while preserving meaningful
   * decimal places (e.g., "60.50" remains "60.50").
   */
  normalizeDuration(duration: string | number | null | undefined): string {
    if (duration === null || duration === undefined) {
      return "0";
    }
    return parseFloat(duration.toString()).toFixed(2).replace(".00", "");
  }

  /**
   * Builds filter summaries from image acquisition data
   *
   * This method incorporates various safety checks to handle potential null/undefined values
   * in acquisition data. It aggregates acquisition data by filter type, calculates total integration
   * time, and properly handles cases where frames have different exposure durations.
   *
   * The implementation is defensive against:
   * - null/undefined image parameter
   * - null/missing deepSkyAcquisitions array
   * - null duration or number values in acquisitions
   * - acquisitions with different exposure durations for the same filter
   */
  buildFilterSummaries(image: ImageInterface, includeDates: boolean = false): { [key: string]: FilterSummary } {
    const filterSummaries: { [key: string]: FilterSummary } = {};

    if (image?.deepSkyAcquisitions?.length > 0) {
      image.deepSkyAcquisitions.forEach(acquisition => {
        const filterType = this.determineFilterType(acquisition);
        const duration = this.normalizeDuration(acquisition.duration);

        if (!filterSummaries[filterType]) {
          filterSummaries[filterType] = {
            totalIntegration: 0,
            number: 0,
            duration,
            _mix: false
          };

          if (includeDates) {
            filterSummaries[filterType].dates = [];
            filterSummaries[filterType].averageMoonIllumination = null;
          }
        }

        if (acquisition.number !== null && acquisition.duration !== null) {
          filterSummaries[filterType].totalIntegration += acquisition.number * parseFloat(acquisition.duration);

          // Handle durations safely with null checks
          const fixedAcquisitionDuration = this.normalizeDuration(acquisition.duration);
          const filterExistingDuration = this.normalizeDuration(filterSummaries[filterType].duration);

          // If we already marked this filter type as having mixed durations, don't try to set duration again
          if (filterSummaries[filterType]._mix) {
            // Do nothing - we've already determined this filter has mixed durations
          }
          // Only aggregate frames if the durations match or if we haven't set a duration yet
          else if (
            filterSummaries[filterType].duration === null ||
            filterExistingDuration === fixedAcquisitionDuration
          ) {
            // Set the duration if it's not set yet
            if (filterSummaries[filterType].duration === null) {
              filterSummaries[filterType].duration = fixedAcquisitionDuration;
            }
            filterSummaries[filterType].number += acquisition.number;
          } else {
            // If durations differ, we can't show a simple frames count
            filterSummaries[filterType].number = null;
            filterSummaries[filterType].duration = null;
            filterSummaries[filterType]._mix = true;
          }
        }

        if (includeDates && acquisition.date) {
          filterSummaries[filterType].dates.push(acquisition.date);
        }
      });

      // Calculate average moon illumination if needed
      if (includeDates) {
        for (const filterType in filterSummaries) {
          const moonIlluminations = image.deepSkyAcquisitions
            .filter(
              acquisition =>
                acquisition.filter2Type === filterType ||
                (acquisition.filter2Type === undefined && filterType === "UNKNOWN") ||
                (acquisition.filterType === undefined && filterType === "UNKNOWN")
            )
            .map(acquisition => acquisition.moonIllumination)
            .filter(moonIllumination => moonIllumination !== null);

          filterSummaries[filterType].averageMoonIllumination =
            moonIlluminations.reduce((acc, moonIllumination) => acc + moonIllumination, 0) / moonIlluminations.length ||
            null; // handle the case where there are no valid moonIlluminations
        }
      }
    }

    return filterSummaries;
  }

  /**
   * Returns filter summaries sorted by filter type priority
   */
  getSortedFilterSummaries(filterSummaries: {
    [key: string]: FilterSummary;
  }): { filterType: string; summary: FilterSummary }[] {
    // Convert the object into an array of entries
    const filterSummaryArray = Object.entries(filterSummaries).map(([filterType, summary]) => ({
      filterType,
      summary
    }));

    // Sort the array based on FilterTypePriority
    filterSummaryArray.sort((a, b) => {
      let priorityA: number;
      let priorityB: number;

      try {
        priorityA = FilterTypePriority[a.filterType as keyof typeof FilterTypePriority] ?? Number.MAX_SAFE_INTEGER;
      } catch (e) {
        priorityA = Number.MAX_SAFE_INTEGER;
      }

      try {
        priorityB = FilterTypePriority[b.filterType as keyof typeof FilterTypePriority] ?? Number.MAX_SAFE_INTEGER;
      } catch (e) {
        priorityB = Number.MAX_SAFE_INTEGER;
      }

      return priorityA - priorityB;
    });

    return filterSummaryArray;
  }

  /**
   * Humanizes filter type for display, handling special cases
   */
  humanizeFilterType(filterType: string): string {
    if (filterType === "UNKNOWN") {
      return this.translateService.instant("No filter");
    }

    if (
      !Object.values(FilterType).includes(filterType as FilterType) &&
      !Object.values(LegacyFilterType).includes(filterType as LegacyFilterType)
    ) {
      return filterType;
    }

    return this.filterService.humanizeTypeShort(filterType as FilterType);
  }
}
