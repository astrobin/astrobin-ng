import { UserGenerator } from "@lib/generators/user.generator";
import { UserServiceMock } from "@lib/services/user.service-mock";
import { IsIotdJudgePipe } from "./is-iotd-judge.pipe";

describe("IsIotdJudgePipe", () => {
  let pipe: IsIotdJudgePipe;

  beforeAll(() => {
    pipe = new IsIotdJudgePipe(new UserServiceMock());
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
