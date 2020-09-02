import { HttpTestingController } from "@angular/common/http/testing";
import { TestBed } from "@angular/core/testing";
import { testAppImports } from "@app/test-app.imports";
import { ImageGenerator } from "@shared/generators/image.generator";
import { ImageApiService } from "./image-api.service";

describe("ImageApiService", () => {
  let service: ImageApiService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [testAppImports],
      providers: [ImageApiService]
    });

    service = TestBed.inject(ImageApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });

  it("getThumbnailGroup should work", () => {
    const image = ImageGenerator.image();

    service.getImage(image.pk).subscribe(response => {
      expect(response.pk).toEqual(image.pk);
    });

    const req = httpMock.expectOne(`${service.configUrl}/image/${image.pk}/`);
    expect(req.request.method).toBe("GET");
    req.flush(image);
  });
});
