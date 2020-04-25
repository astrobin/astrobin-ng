import { TestBed } from "@angular/core/testing";
import { UserProfileGenerator } from "@lib/generators/user-profile.generator";
import { UserGenerator } from "@lib/generators/user.generator";
import { UserStoreService } from "./user-store.service";

describe("UserStoreService", () => {
  let service: UserStoreService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UserStoreService);
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });

  it("should add/get users", () => {
    const user = UserGenerator.user();

    service.addUser(user);

    expect(service.getUser(user.id)).toEqual(user);
  });

  it("should add/get user profiles", () => {
    const userProfile = UserProfileGenerator.userProfile();

    service.addUserProfile(userProfile);

    expect(service.getUserProfile(userProfile.id)).toEqual(userProfile);
  });
});
