import { UserGenerator } from "@lib/generators/user.generator";
import { UserServiceMock } from "@lib/services/user.service-mock";
import { IsContentModeratorPipe } from "./is-content-moderator.pipe";

describe("IsContentModeratorPipe", () => {
  let pipe: IsContentModeratorPipe;

  beforeAll(() => {
    pipe = new IsContentModeratorPipe(new UserServiceMock());
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
