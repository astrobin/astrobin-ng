import { TestBed } from "@angular/core/testing";
import { HttpClientTestingModule, HttpTestingController } from "@angular/common/http/testing";
import { VendorApiService } from "@features/equipment/services/api/vendor-api.service";
import { VendorInterface } from "@shared/interfaces/equipment/vendor.interface";

describe("VendorApiService", () => {
  let service: VendorApiService;
  let httpMock: HttpTestingController;

  beforeEach(() => TestBed.configureTestingModule({
    imports: [
      HttpClientTestingModule,
    ],
  }));

  beforeEach(() => {
    service = TestBed.get(VendorApiService);
    httpMock = TestBed.get(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });

  describe("create", () => {
    it("should work", () => {
      const mockVendor: Partial<VendorInterface> = {
        name: "XYZ"
      };

      service.create(mockVendor as VendorInterface).subscribe(response => {
        expect(response).toEqual(mockVendor as VendorInterface);
      });

      const req = httpMock.expectOne(`${service.configUrl}/`);
      expect(req.request.method).toBe("POST");
      req.flush(mockVendor);
    });
  });
});
