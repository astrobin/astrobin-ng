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
