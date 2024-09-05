import { Injectable } from "@angular/core";
import { SolutionInterface, SolutionStatus } from "@shared/interfaces/solution.interface";
import { BaseService } from "@shared/services/base.service";
import { LoadingService } from "@shared/services/loading.service";

@Injectable({
  providedIn: "root"
})
export class SolutionService extends BaseService {
  constructor(public readonly loadingService: LoadingService) {
    super(loadingService);
  }

  isSolving(solution: SolutionInterface): boolean {
    return (
      solution === null ||
      typeof solution === "undefined" ||
      solution.status === SolutionStatus.MISSING ||
      solution.status === SolutionStatus.PENDING ||
      solution.status === SolutionStatus.ADVANCED_PENDING
    );
  }

  getObjectsInField(solution: SolutionInterface, clean: boolean = true): string[] {
    const names: string[] = [];

    // Step 1: Add objects from objectsInField
    if (solution?.objectsInField?.length > 0) {
      solution.objectsInField.split(",").forEach(object => names.push(object.trim()));
    }

    // Step 2: Process advancedAnnotations and merge with objectsInField
    if (solution?.advancedAnnotations?.length > 0) {
      const advancedAnnotationsLines = solution.advancedAnnotations.split('\n');
      for (const line of advancedAnnotationsLines) {
        const header = line.split(',')[0];

        if (header !== "Label") {
          continue;
        }

        let advancedAnnotation = line.split(',').pop()!.trim();

        if (clean) {
          const regex = /^(M|NGC|IC|LDN|LBN|PGC|HD)(\d+)$/;
          const matches = advancedAnnotation.match(regex);
          if (matches) {
            const catalog = matches[1];
            const id = matches[2];
            advancedAnnotation = `${catalog} ${id}`;

            // Skip objects in the PGC or HD catalogs
            if (catalog === 'PGC' || catalog === 'HD') {
              continue;
            }
          }
        }

        // Add to names if not already present (case-insensitive comparison)
        if (advancedAnnotation && !names.some(name => name.toLowerCase() === advancedAnnotation.toLowerCase())) {
          names.push(advancedAnnotation);
        }
      }
    }

    return names.sort();
  }
}
