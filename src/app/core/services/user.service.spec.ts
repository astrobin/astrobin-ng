import { TestBed } from "@angular/core/testing";
import { initialMainState } from "@app/store/state";
import { WindowRefService } from "@core/services/window-ref.service";
import { provideMockStore } from "@ngrx/store/testing";
import { AuthGroupGenerator } from "@shared/generators/auth-group.generator";
import { UserGenerator } from "@shared/generators/user.generator";
import { MockBuilder } from "ng-mocks";

import { UserService } from "./user.service";

describe("UserService", () => {
  let service: UserService;

  beforeEach(async () => {
    await MockBuilder(UserService).provide([WindowRefService, provideMockStore({ initialState: initialMainState })]);
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
      const group = AuthGroupGenerator.group();

      group.name = "foo";
      user.groups = [group];

      expect(service.isInGroup(user, "bar")).toBe(false);
    });

    it("should be true if user is in group", () => {
      const user = UserGenerator.user();
      const group = AuthGroupGenerator.group();

      group.name = "foo";
      user.groups = [group];

      expect(service.isInGroup(user, "foo")).toBe(true);
    });
  });
});
