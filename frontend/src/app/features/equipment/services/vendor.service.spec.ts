import { fakeAsync, flush, flushMicrotasks, TestBed, tick } from "@angular/core/testing";
import { VendorService } from "./vendor.service";
import { HttpClientTestingModule } from "@angular/common/http/testing";
import { RouterTestingModule } from "@angular/router/testing";
import { ToastrModule } from "ngx-toastr";
import { TranslateModule } from "@ngx-translate/core";
import { of } from "rxjs";
import { VendorGenerator } from "@shared/generators/vendor.generator";

describe("VendorService", () => {
  let service: VendorService;

  beforeEach(() => TestBed.configureTestingModule({
    imports: [
      HttpClientTestingModule,
      RouterTestingModule,
      ToastrModule.forRoot(),
      TranslateModule.forRoot(),
    ],
  }));

  beforeEach(() => {
     service  = TestBed.get(VendorService);
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });

  it("should create a vendor", () => {
    spyOn(service.api, "create").and.returnValue(of({id: 1}));
    spyOn(service.router, "navigate");
    spyOn(service.popNotifications, "success");

    service.create(VendorGenerator.generate()).subscribe(() => {
      expect(service.api.create).toHaveBeenCalledTimes(1);
      expect(service.router.navigate).toHaveBeenCalledTimes(1);
      expect(service.popNotifications.success).toHaveBeenCalledTimes(1);
    });
  });

  describe("isNameTaken", () => {
    it("should return true if there are vendors", () => {
      spyOn(service.api, "retrieveByName").and.returnValue(of(VendorGenerator.generate()));

      service.isNameTaken("test").subscribe(result => {
        expect(result).toBe(true);
      });
    });

    it("should return false if there are no vendors", () => {
      spyOn(service.api, "retrieveByName").and.returnValue(of([]));

      service.isNameTaken("test").subscribe(result => {
        expect(result).toBe(false);
      });
    });
  });

  describe("iaWebsiteTaken", () => {
    it("should return true if there are vendors", () => {
      spyOn(service.api, "retrieveByWebsite").and.returnValue(of(VendorGenerator.generate()));

      service.isWebsiteTaken("test").subscribe(result => {
        expect(result).toBe(true);
      });
    });

    it("should return false if there are no vendors", () => {
      spyOn(service.api, "retrieveByWebsite").and.returnValue(of([]));

      service.isWebsiteTaken("test").subscribe(result => {
        expect(result).toBe(false);
      });
    });
  });
});
