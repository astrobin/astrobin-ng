import { TestBed } from "@angular/core/testing";
import { testAppImports } from "@app/test-app.imports";
import { ContestGenerator } from "@features/contests/generators/contest.generator";
import { of } from "rxjs";
import { ContestsService } from "./contests.service";

describe("ContestsService", () => {
  let service: ContestsService;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [testAppImports] });
    service = TestBed.inject(ContestsService);
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });

  describe("listRunning", () => {
    it("should only return contests with startDate in the past and endDate in the future", () => {
      jest.spyOn(service.contestsApi, "list").mockReturnValue(
        of({
          count: 3,
          results: [ContestGenerator.runningContest()]
        })
      );

      service.listRunning().subscribe(result => {
        expect(result).toEqual([ContestGenerator.runningContest()]);
      });
    });
  });

  describe("listOpen", () => {
    it("should only return contests with startDate in the future", () => {
      jest.spyOn(service.contestsApi, "list").mockReturnValue(
        of({
          count: 3,
          results: [ContestGenerator.openContest()]
        })
      );

      service.listRunning().subscribe(result => {
        expect(result).toEqual([ContestGenerator.openContest()]);
      });
    });
  });

  describe("listClosed", () => {
    it("should only return contests with endDate in the past", () => {
      jest.spyOn(service.contestsApi, "list").mockReturnValue(
        of({
          count: 3,
          results: [ContestGenerator.closedContest()]
        })
      );

      service.listRunning().subscribe(result => {
        expect(result).toEqual([ContestGenerator.closedContest()]);
      });
    });
  });
});
