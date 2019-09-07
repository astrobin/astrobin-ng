import { HttpClientTestingModule } from "@angular/common/http/testing";
import { TestBed } from "@angular/core/testing";
import { UserProfileModel } from "../models/common/userprofile.model";
import { UserSubscriptionModel } from "../models/common/usersubscription.model";
import { AppContextService, IAppContext } from "./app-context.service";

import { UsersService } from "./users.service";
import { Observable } from "rxjs";
import { SubscriptionModel } from "../models/common/subscription.model";

class MockAppContextService {
  get = jasmine.createSpy("get").and.returnValue(
    new Observable<IAppContext>(observer => {
      observer.next({
        currentUserProfile: null,
        subscriptions: [
          {
            id: 1,
            category: "rawdata",
          } as SubscriptionModel,
        ],
      });
    }));
}

describe("UsersService", () => {
  let service: UsersService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
      ],
      providers: [
        {
          provide: AppContextService,
          useClass: MockAppContextService,
        },
      ],
    });

    service = TestBed.get(UsersService);
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });

  it("should match correctly", () => {
    const mockUser = new UserProfileModel({
      userSubscriptionObjects: [
        new UserSubscriptionModel({
          id: 1,
          subscription: 1,
          valid: true,
        }),
      ],
    });

    service.hasValidRawDataSubscription(mockUser).subscribe(result => {
      expect(result).toBe(true);
    });
  });

  it("should not match an invalid one", () => {
    const mockUser = new UserProfileModel({
      userSubscriptionObjects: [
        new UserSubscriptionModel({
          id: 1,
          subscription: 1,
          valid: false,
        }),
      ],
    });

    service.hasValidRawDataSubscription(mockUser).subscribe(result => {
      expect(result).toBe(false);
    });
  });

  it("should not match it user has none", () => {
    const mockUser = new UserProfileModel();

    service.hasValidRawDataSubscription(mockUser).subscribe(result => {
      expect(result).toBe(false);
    });
  });
});
