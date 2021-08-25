import { AppModule } from "@app/app.module";
import { UsernameComponent } from "@shared/components/misc/username/username.component";
import { UserProfileGenerator } from "@shared/generators/user-profile.generator";
import { UserGenerator } from "@shared/generators/user.generator";
import { MockBuilder, MockRender, ngMocks } from "ng-mocks";
import { UsernameService } from "./username.service";
import { MockStore, provideMockStore } from "@ngrx/store/testing";
import { State } from "@app/store/state";
import { StateGenerator } from "@app/store/generators/state.generator";
import { TestBed } from "@angular/core/testing";

describe("UsernameService", () => {
  let service: UsernameService;
  let store: MockStore;
  const initialState: State = StateGenerator.default();

  beforeEach(async () => {
    await MockBuilder(UsernameService, AppModule).provide([provideMockStore({ initialState })]);
    MockRender(UsernameComponent);
    // Because it's a service of a component,
    // we need to get it in a special way.
    service = ngMocks.find(UsernameComponent).injector.get(UsernameService);

    store = TestBed.inject(MockStore);
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });

  describe("getDisplayName$", () => {
    it("should be the username if the user profile doesn't have a real name", () => {
      const userProfile = UserProfileGenerator.userProfile();
      userProfile.realName = "";

      const user = UserGenerator.user();
      user.username = "foo";

      const state = { ...initialState };
      state.auth.users = [user];
      state.auth.userProfiles = [userProfile];
      store.setState(state);

      service.getDisplayName$(user).subscribe(displayName => {
        expect(displayName).toEqual("foo");
      });
    });

    it("should be the real name if the user profile has a real name", () => {
      const userProfile = UserProfileGenerator.userProfile();
      userProfile.realName = "Foo Bar";

      const user = UserGenerator.user();
      user.username = "foo";

      const state = { ...initialState };
      state.auth.users = [user];
      state.auth.userProfiles = [userProfile];
      store.setState(state);

      service.getDisplayName$(user).subscribe(displayName => {
        expect(displayName).toEqual("Foo Bar");
      });
    });
  });
});
