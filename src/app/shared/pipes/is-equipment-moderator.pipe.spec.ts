import { TestBed } from "@angular/core/testing";
import { AppModule } from "@app/app.module";
import { UserGenerator } from "@shared/generators/user.generator";
import { IsEquipmentModeratorPipe } from "@shared/pipes/is-equipment-moderator.pipe";
import { MockBuilder } from "ng-mocks";

describe("IsEquipmentModeratorPipe", () => {
  let pipe: IsEquipmentModeratorPipe;

  beforeAll(async () => {
    await MockBuilder(IsEquipmentModeratorPipe, AppModule).provide(IsEquipmentModeratorPipe);
    pipe = TestBed.inject(IsEquipmentModeratorPipe);
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
