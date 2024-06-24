import { TestBed } from "@angular/core/testing";
import { AppModule } from "@app/app.module";
import { UserGenerator } from "@shared/generators/user.generator";
import { MockBuilder } from "ng-mocks";
import { IsBetaTesterPipe } from "@shared/pipes/is-beta-tester.pipe";

describe("IsBetaTesterPipe", () => {
  let pipe: IsBetaTesterPipe;

  beforeEach(async () => {
    await MockBuilder(IsBetaTesterPipe, AppModule).provide(IsBetaTesterPipe);
    pipe = TestBed.inject(IsBetaTesterPipe);
  });

  it("create an instance", () => {
    expect(pipe).toBeTruthy();
  });

  it("pipe should work for beta tester", () => {
    jest.spyOn(pipe.userService, "isInAstroBinGroup").mockReturnValue(true);
    expect(pipe.transform(UserGenerator.user())).toBe(true);
  });

  it("pipe should work if not beta tester", () => {
    jest.spyOn(pipe.userService, "isInAstroBinGroup").mockReturnValue(false);
    expect(pipe.transform(UserGenerator.user())).toBe(false);
  });
});
