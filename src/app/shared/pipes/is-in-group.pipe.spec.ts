import { TestBed } from "@angular/core/testing";
import { AppModule } from "@app/app.module";
import { UserGenerator } from "@shared/generators/user.generator";
import { IsInGroupPipe } from "@shared/pipes/is-in-group.pipe";
import { MockBuilder } from "ng-mocks";

describe("IsInGroupPipe", () => {
  let pipe: IsInGroupPipe;

  beforeAll(async () => {
    await MockBuilder(IsInGroupPipe, AppModule).provide(IsInGroupPipe);
    pipe = TestBed.inject(IsInGroupPipe);
  });

  it("create an instance", () => {
    expect(pipe).toBeTruthy();
  });

  it("pipe be true when user is in group", () => {
    jest.spyOn(pipe.userService, "isInGroup").mockReturnValue(true);
    expect(pipe.transform(UserGenerator.user(), "foo")).toBe(true);
  });

  it("pipe be false when user is in not group", () => {
    jest.spyOn(pipe.userService, "isInGroup").mockReturnValue(false);
    expect(pipe.transform(UserGenerator.user(), "foo")).toBe(false);
  });
});
