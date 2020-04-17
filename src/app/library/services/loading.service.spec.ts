import { TestBed } from "@angular/core/testing";
import { LoadingService } from "@lib/services/loading.service";

describe(`LoadingService`, () => {
  let service: LoadingService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [LoadingService]
    });

    service = TestBed.inject(LoadingService);
  });

  it("should set the loading state correctly", () => {
    service.setLoading(true);

    expect(service.isLoading()).toBe(true);

    service.setLoading(false);

    expect(service.isLoading()).toBe(false);
  });
});
