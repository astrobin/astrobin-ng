import { TestBed } from "@angular/core/testing";
import { UserProfileGenerator } from "@lib/generators/user-profile.generator";
import { UserGenerator } from "@lib/generators/user.generator";
import { UserStoreService } from "@lib/services/user-store.service";
import { UserStoreServiceMock } from "@lib/services/user-store.service-mock";
import { UsernameService } from "./username.service";

describe("UsernameService", () => {
  let service: UsernameService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [UsernameService, { provide: UserStoreService, useClass: UserStoreServiceMock }]
    });
    service = TestBed.inject(UsernameService);
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });

  describe("getDisplayName", () => {
    it("should be the username if the user profile doesn't have a real name", () => {
      const userProfile = UserProfileGenerator.userProfile();
      userProfile.realName = "";

      const user = UserGenerator.user();
      user.username = "foo";

      jest.spyOn(service.userStore, "getUserProfile").mockReturnValue(userProfile);

      expect(service.getDisplayName(user)).toEqual("foo");
    });

    it("should be the real name if the user profile has it", () => {
      const userProfile = UserProfileGenerator.userProfile();
      userProfile.realName = "Foo Bar";

      const user = UserGenerator.user();
      user.username = "foo";

      jest.spyOn(service.userStore, "getUserProfile").mockReturnValue(userProfile);

      expect(service.getDisplayName(user)).toEqual("Foo Bar");
    });
  });
});
