import { IsRetailerPipe } from "./is-retailer.pipe";
import { UserServiceMock } from "@lib/services/user.service-mock";
import { UserGenerator } from "@lib/generators/user.generator";

describe("IsRetailerPipe", () => {
  let pipe: IsRetailerPipe;

  beforeAll(() => {
    pipe = new IsRetailerPipe(new UserServiceMock());
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
