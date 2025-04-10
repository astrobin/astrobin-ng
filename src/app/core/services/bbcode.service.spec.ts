import { PLATFORM_ID } from "@angular/core";
import { TestBed } from "@angular/core/testing";

import { BBCodeService } from "./bbcode.service";
import { CKEditorService } from "./ckeditor.service";
import { WindowRefService } from "./window-ref.service";

describe("BBCodeService", () => {
  let service: BBCodeService;
  let windowRefServiceMock: any;
  let ckEditorServiceMock: any;

  beforeEach(() => {
    windowRefServiceMock = {
      nativeWindow: {}
    };

    ckEditorServiceMock = {
      loadCKEditor: jest.fn().mockResolvedValue(undefined),
      setupBBCodeFilter: jest.fn().mockReturnValue({})
    };

    TestBed.configureTestingModule({
      providers: [
        BBCodeService,
        { provide: PLATFORM_ID, useValue: "browser" },
        { provide: WindowRefService, useValue: windowRefServiceMock },
        { provide: CKEditorService, useValue: ckEditorServiceMock }
      ]
    });

    service = TestBed.inject(BBCodeService);
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });

  describe("stripBBCode", () => {
    it("should handle empty or null input", () => {
      expect(service.stripBBCode(null)).toBe("");
      expect(service.stripBBCode("")).toBe("");
      expect(service.stripBBCode(undefined)).toBe("");
    });

    it("should strip simple BBCode tags", () => {
      expect(service.stripBBCode("[b]Bold text[/b]")).toBe("Bold text");
      expect(service.stripBBCode("[i]Italic text[/i]")).toBe("Italic text");
      expect(service.stripBBCode("[u]Underlined text[/u]")).toBe("Underlined text");
    });

    it("should strip nested BBCode tags", () => {
      expect(service.stripBBCode("[b][i]Bold and italic[/i][/b]")).toBe("Bold and italic");
    });

    it("should handle URL tags", () => {
      expect(service.stripBBCode("[url=https://example.com]Example[/url]")).toBe("Example");
      expect(service.stripBBCode("[url]https://example.com[/url]")).toBe("https://example.com");
    });

    it("should format list items with dashes", () => {
      expect(service.stripBBCode("[list][*]Item 1[*]Item 2[/list]")).toBe("- Item 1- Item 2");
    });

    it("should handle quote tags", () => {
      expect(service.stripBBCode("[quote=Someone]Quoted text[/quote]")).toBe("Quoted text");
      expect(service.stripBBCode("[quote]Simple quote[/quote]")).toBe("Simple quote");
    });

    it("should handle complex BBCode content", () => {
      const input = `[b]Title[/b]
[i]This is a test[/i]
[url=https://example.com]Link[/url]

[quote=John]
This is a quote
[b]With formatting[/b]
[/quote]

[list]
[*]Item 1
[*]Item 2
[/list]`;

      const expected = `Title
This is a test
Link

This is a quote
With formatting

- Item 1
- Item 2`;

      // Normalize whitespace for comparison
      const normalize = (str: string) => str.replace(/\s+/g, " ").trim();
      expect(normalize(service.stripBBCode(input))).toBe(normalize(expected));
    });
  });

  describe("transformBBCodeToHtml", () => {
    it("should return original content on server side", async () => {
      // Create a new instance with server platform ID
      const serverService = new BBCodeService("server" as any, windowRefServiceMock, ckEditorServiceMock);

      const input = "[b]Test[/b]";
      const result = await serverService.transformBBCodeToHtml(input);
      expect(result).toBe(input);
    });

    it("should return original content when input is empty", async () => {
      const result = await service.transformBBCodeToHtml("");
      expect(result).toBe("");
    });

    it("should load CKEditor when transforming content", async () => {
      await service.transformBBCodeToHtml("[b]Test[/b]");
      expect(ckEditorServiceMock.loadCKEditor).toHaveBeenCalledTimes(1);
    });

    it("should cache the CKEditor loading promise", async () => {
      await service.transformBBCodeToHtml("[b]Test[/b]");
      await service.transformBBCodeToHtml("[i]Another test[/i]");
      expect(ckEditorServiceMock.loadCKEditor).toHaveBeenCalledTimes(1);
    });

    it("should handle errors and return original content", async () => {
      ckEditorServiceMock.loadCKEditor.mockRejectedValueOnce("Error loading CKEditor");
      const input = "[b]Test[/b]";
      const result = await service.transformBBCodeToHtml(input);
      expect(result).toBe(input);
    });
  });
});
