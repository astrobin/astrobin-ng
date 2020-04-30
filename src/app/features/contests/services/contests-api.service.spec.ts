import { TestBed } from "@angular/core/testing";
import { testAppImports } from "@app/test-app.imports";
import { ContestsApiService } from "./contests-api.service";

describe("ContestsApiService", () => {
  let service: ContestsApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [testAppImports]
    });
    service = TestBed.inject(ContestsApiService);
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });
});
