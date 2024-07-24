import { initialIotdState, iotdReducer } from "./iotd.reducer";

describe("Iotd Reducer", () => {
  describe("an unknown action", () => {
    it("should return the previous state", () => {
      const action = {} as any;

      const result = iotdReducer(initialIotdState, action);

      expect(result).toBe(initialIotdState);
    });
  });
});
