import { TestBed } from "@angular/core/testing";

import { GroupGenerator } from "@lib/generators/group.generator";
import { UserGenerator } from "@lib/generators/user.generator";
import { UserService } from "./user.service";

describe("UserService", () => {
  let service: UserService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UserService);
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });

  describe("isInGruop", () => {
    it("should be false if user is null", () => {
      expect(service.isInGroup(null, "foo")).toBe(false);
    });

    it("should be false if user has no groups", () => {
      const user = UserGenerator.user();
      user.groups = [];

      expect(service.isInGroup(user, "foo")).toBe(false);
    });

    it("should be false if user is not in group", () => {
      const user = UserGenerator.user();
      const group = GroupGenerator.group();

      group.name = "foo";
      user.groups = [group];

      expect(service.isInGroup(user, "bar")).toBe(false);
    });

    it("should be true if user is in group", () => {
      const user = UserGenerator.user();
      const group = GroupGenerator.group();

      group.name = "foo";
      user.groups = [group];

      expect(service.isInGroup(user, "foo")).toBe(true);
    });
  });
});
