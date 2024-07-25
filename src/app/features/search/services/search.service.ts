import { BaseService } from "@shared/services/base.service";
import { LoadingService } from "@shared/services/loading.service";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { TranslateService } from "@ngx-translate/core";

export enum SearchAutoCompleteType {
  SUBJECT = "subject",
  TELESCOPE = "telescope",
  CAMERA = "camera"
}

export interface SearchAutoCompleteItem {
  type: SearchAutoCompleteType;
  label: string;
  value?: string;
}

@Injectable({
  providedIn: "root"
})
export class SearchService extends BaseService {
  constructor(
    public readonly loadingService: LoadingService,
    public readonly translateService: TranslateService
  ) {
    super(loadingService);
  }

  humanizeSearchAutoCompleteType(type: SearchAutoCompleteType): string {
    switch (type) {
      case SearchAutoCompleteType.SUBJECT:
        return this.translateService.instant("Subject");
      case SearchAutoCompleteType.TELESCOPE:
        return this.translateService.instant("Telescope");
      case SearchAutoCompleteType.CAMERA:
        return this.translateService.instant("Camera");
    }
  }

  autoCompleteSubjects$(query: string): Observable<SearchAutoCompleteItem[]> {
    const messierRange = Array.from({ length: 110 }, (_, i) => i + 1);
    const ngcRange = Array.from({ length: 7840 }, (_, i) => i + 1);
    const icRange = Array.from({ length: 5386 }, (_, i) => i + 1);
    const sh2Range = Array.from({ length: 313 }, (_, i) => i + 1);

    const subjects = [
      ...messierRange.map(i => ({
        type: SearchAutoCompleteType.SUBJECT,
        label: `M ${i}`
      })),
      ...ngcRange.map(i => ({
        type: SearchAutoCompleteType.SUBJECT,
        label: `NGC ${i}`
      })),
      ...icRange.map(i => ({
        type: SearchAutoCompleteType.SUBJECT,
        label: `IC ${i}`
      })),
      ...sh2Range.map(i => ({
        type: SearchAutoCompleteType.SUBJECT,
        label: `Sh2-${i}`
      }))
    ];

    const commonSubjects = [
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

    subjects.push(...commonSubjects.map(label => ({
      type: SearchAutoCompleteType.SUBJECT,
      label
    })));

    return new Observable<SearchAutoCompleteItem[]>(subscriber => {
      const normalizedQuery = query.replace(/\s+/g, "").toLowerCase();
      const filteredSubjects = subjects.filter(subject =>
        subject.label.replace(/\s+/g, "").toLowerCase().includes(normalizedQuery)
      );
      subscriber.next(filteredSubjects);
      subscriber.complete();
    });
  }
}
