import { TestBed } from "@angular/core/testing";
import { of } from "rxjs";
import { CommonApiService } from "./api/classic/common/common-api.service";

import { UserProfileGenerator } from "@lib/generators/user-profile.generator";
import { UserGenerator } from "@lib/generators/user.generator";
import { AppContextService } from "./app-context.service";

class MockCommonApiService {
  getUser = jest.fn(() => of(UserGenerator.user()));
  getCurrentUserProfile = jest.fn(() => of(UserProfileGenerator.userProfile()));
  getSubscriptions = jest.fn(() => of([]));
  getUserSubscriptions = jest.fn(() => of([]));
}

describe("AppContextService", () => {
  let service: AppContextService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [{ provide: CommonApiService, useClass: MockCommonApiService }]
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
        expect(appContext.currentUser.id).toEqual(1);
      });
    });
  });
});
