import { Location } from "@angular/common";
import { getTestBed, TestBed } from "@angular/core/testing";
import { ActivatedRouteSnapshot, Router } from "@angular/router";
import { VendorApiService } from "@feats/equipment/services/api/vendor-api.service";
import { VendorsResolver } from "@feats/equipment/resolvers/vendors.resolver";
import { HttpClientTestingModule } from "@angular/common/http/testing";
import { RouterTestingModule } from "@angular/router/testing";
import { Observable, of } from "rxjs";
import { VendorInterface } from "@shared/interfaces/equipment/vendor.interface";

describe("VendorsResolver", () => {
  let injector: TestBed;
  let vendorApi: VendorApiService;
  let route: ActivatedRouteSnapshot;
  let resolver: VendorsResolver;

  beforeEach(() => {
    route = new ActivatedRouteSnapshot();

    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        RouterTestingModule,
      ],
    });

    injector = getTestBed();
    vendorApi = injector.get(VendorApiService);
    resolver = new VendorsResolver(vendorApi);
  });

  it("should resolve", async () => {
    jest.spyOn(resolver.vendorApi, "retrieveAll").mockReturnValue(of([]));

    const result: Observable<VendorInterface[]> = resolver.resolve(route, null);
    result.subscribe(async (vendors: VendorInterface[]) => {
      await expect(vendors).toEqual([]);
    });
  });
});
