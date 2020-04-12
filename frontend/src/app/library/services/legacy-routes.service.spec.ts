import { TestBed } from "@angular/core/testing";

import { ClassicRoutesService } from "./classic-routes.service";

describe("ClassicRoutesService", () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it("should be created", () => {
    const service: ClassicRoutesService = TestBed.get(ClassicRoutesService);
    expect(service).toBeTruthy();
  });
});
