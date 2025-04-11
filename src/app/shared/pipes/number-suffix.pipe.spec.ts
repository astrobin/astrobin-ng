import { NumberSuffixPipe } from "./number-suffix.pipe";

describe("NumberSuffixPipe", () => {
  let pipe: NumberSuffixPipe;

  beforeAll(() => {
    pipe = new NumberSuffixPipe();
  });

  it("create an instance", () => {
    expect(pipe).toBeTruthy();
  });

  it("should return the same number for values less than 1000", () => {
    expect(pipe.transform(999)).toEqual("999");
    expect(pipe.transform(100)).toEqual("100");
  });

  it("should convert numbers in the thousands to k", () => {
    expect(pipe.transform(1000)).toEqual("1k");
    expect(pipe.transform(1500)).toEqual("1.5k");
    expect(pipe.transform(999999)).toEqual("1M");
  });

  it("should convert numbers in the millions to M", () => {
    expect(pipe.transform(1000000)).toEqual("1M");
    expect(pipe.transform(2500000)).toEqual("2.5M");
    expect(pipe.transform(999999999)).toEqual("1B");
  });

  it("should convert numbers in the billions to B", () => {
    expect(pipe.transform(1000000000)).toEqual("1B");
    expect(pipe.transform(2500000000)).toEqual("2.5B");
    expect(pipe.transform(999999999999)).toEqual("1000B");
  });

  it("should handle edge cases properly", () => {
    expect(pipe.transform(null)).toBeNull();
    expect(pipe.transform(undefined)).toBeNull();
  });

  it("should not add a suffix to very small numbers", () => {
    expect(pipe.transform(0)).toEqual("0");
    expect(pipe.transform(-500)).toEqual("-500");
  });

  it("should handle negative numbers correctly for thousands, millions, and billions", () => {
    expect(pipe.transform(-1000)).toEqual("-1k");
    expect(pipe.transform(-2500000)).toEqual("-2.5M");
    expect(pipe.transform(-1000000000)).toEqual("-1B");
  });

  it("should round numbers correctly", () => {
    expect(pipe.transform(1499)).toEqual("1.5k");
    expect(pipe.transform(1499000)).toEqual("1.5M");
    expect(pipe.transform(1499000000)).toEqual("1.5B");
  });
});
