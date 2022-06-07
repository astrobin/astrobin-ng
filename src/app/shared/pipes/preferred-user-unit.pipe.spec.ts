import { WeightUnit } from "@shared/types/weight-unit.enum";
import { PreferredUserUnitPipe } from "@shared/pipes/preferred-user-unit.pipe";
import { UserProfileGenerator } from "@shared/generators/user-profile.generator";

describe("PreferredUserUnitPipe", () => {
  it("create an instance", () => {
    const pipe = new PreferredUserUnitPipe();

    expect(pipe).toBeTruthy();
  });

  it("should work for US", () => {
    const pipe = new PreferredUserUnitPipe();
    const userProfile = UserProfileGenerator.userProfile();

    expect(pipe.transform(userProfile)).toEqual(WeightUnit.LBS);
  });

  it("should work for Liberia", () => {
    const pipe = new PreferredUserUnitPipe();
    const userProfile = UserProfileGenerator.userProfile();

    userProfile.lastSeenInCountry = "lr";

    expect(pipe.transform(userProfile)).toEqual(WeightUnit.LBS);
  });

  it("should work for Myanmar", () => {
    const pipe = new PreferredUserUnitPipe();
    const userProfile = UserProfileGenerator.userProfile();

    userProfile.lastSeenInCountry = "mm";

    expect(pipe.transform(userProfile)).toEqual(WeightUnit.LBS);
  });

  it("should work for GB", () => {
    const pipe = new PreferredUserUnitPipe();
    const userProfile = UserProfileGenerator.userProfile();

    userProfile.lastSeenInCountry = "gb";

    expect(pipe.transform(userProfile)).toEqual(WeightUnit.KG);
  });

  it("should work for Germany", () => {
    const pipe = new PreferredUserUnitPipe();
    const userProfile = UserProfileGenerator.userProfile();

    userProfile.lastSeenInCountry = "de";

    expect(pipe.transform(userProfile)).toEqual(WeightUnit.KG);
  });
});
