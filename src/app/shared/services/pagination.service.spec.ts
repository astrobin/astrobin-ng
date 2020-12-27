import { TestBed } from "@angular/core/testing";
import { MockBuilder } from "ng-mocks";
import { PaginationService } from "./pagination.service";

describe("PaginationService", () => {
  let service: PaginationService;

  beforeEach(() => {
    MockBuilder(PaginationService);
    service = TestBed.inject(PaginationService);
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });
});
