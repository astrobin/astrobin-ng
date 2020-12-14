import { TestBed } from "@angular/core/testing";
import { UserGenerator } from "@shared/generators/user.generator";
import { IsContentModeratorPipe } from "./is-content-moderator.pipe";
import { MockBuilder } from "ng-mocks";
import { AppModule } from "@app/app.module";

describe("IsContentModeratorPipe", () => {
  let pipe: IsContentModeratorPipe;

  beforeEach(async () => {
    await MockBuilder(IsContentModeratorPipe, AppModule).provide(IsContentModeratorPipe);
    pipe = TestBed.inject(IsContentModeratorPipe);
  });

  it("create an instance", () => {
    expect(pipe).toBeTruthy();
  });

  it("pipe should work for content moderator", () => {
    jest.spyOn(pipe.userService, "isInGroup").mockReturnValue(true);
    expect(pipe.transform(UserGenerator.user())).toBe(true);
  });

  it("pipe should work for content moderator", () => {
    jest.spyOn(pipe.userService, "isInGroup").mockReturnValue(false);
    expect(pipe.transform(UserGenerator.user())).toBe(false);
  });
});
