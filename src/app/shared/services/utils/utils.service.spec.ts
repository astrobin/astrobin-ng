import { TestBed } from "@angular/core/testing";
import { MockBuilder } from "ng-mocks";

import { UtilsService } from "./utils.service";
import { AppModule } from "@app/app.module";

describe("UtilsService", () => {
  let service: UtilsService;

  beforeEach(async () => {
    await MockBuilder(UtilsService, AppModule);
    service = TestBed.inject(UtilsService);
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });

  describe("fileExtension", () => {
    it("should work", () => {
      expect(UtilsService.fileExtension("foo.txt")).toEqual("txt");
      expect(UtilsService.fileExtension("foo bar.txt")).toEqual("txt");
      expect(UtilsService.fileExtension("名称.txt")).toEqual("txt");
      expect(UtilsService.fileExtension("foo.bar.txt")).toEqual("txt");
      expect(UtilsService.fileExtension("foo")).toBeUndefined();
      expect(UtilsService.fileExtension("")).toBeUndefined();
      expect(UtilsService.fileExtension(null)).toBeUndefined();
      expect(UtilsService.fileExtension(undefined)).toBeUndefined();
    });
  });

  describe("isImage", () => {
    it("should be true for image extensions", () => {
      expect(UtilsService.isImage("foo.png")).toBe(true);
      expect(UtilsService.isImage("foo.jpg")).toBe(true);
      expect(UtilsService.isImage("foo.jpeg")).toBe(true);
      expect(UtilsService.isImage("foo.gif")).toBe(true);

      expect(UtilsService.isImage("foo.PNG")).toBe(true);
      expect(UtilsService.isImage("foo.JPG")).toBe(true);
      expect(UtilsService.isImage("foo.JPEG")).toBe(true);
      expect(UtilsService.isImage("foo.GIF")).toBe(true);
    });

    it("should be false for null/undefined extensions", () => {
      expect(UtilsService.isImage(undefined)).toBe(false);
      expect(UtilsService.isImage(null)).toBe(false);
    });

    it("should be false for TIFF/FITS extensions tho", () => {
      expect(UtilsService.isImage("foo.tif")).toBe(false);
      expect(UtilsService.isImage("foo.tiff")).toBe(false);
      expect(UtilsService.isImage("foo.fit")).toBe(false);
      expect(UtilsService.isImage("foo.fits")).toBe(false);
      expect(UtilsService.isImage("foo.fts")).toBe(false);

      expect(UtilsService.isImage("foo.TIF")).toBe(false);
      expect(UtilsService.isImage("foo.TIFF")).toBe(false);
      expect(UtilsService.isImage("foo.FIT")).toBe(false);
      expect(UtilsService.isImage("foo.FITS")).toBe(false);
      expect(UtilsService.isImage("foo.FTS")).toBe(false);
    });

    it("should be false for non-image extensions", () => {
      expect(UtilsService.isImage("foo.mov")).toBe(false);
      expect(UtilsService.isImage("foo.zip")).toBe(false);
      expect(UtilsService.isImage("foo.mp3")).toBe(false);
      expect(UtilsService.isImage("foo.mp4")).toBe(false);
      expect(UtilsService.isImage("foo.txt")).toBe(false);
    });
  });

  describe("getLinksInText", () => {
    it("should work if there are no links", () => {
      const text = "Hello world";
      expect(UtilsService.getLinksInText(text)).toEqual([]);
    });

    it("should work for single link", () => {
      const text = `<a href="https://a.io/b/#c">Test</a>`;
      expect(UtilsService.getLinksInText(text)).toEqual(["https://a.io/b/#c"]);
    });

    it("should work for multiple links", () => {
      const text = `"<a href="https://a.io/b/#c">Test</a>, <a href="/foo">Test2</a>`;
      expect(UtilsService.getLinksInText(text)).toEqual(["https://a.io/b/#c", "/foo"]);
    });
  });

  describe("arrayUniqueObjects", () => {
    it("should work with one property", () => {
      const a = { pk: 1 };
      const b = { pk: 2 };
      const c = { pk: 1 };

      expect(UtilsService.arrayUniqueObjects([a, b, c])).toEqual([a, b]);
    });

    it("should work with multiple property", () => {
      const a = { pk: 1, foo: "a" };
      const b = { pk: 1, foo: "b" };
      const c = { pk: 1, foo: "a" };

      expect(UtilsService.arrayUniqueObjects([a, b, c])).toEqual([a, b]);
    });
  });

  describe("addOrUpdateUrlParam", () => {
    it("should work when there are no other params", () => {
      expect(UtilsService.addOrUpdateUrlParam("ab.co", "a", "b")).toEqual("ab.co?a=b");
    });

    it("should work when there are other params", () => {
      expect(UtilsService.addOrUpdateUrlParam("ab.co?a=b", "c", "d")).toEqual("ab.co?a=b&c=d");
    });

    it("should work when updating", () => {
      expect(UtilsService.addOrUpdateUrlParam("ab.co?a=b", "a", "c")).toEqual("ab.co?a=c");
    });
  });

  describe("removeUrlParam", () => {
    it("should work when there is no such params", () => {
      expect(UtilsService.removeUrlParam("ab.co", "a")).toEqual("ab.co");
    });

    it("should work when there is a param", () => {
      expect(UtilsService.removeUrlParam("ab.co?a=b", "a")).toEqual("ab.co");
    });

    it("should work when there are multiple params and the one to be removed is first", () => {
      expect(UtilsService.removeUrlParam("ab.co?a=b&c=d", "a")).toEqual("ab.co?c=d");
    });

    it("should work when there are multiple params and the one to be removed is middle", () => {
      expect(UtilsService.removeUrlParam("ab.co?a=b&c=d&e=f", "c")).toEqual("ab.co?a=b&e=f");
    });

    it("should work when there are multiple params and the one to be removed is last", () => {
      expect(UtilsService.removeUrlParam("ab.co?a=b&c=d&e=f", "e")).toEqual("ab.co?a=b&c=d");
    });
  });
});
