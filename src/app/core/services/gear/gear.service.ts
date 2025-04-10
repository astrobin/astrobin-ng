import { Injectable } from "@angular/core";
import type { GearUserInfoInterface } from "@core/interfaces/gear-user-info.interface";
import type { UserInterface } from "@core/interfaces/user.interface";
import { GearUserInfoApiService } from "@core/services/api/classic/astrobin/gear-user-info/gear-user-info-api.service";
import { BaseService } from "@core/services/base.service";
import { LoadingService } from "@core/services/loading.service";
import { TranslateService } from "@ngx-translate/core";
import type { Observable } from "rxjs";
import { map } from "rxjs/operators";

@Injectable({
  providedIn: "root"
})
export class GearService extends BaseService {
  constructor(
    public readonly loadingService: LoadingService,
    public readonly userInfoApiService: GearUserInfoApiService,
    public readonly translateService: TranslateService
  ) {
    super(loadingService);
  }

  humanizeType(type: string): string {
    switch (type) {
      case "camera":
        return this.translateService.instant("Camera");
      case "telescope":
        return this.translateService.instant("Telescope");
      case "mount":
        return this.translateService.instant("Mount");
      case "filter":
        return this.translateService.instant("Filter");
      case "accessory":
        return this.translateService.instant("Accessory");
      case "software":
        return this.translateService.instant("Software");
    }

    return this.translateService.instant("n/a");
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

  getUserInfo(user: UserInterface, gear: any): Observable<GearUserInfoInterface | null> {
    return this.userInfoApiService.getForUserAndGear(user.id, gear.pk).pipe(
      map(response => {
        if (response.count === 0) {
          return null;
        }

        return response.results[0];
      })
    );
  }
}
