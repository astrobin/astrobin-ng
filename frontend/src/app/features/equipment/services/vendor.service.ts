import { Injectable } from "@angular/core";
import { VendorApiService } from "@features/equipment/services/api/vendor-api.service";
import { Observable } from "rxjs";
import { VendorInterface } from "@shared/interfaces/equipment/vendor.interface";
import { map } from "rxjs/operators";
import { Router } from "@angular/router";
import { PopNotificationsService } from "@library/services/pop-notifications.service";
import { TranslateService } from "@ngx-translate/core";

@Injectable({
  providedIn: "root",
})
export class VendorService {
  constructor(
    public readonly api: VendorApiService,
    public readonly router: Router,
    public readonly popNotifications: PopNotificationsService,
    public readonly translate: TranslateService) {
  }

  public create(vendor: VendorInterface): Observable<void> {
    return this.api.create(vendor).pipe(map(response => {
      this.router.navigate(["equipment/vendors", response.id]).then(() => {
        this.popNotifications.success(this.translate.instant("Vendor created"));
      });
    }));
  }

  public isNameTaken(name: string): Observable<boolean> {
    return this.api.retrieveByName(name).pipe(
      map(result => result.length > 0)
    );
  }

  public isWebsiteTaken(website: string): Observable<boolean> {
    return this.api.retrieveByWebsite(website).pipe(
      map(result => result.length > 0)
    );
  }
}
