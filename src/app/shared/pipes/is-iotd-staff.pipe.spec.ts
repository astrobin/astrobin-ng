import { UserGenerator } from "@shared/generators/user.generator";
import { UserServiceMock } from "@shared/services/user.service-mock";
import { IsIotdStaffPipe } from "./is-iotd-staff.pipe";

describe("IsIotdStaffPipe", () => {
  let pipe: IsIotdStaffPipe;

  beforeEach(() => {
    pipe = new IsIotdStaffPipe(new UserServiceMock());
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
