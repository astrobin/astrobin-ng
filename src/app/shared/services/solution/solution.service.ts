import { Injectable } from "@angular/core";
import { SolutionInterface, SolutionStatus } from "@shared/interfaces/solution.interface";
import { BaseService } from "@shared/services/base.service";
import { LoadingService } from "@shared/services/loading.service";


export const COMMON_OBJECTS = [
  "47 Tuc Cluster",
  "Andromeda Galaxy",
  "Antennae Galaxies",
  "Barbell Nebula",
  "Barnard's Galaxy",
  "Barnard's Merope Nebula",
  "Beehive cluster",
  "Black Eye Galaxy",
  "Blue Snowball",
  "Bode's Galaxy",
  "Bubble Nebula",
  "Butterfly Cluster",
  "California Nebula",
  "Carina Nebula",
  "Cat's Eye Nebula",
  "Centaurus A",
  "Checkmark Nebula",
  "Christmas Tree Cluster",
  "Cigar Galaxy",
  "Cocoon Nebula",
  "Coddington's Nebula",
  "Coma Pinwheel",
  "Cone nebula",
  "Cork Nebula",
  "Crab Nebula",
  "Crescent Nebula",
  "Double cluster",
  "Dumbbell Nebula",
  "Eagle Nebula",
  "Eskimo Nebula",
  "Eta Car Nebula",
  "Evil Eye Galaxy",
  "Filamentary nebula",
  "Fireworks Galaxy",
  "Flame Nebula",
  "Flaming Star Nebula",
  "Gamma Cas nebula",
  "Gamma Cassiopeiae nebula",
  "Gamma Cyg nebula",
  "Gem A",
  "Great Cluster in Hercules",
  "Great Orion Nebula",
  "Helix Nebula",
  "Hercules Globular Cluster",
  "Herschel's Jewel Box",
  "Hind's Variable Nebula",
  "Horsehead Nebula",
  "Hourglass Nebula",
  "Hubble's Nebula",
  "Hubble's variable neb",
  "Iris Nebula",
  "Jewel Box",
  "Kappa Crucis Cluster",
  "Lace-work nebula",
  "Lagoon Nebula",
  "Lambda Cen nebula",
  "Little Dumbbell",
  "Lobster Nebula",
  "Lower Sword",
  "Maia Nebula",
  "Mairan's Nebula",
  "Merope Nebula",
  "Monkey Head Nebula",
  "Needle Galaxy",
  "Network nebula",
  "North America Nebula",
  "Omega Centauri",
  "Omega nebula",
  "Omi Per Cloud",
  "Orion Nebula",
  "Owl Cluster",
  "Owl Nebula",
  "Pearl Cluster",
  "Pelican Nebula",
  "Pencil Nebula",
  "Perseus A",
  "Pin-wheel nebula",
  "Praesepe Cluster",
  "Ptolemy's Cluster",
  "Rho Oph Nebula",
  "Rim Nebula",
  "Ring Nebula",
  "Rosette Nebula",
  "Sculptor Filament",
  "Sculptor Galaxy",
  "Siamese Twins",
  "Silver Coin",
  "Small Magellanic Cloud",
  "Small Sgr Star Cloud",
  "Sombrero Galaxy",
  "Southern Pinwheel Galaxy",
  "Southern Pleiades",
  "Star Queen",
  "Stephan's Quintet",
  "Sunflower Galaxy",
  "Swan Nebula",
  "Tarantula Nebula",
  "Tejat Prior",
  "Tet Car Cluster",
  "The Eyes",
  "The Running Man Nebula",
  "The War and Peace Nebula",
  "The Witch Head Nebula",
  "Triangulum Galaxy",
  "Triangulum Pinwheel",
  "Trifid Nebula",
  "Upper Sword",
  "Veil Nebula",
  "Virgo Cluster Pinwheel",
  "Virgo Galaxy",
  "Whale Galaxy",
  "Whirlpool Galaxy",
  "Wild Duck Cluster",
  "Wishing Well Cluster",
  "Witch Head nebula",
  "chi Persei Cluster",
  "h Persei Cluster",
  "Omega Nebula"
];

@Injectable({
  providedIn: "root"
})
export class SolutionService extends BaseService {
  constructor(public readonly loadingService: LoadingService) {
    super(loadingService);
  }

  isSolving(solution: SolutionInterface): boolean {
    if (!solution) {
      return false;
    }

    return (
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
      const advancedAnnotationsLines = solution.advancedAnnotations.split("\n");
      for (const line of advancedAnnotationsLines) {
        const header = line.split(",")[0];

        if (header !== "Label") {
          continue;
        }

        let advancedAnnotation = line.split(",").pop()!.trim();

        if (clean) {
          const regex = /^(M|NGC|IC|LDN|LBN|PGC|HD)(\d+)$/;
          const matches = advancedAnnotation.match(regex);
          if (matches) {
            const catalog = matches[1];
            const id = matches[2];
            advancedAnnotation = `${catalog} ${id}`;

            // Skip objects in the PGC or HD catalogs
            if (catalog === "PGC" || catalog === "HD") {
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

    return names.sort((a, b) => this.sortObjects(a, b));
  }

  sortObjects(a: string, b: string): number {
    const COMMON_OBJECTS_INDEX = COMMON_OBJECTS.map(obj => obj.toLowerCase());
    const PRIORITY_CATALOGS = ['M', 'NGC', 'IC', 'LDN', 'LBN', 'Sh2-', 'VdB'];

    // Helper function to determine the catalog and number from an object name
    const getCatalogPriority = (obj: string) => {
      const lowerCaseObj = obj.toLowerCase();

      // Check if the object is in COMMON_OBJECTS
      if (COMMON_OBJECTS_INDEX.includes(lowerCaseObj)) {
        return { priority: 0, catalog: '', number: 0, name: obj };
      }

      // Check if the object belongs to one of the PRIORITY_CATALOGS
      const regex = /^(M|NGC|IC|LDN|LBN|Sh2-|VdB)\s*(\d+)?$/;
      const matches = obj.match(regex);
      if (matches) {
        const catalog = matches[1];
        const number = matches[2] ? parseInt(matches[2], 10) : 0;  // Default to 0 if no number
        const priority = PRIORITY_CATALOGS.indexOf(catalog);
        return { priority: priority + 1, catalog, number, name: obj };
      }

      // Everything else is lower priority
      return { priority: PRIORITY_CATALOGS.length + 1, catalog: '', number: 0, name: obj };
    };

    const objA = getCatalogPriority(a);
    const objB = getCatalogPriority(b);

    // Compare by priority
    if (objA.priority !== objB.priority) {
      return objA.priority - objB.priority;
    }

    // If both have the same priority, compare by catalog name (lexicographical order)
    if (objA.catalog !== objB.catalog) {
      return objA.catalog.localeCompare(objB.catalog);
    }

    // If both have the same catalog and number, compare alphabetically (name)
    if (objA.number === objB.number) {
      return objA.name.localeCompare(objB.name);
    }

    // Otherwise, compare by catalog number (numerical order)
    return objA.number - objB.number;
  }
}
