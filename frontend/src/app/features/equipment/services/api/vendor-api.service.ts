import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { BaseNgApiService } from "@lib/services/api/ng/base-ng-api.service";
import { VendorInterface } from "@shared/interfaces/equipment/vendor.interface";

@Injectable({
  providedIn: "root",
})
export class VendorApiService extends BaseNgApiService {
  public configUrl = this.baseUrl + "/vendors";
  public utilsConfigUrl = this.baseUrl + "/vendor-utils";

  public constructor(public http: HttpClient) {
    super();
  }

  public create(vendor: VendorInterface): Observable<VendorInterface> {
    return this.http.post<VendorInterface>(this.configUrl + "/", vendor);
  }

  public retrieveAll(): Observable<VendorInterface[]> {
    return this.http.get<VendorInterface[]>(this.configUrl + "/");
  }

  public retrieve(id: string): Observable<VendorInterface> {
    return this.http.get<VendorInterface>(this.configUrl + "/" + id);
  }

  public retrieveByName(name: string): Observable<VendorInterface[]> {
    return this.http.get<VendorInterface[]>(`${this.configUrl}/?filter=name||eq||${name}`);
  }

  public retrieveByWebsite(website: string): Observable<VendorInterface[]> {
    return this.http.get<VendorInterface[]>(`${this.configUrl}/?filter=website||eq||${website}`);
  }

  public findSimilar(name: string): Observable<VendorInterface[]> {
    return this.http.get<VendorInterface[]>(`${this.utilsConfigUrl}/similar/?q=${name}`);
  }
}
