import { TestBed } from "@angular/core/testing";
import { UserGenerator } from "@shared/generators/user.generator";
import { IsImageModeratorPipe } from "./is-image-moderator.pipe";
import { MockBuilder } from "ng-mocks";
import { AppModule } from "@app/app.module";

describe("IsImageModeratorPipe", () => {
  let pipe: IsImageModeratorPipe;

  beforeAll(async () => {
    await MockBuilder(IsImageModeratorPipe, AppModule).provide(IsImageModeratorPipe);
    pipe = TestBed.inject(IsImageModeratorPipe);
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
