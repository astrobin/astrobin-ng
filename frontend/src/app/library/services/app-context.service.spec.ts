import { TestBed } from "@angular/core/testing";
import { of } from "rxjs";
import { CommonLegacyApiService } from "./api/legacy/common-legacy-api.service";

import { AppContextService } from "./app-context.service";

class MockCommonApiService {
  getUser = jasmine.createSpy("getUser").and.returnValue(of({ id: 1 }));
  getCurrentUserProfile = jasmine.createSpy("getCurrentUserProfile").and.returnValue(of({ id: 1 }));
  getSubscriptions = jasmine.createSpy("getSubscriptions").and.returnValue(of([]));
  getUserSubscriptions = jasmine.createSpy("getUserSubscriptions").and.returnValue(of([]));
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
