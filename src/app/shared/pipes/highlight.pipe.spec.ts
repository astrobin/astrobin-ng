import { HighlightPipe } from "./highlight.pipe";

describe("HighlightPipe", () => {
  let pipe: HighlightPipe;

  beforeEach(() => {
    pipe = new HighlightPipe();
  });

  it("create an instance", () => {
    expect(pipe).toBeTruthy();
  });

  it("should highlight the search term in the text", () => {
    const text = "This is a test";
    const searchText = "test";
    const result = pipe.transform(text, searchText);
    expect(result).toBe("This is a <span class=\"highlight\">test</span>");
  });

  it("should highlight all occurrences of the search term in the text", () => {
    const text = "test test test";
    const searchText = "test";
    const result = pipe.transform(text, searchText);
    expect(result).toBe("<span class=\"highlight\">test</span> <span class=\"highlight\">test</span> <span class=\"highlight\">test</span>");
  });

  it("should be case-insensitive", () => {
    const text = "This is a Test";
    const searchText = "test";
    const result = pipe.transform(text, searchText);
    expect(result).toBe("This is a <span class=\"highlight\">Test</span>");
  });

  it("should return the original text if search term is not found", () => {
    const text = "This is a test";
    const searchText = "notfound";
    const result = pipe.transform(text, searchText);
    expect(result).toBe("This is a test");
  });

  it("should return the original text if search term is empty", () => {
    const text = "This is a test";
    const searchText = "";
    const result = pipe.transform(text, searchText);
    expect(result).toBe("This is a test");
  });

  it("should return the original text if search term is null", () => {
    const text = "This is a test";
    const searchText = null;
    const result = pipe.transform(text, searchText);
    expect(result).toBe("This is a test");
  });

  it("should return the original text if search term is undefined", () => {
    const text = "This is a test";
    const searchText = undefined;
    const result = pipe.transform(text, searchText);
    expect(result).toBe("This is a test");
  });
});
