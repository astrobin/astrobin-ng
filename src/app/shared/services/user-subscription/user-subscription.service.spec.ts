import { TestBed } from "@angular/core/testing";
import { testAppImports } from "@app/test-app.imports";
import { UserGenerator } from "@shared/generators/user.generator";
import { UserSubscriptionService } from "@shared/services/user-subscription/user-subscription.service";

describe("UserSubscriptionService", () => {
  let service: UserSubscriptionService;

  beforeEach(() =>
    TestBed.configureTestingModule({
      imports: [testAppImports],
      providers: [UserSubscriptionService]
    })
  );

  beforeEach(() => {
    service = TestBed.inject(UserSubscriptionService);
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });

  describe("isUltimateSubscriber", () => {
    it("should be false when the user is not in the group", () => {
      jest.spyOn(service.userService, "isInGroup").mockReturnValue(false);
      expect(service.isUltimateSubscriber(UserGenerator.user())).toBe(false);
    });

    it("should be true when the user is in the group", () => {
      jest.spyOn(service.userService, "isInGroup").mockReturnValue(true);
      expect(service.isUltimateSubscriber(UserGenerator.user())).toBe(true);
    });
  });
});
