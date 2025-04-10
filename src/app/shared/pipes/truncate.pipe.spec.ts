import { TruncatePipe } from "./truncate.pipe";

describe("TruncatePipe", () => {
  let pipe: TruncatePipe;

  beforeEach(() => {
    pipe = new TruncatePipe();
  });

  it("should create an instance", () => {
    expect(pipe).toBeTruthy();
  });

  it("should not modify strings shorter than the limit", () => {
    const shortString = "Hello World";
    expect(pipe.transform(shortString, 25)).toBe(shortString);
  });

  it("should truncate string to default length of 25 with ellipsis", () => {
    const longString = "This is a very long string that needs to be truncated";
    const expected = "This is a very long st...";
    expect(pipe.transform(longString)).toBe(expected);
  });

  it("should truncate string to specified length with ellipsis", () => {
    const longString = "This is a very long string that needs to be truncated";
    const expected = "This...";
    expect(pipe.transform(longString, 7)).toBe(expected);
  });

  it("should truncate at word boundary when completeWords is true", () => {
    const longString = "This is a very long string that needs to be truncated";
    const expected = "This is a...";
    expect(pipe.transform(longString, 15, true)).toBe(expected);
  });

  it("should use custom ellipsis when provided", () => {
    const longString = "This is a very long string that needs to be truncated";
    const expected = "This is a>>>>"; // Adjusted for ellipsis length
    expect(pipe.transform(longString, 15, true, ">>>>")).toBe(expected);
  });

  it("should handle empty strings", () => {
    expect(pipe.transform("")).toBe("");
  });

  it("should handle strings with no spaces when completeWords is true", () => {
    const noSpacesString = "ThisIsAVeryLongStringWithNoSpaces";
    const expected = "...";
    expect(pipe.transform(noSpacesString, 10, true)).toBe(expected);
  });

  it("should handle strings with multiple consecutive spaces", () => {
    const multipleSpacesString = "This   is   a   string   with   spaces";
    const expected = "This  ...";
    expect(pipe.transform(multipleSpacesString, 10, true)).toBe(expected);
  });

  it("should handle limit of 0", () => {
    const string = "Test string";
    const expected = "...";
    expect(pipe.transform(string, 0)).toBe(expected);
  });

  it("should handle negative limit by returning just ellipsis", () => {
    const string = "Test string";
    const expected = "...";
    expect(pipe.transform(string, -5)).toBe(expected);
  });
});
