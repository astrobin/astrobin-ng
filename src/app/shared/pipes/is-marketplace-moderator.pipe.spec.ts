import { TestBed } from "@angular/core/testing";
import { AppModule } from "@app/app.module";
import { UserGenerator } from "@shared/generators/user.generator";
import { MockBuilder } from "ng-mocks";
import { IsMarketplaceModeratorPipe } from "@shared/pipes/is-marketplace-moderator.pipe";

describe("IsMarketplaceModeratorPipe", () => {
  let pipe: IsMarketplaceModeratorPipe;

  beforeAll(async () => {
    await MockBuilder(IsMarketplaceModeratorPipe, AppModule).provide(IsMarketplaceModeratorPipe);
    pipe = TestBed.inject(IsMarketplaceModeratorPipe);
  });

  it("create an instance", () => {
    expect(pipe).toBeTruthy();
  });

  it("pipe be true when user is in group", () => {
    jest.spyOn(pipe.userService, "isInGroup").mockReturnValue(true);
    expect(pipe.transform(UserGenerator.user())).toBe(true);
  });

  it("pipe be false when user is in not group", () => {
    jest.spyOn(pipe.userService, "isInGroup").mockReturnValue(false);
    expect(pipe.transform(UserGenerator.user())).toBe(false);
  });
});
