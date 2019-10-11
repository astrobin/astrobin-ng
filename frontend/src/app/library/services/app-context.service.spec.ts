import { TestBed } from "@angular/core/testing";
import { of } from "rxjs";
import { CommonLegacyApiService } from "./api/legacy/common-legacy-api.service";

import { AppContextService } from "./app-context.service";

class MockCommonApiService {
  getUser = jest.fn(() => of({ id: 1 }));
  getCurrentUserProfile = jest.fn(() => of({ id: 1 }));
  getSubscriptions = jest.fn(() => of([]));
  getUserSubscriptions = jest.fn(() => of([]));
}

describe("AppContextService", () => {
  let service: AppContextService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        { provide: CommonLegacyApiService, useClass: MockCommonApiService },
      ],
    });
    service = TestBed.get(AppContextService);
  });

  afterAll(() => {
    TestBed.resetTestingModule();
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });

  it("currentUserProfile should be available", () => {
    service.load().then((contextService: AppContextService) => {
      contextService.get().subscribe(appContext => {
        expect(appContext.currentUserProfile.id).toEqual(1);
      });
    });
  });

  it("currentUser should be available", () => {
    service.load().then((contextService: AppContextService) => {
      contextService.get().subscribe(appContext => {
        expect(appContext.currentUserProfile.userObject.id).toEqual(1);
      });
    });
  });
});
