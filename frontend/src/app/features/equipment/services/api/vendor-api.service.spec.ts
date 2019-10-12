import { TestBed } from "@angular/core/testing";
import { HttpClientTestingModule, HttpTestingController } from "@angular/common/http/testing";
import { VendorApiService } from "./vendor-api.service";
import { VendorInterface } from "@shared/interfaces/equipment/vendor.interface";
import { VendorGenerator } from "@shared/generators/vendor.generator";

describe("VendorApiService", () => {
  let service: VendorApiService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
      ],
    });
  });

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
      const mockVendor: VendorInterface = VendorGenerator.generate();

      service.create(mockVendor).subscribe(response => {
        expect(response).toEqual(mockVendor);
      });

      const req = httpMock.expectOne(`${service.configUrl}/`);
      expect(req.request.method).toBe("POST");
      req.flush(mockVendor);
    });
  });

  describe("retrieveAll", () => {
    it("should work", () => {
      const mockVendors = VendorGenerator.generateMany(3);

      service.retrieveAll().subscribe(response => {
        expect(response).toEqual(mockVendors);
      });

      const req = httpMock.expectOne(`${service.configUrl}/`);
      expect(req.request.method).toBe("GET");
      req.flush(mockVendors);
    });
  });

  describe("retrieve", () => {
    it("should work", () => {
      const mockVendor = VendorGenerator.generate();

      service.retrieve("1").subscribe(response => {
        expect(response).toEqual(mockVendor);
      });

      const req = httpMock.expectOne(`${service.configUrl}/1`);
      expect(req.request.method).toBe("GET");
      req.flush(mockVendor);
    });
  });

  describe("retrieveByName", () => {
    it("should work", () => {
      const mockVendors = VendorGenerator.generateMany(3);

      service.retrieveByName("test").subscribe(response => {
        expect(response).toEqual(mockVendors);
      });

      const req = httpMock.expectOne(`${service.configUrl}/?filter=name||eq||test`);
      expect(req.request.method).toBe("GET");
      req.flush(mockVendors);
    });
  });

  describe("retrieveByWebsite", () => {
    it("should work", () => {
      const mockVendors = VendorGenerator.generateMany(3);

      service.retrieveByWebsite("test").subscribe(response => {
        expect(response).toEqual(mockVendors);
      });

      const req = httpMock.expectOne(`${service.configUrl}/?filter=website||eq||test`);
      expect(req.request.method).toBe("GET");
      req.flush(mockVendors);
    });
  });

  describe("findSimilar", () => {
    it("should work", () => {
      const mockVendors = VendorGenerator.generateMany(3);

      service.findSimilar("test").subscribe(response => {
        expect(response).toEqual(mockVendors);
      });

      const req = httpMock.expectOne(`${service.utilsConfigUrl}/similar/?q=test`);
      expect(req.request.method).toBe("GET");
      req.flush(mockVendors);
    });
  });
});
