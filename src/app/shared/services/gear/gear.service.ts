import { Injectable } from "@angular/core";
import { BaseService } from "@shared/services/base.service";
import { LoadingService } from "@shared/services/loading.service";
import { UserInterface } from "@shared/interfaces/user.interface";
import { Observable } from "rxjs";
import { GearUserInfoInterface } from "@shared/interfaces/gear-user-info.interface";
import { GearUserInfoApiService } from "@shared/services/api/classic/astrobin/gear-user-info/gear-user-info-api.service";
import { map } from "rxjs/operators";
import { TranslateService } from "@ngx-translate/core";

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

  humanizeType(type: string) {
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
