import { WeightUnitLabelPipe } from "@shared/pipes/weight-unit-label.pipe";
import { WeightUnit } from "@shared/types/weight-unit.enum";

describe("WeightUnitLabelPipe", () => {
  it("create an instance", () => {
    const pipe = new WeightUnitLabelPipe();

    expect(pipe).toBeTruthy();
  });

  describe("when using parentheses", () => {
    it("should work from kg to lbs", () => {
      const pipe = new WeightUnitLabelPipe();

      expect(pipe.transform("Weight (kg)", WeightUnit.LBS)).toEqual("Weight (lbs)");
    });

    it("should work from kg to kg", () => {
      const pipe = new WeightUnitLabelPipe();

      expect(pipe.transform("Weight (kg)", WeightUnit.KG)).toEqual("Weight (kg)");
    });

    it("should work from lbs to kg", () => {
      const pipe = new WeightUnitLabelPipe();

      expect(pipe.transform("Weight (lbs)", WeightUnit.KG)).toEqual("Weight (kg)");
    });

    it("should work from lbs to lbs", () => {
      const pipe = new WeightUnitLabelPipe();

      expect(pipe.transform("Weight (lbs)", WeightUnit.LBS)).toEqual("Weight (lbs)");
    });
  });

  describe("when using a space", () => {
    it("should work from kg to lbs", () => {
      const pipe = new WeightUnitLabelPipe();

      expect(pipe.transform("4 kg", WeightUnit.LBS)).toEqual("4 lbs");
    });

    it("should work from kg to kg", () => {
      const pipe = new WeightUnitLabelPipe();

      expect(pipe.transform("4 kg", WeightUnit.KG)).toEqual("4 kg");
    });

    it("should work from lbs to kg", () => {
      const pipe = new WeightUnitLabelPipe();

      expect(pipe.transform("4 lbs", WeightUnit.KG)).toEqual("4 kg");
    });

    it("should work from lbs to lbs", () => {
      const pipe = new WeightUnitLabelPipe();

      expect(pipe.transform("4 lbs", WeightUnit.LBS)).toEqual("4 lbs");
    });
  });
});
