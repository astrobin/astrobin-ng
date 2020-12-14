import { TestBed } from "@angular/core/testing";
import { UserGenerator } from "@shared/generators/user.generator";
import { IsIotdStaffPipe } from "./is-iotd-staff.pipe";
import { MockBuilder } from "ng-mocks";
import { AppModule } from "@app/app.module";

describe("IsIotdStaffPipe", () => {
  let pipe: IsIotdStaffPipe;

  beforeEach(async () => {
    await MockBuilder(IsIotdStaffPipe, AppModule).provide(IsIotdStaffPipe);
    pipe = TestBed.inject(IsIotdStaffPipe);
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
