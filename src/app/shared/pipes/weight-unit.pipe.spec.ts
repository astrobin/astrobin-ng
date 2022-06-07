import { WeightUnit } from "@shared/types/weight-unit.enum";
import { WeightUnitPipe } from "@shared/pipes/weight-unit.pipe";
import { Constants } from "@shared/constants";

describe("WeightUnitPipe", () => {
  it("create an instance", () => {
    const pipe = new WeightUnitPipe();

    expect(pipe).toBeTruthy();
  });

  it("should work from kg to lbs", () => {
    const pipe = new WeightUnitPipe();

    expect(pipe.transform(1, WeightUnit.LBS)).toEqual(Constants.KG_TO_LBS);
  });

  it("should work from kg to kg", () => {
    const pipe = new WeightUnitPipe();

    expect(pipe.transform(1, WeightUnit.KG)).toEqual(1);
  });
});
