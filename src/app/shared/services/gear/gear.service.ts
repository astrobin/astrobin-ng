import { Injectable } from "@angular/core";
import { BaseService } from "@shared/services/base.service";
import { LoadingService } from "@shared/services/loading.service";

@Injectable({
  providedIn: "root"
})
export class GearService extends BaseService {
  constructor(loadingService: LoadingService) {
    super(loadingService);
  }

  getDisplayName(make: string, name: string): string {
    if (!make) {
      return name;
    }

    if (!name) {
      return make;
    }

    if (name.toLowerCase().indexOf(make.toLowerCase()) > -1) {
      return name;
    }

    return `${make.trim()} ${name.trim()}`;
  }

  getProperAttributes(legacyItem: object): string[] {
    const excludedAttributes = [
      "id",
      "pk",
      "make",
      "name",
      "migrationFlagModeratorLock",
      "migrationFlagModeratorLockTimestamp"
    ];

    const attributes = [];

    for (const key of Object.keys(legacyItem)) {
      if (excludedAttributes.indexOf(key) === -1) {
        attributes.push(key);
      }
    }

    return attributes;
  }
}
