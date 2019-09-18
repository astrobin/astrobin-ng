import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, Resolve, Router, RouterStateSnapshot } from "@angular/router";
import { VendorInterface } from "@shared/interfaces/equipment/vendor.interface";
import { VendorApiService } from "@features/equipment/services/api/vendor-api.service";
import { Observable } from "rxjs";
import { Location } from "@angular/common";

@Injectable()
export class VendorsResolver implements Resolve<VendorInterface[]> {
  constructor(router: Router, location: Location, public vendorApi: VendorApiService) {
  }

  public resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<VendorInterface[]> {
    return this.vendorApi.retrieveAll();
  }
}
