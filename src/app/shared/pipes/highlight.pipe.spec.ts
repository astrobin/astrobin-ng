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
    expect(result).toBe('This is a <span class="highlight">test</span>');
  });

  it("should highlight all occurrences of the search term in the text", () => {
    const text = "test test test";
    const searchText = "test";
    const result = pipe.transform(text, searchText);
    expect(result).toBe(
      '<span class="highlight">test</span> <span class="highlight">test</span> <span class="highlight">test</span>'
    );
  });

  it("should be case-insensitive", () => {
    const text = "This is a Test";
    const searchText = "test";
    const result = pipe.transform(text, searchText);
    expect(result).toBe('This is a <span class="highlight">Test</span>');
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

  describe("Quoted phrases", () => {
    it("should highlight an exact quoted phrase", () => {
      const text = "hello foo bar 123";
      const searchText = '"foo bar"';
      const result = pipe.transform(text, searchText);
      expect(result).toBe('hello <span class="highlight">foo bar</span> 123');
    });

    it("should handle multiple quoted phrases", () => {
      const text = "hello foo bar world bar foo";
      const searchText = '"foo bar" "bar foo"';
      const result = pipe.transform(text, searchText);
      expect(result).toBe('hello <span class="highlight">foo bar</span> world <span class="highlight">bar foo</span>');
    });

    it("should handle mixed quoted and unquoted terms", () => {
      const text = "hello foo bar world test";
      const searchText = '"foo bar" test';
      const result = pipe.transform(text, searchText);
      expect(result).toBe('hello <span class="highlight">foo bar</span> world <span class="highlight">test</span>');
    });

    it("should preserve quoted stop words", () => {
      const text = "this is the text";
      const searchText = '"the"';
      const result = pipe.transform(text, searchText);
      expect(result).toBe('this is <span class="highlight">the</span> text');
    });

    it("should handle unclosed quotes", () => {
      const text = "hello foo bar world";
      const searchText = '"foo bar world';
      const result = pipe.transform(text, searchText);
      expect(result).toBe('hello <span class="highlight">foo bar world</span>');
    });
  });

  describe("Special cases", () => {
    it("should handle special regex characters in search", () => {
      const text = "hello (foo) [bar] world";
      const searchText = "(foo)";
      const result = pipe.transform(text, searchText);
      expect(result).toBe('hello <span class="highlight">(foo)</span> [bar] world');
    });

    it("should handle special regex characters in quoted phrases", () => {
      const text = "hello (foo bar) world";
      const searchText = '"(foo bar)"';
      const result = pipe.transform(text, searchText);
      expect(result).toBe('hello <span class="highlight">(foo bar)</span> world');
    });

    it("should ignore single-character terms unless quoted", () => {
      const text = "a b c test";
      const searchText = 'a b "c" test';
      const result = pipe.transform(text, searchText);
      expect(result).toBe('a b <span class="highlight">c</span> <span class="highlight">test</span>');
    });

    it("should ignore stop words unless quoted", () => {
      const text = "the quick brown fox";
      const searchText = 'the "the" quick';
      const result = pipe.transform(text, searchText);
      expect(result).toBe('<span class="highlight">the</span> <span class="highlight">quick</span> brown fox');
    });
  });

  describe("Multi-language support", () => {
    it("should handle stop words in different languages", () => {
      const text = "der quick brown fox";
      const searchText = 'der "der" quick';
      const result = pipe.transform(text, searchText);
      expect(result).toBe('<span class="highlight">der</span> <span class="highlight">quick</span> brown fox');
    });

    it("should handle mixed language quoted phrases", () => {
      const text = "the der quick brown fox";
      const searchText = '"the der" quick';
      const result = pipe.transform(text, searchText);
      expect(result).toBe('<span class="highlight">the der</span> <span class="highlight">quick</span> brown fox');
    });
  });
});
