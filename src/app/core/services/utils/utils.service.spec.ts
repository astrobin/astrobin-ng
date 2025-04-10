import { TestBed } from "@angular/core/testing";
import { AppModule } from "@app/app.module";
import { MockBuilder } from "ng-mocks";

import { UtilsService } from "./utils.service";

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

    it("should work with multiple properties", () => {
      const a = { pk: 1, foo: "a" };
      const b = { pk: 1, foo: "b" };
      const c = { pk: 1, foo: "a" };

      expect(UtilsService.arrayUniqueObjects([a, b, c])).toEqual([a, b]);
    });

    it("should work with specific property", () => {
      const a = { pk: 1, foo: "a" };
      const b = { pk: 1, foo: "b" };
      const c = { pk: 1, foo: "a" };

      expect(UtilsService.arrayUniqueObjects([a, b, c], "pk")).toEqual([a]);
    });

    it("should remove earlier entry, not later entry", () => {
      const a = { pk: 1, foo: "a" };
      const b = { pk: 1, foo: "b" };

      expect(UtilsService.arrayUniqueObjects([a, b], "pk")).toEqual([b]);
    });

    it("should handle an empty array", () => {
      expect(UtilsService.arrayUniqueObjects([])).toEqual([]);
    });

    it("should handle key not present in some objects", () => {
      const a = { pk: 1 };
      const b = { foo: 2 };
      const c = { pk: 1 };
      expect(UtilsService.arrayUniqueObjects([a, b, c], "pk")).toEqual([a, b]);
    });

    it("should handle all duplicates", () => {
      const a = { pk: 1 };
      const b = { pk: 1 };
      expect(UtilsService.arrayUniqueObjects([a, b], "pk")).toEqual([a]);
    });

    it("should handle null and undefined values", () => {
      const a = { pk: null };
      const b = { pk: undefined };
      const c = { pk: null };
      expect(UtilsService.arrayUniqueObjects([a, b, c], "pk")).toEqual([a, b]);
    });

    it("should not reverse array if reverse flag is false", () => {
      const a = { pk: 1, foo: "a" };
      const b = { pk: 1, foo: "b" };
      expect(UtilsService.arrayUniqueObjects([a, b], "pk", false)).toEqual([a]);
    });

    it("should handle nested objects", () => {
      const a = { pk: 1, data: { x: 10 } };
      const b = { pk: 1, data: { x: 10 } };
      expect(UtilsService.arrayUniqueObjects([a, b])).toEqual([a]);
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

    it("should not throw away remaining parameters", () => {
      expect(UtilsService.addOrUpdateUrlParam("ab.co?a=b&b=c", "a", "c")).toEqual("ab.co?a=c&b=c");
    });

    it("should work in the case of a fragment", () => {
      expect(UtilsService.addOrUpdateUrlParam("ab.co#fragment", "a", "b")).toEqual("ab.co?a=b#fragment");
    });

    it("should work in the case of a fragment and multiple params", () => {
      expect(UtilsService.addOrUpdateUrlParam("ab.co?a=b#fragment", "c", "d")).toEqual("ab.co?a=b&c=d#fragment");
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

  describe("getUrlParam", () => {
    it("should work when there is no such param", () => {
      expect(UtilsService.getUrlParam("https://app.astrobin.com/foo/bar/", "test")).toBeNull();
    });

    it("should work when there is such param as first element", () => {
      expect(UtilsService.getUrlParam("https://app.astrobin.com/foo/bar/?test=1", "test")).toEqual("1");
    });

    it("should work when there is such param as non-first element", () => {
      expect(UtilsService.getUrlParam("https://app.astrobin.com/foo/bar/?a=b&test=1", "test")).toEqual("1");
    });
  });

  describe("toQueryString", () => {
    it("should convert a simple object to a query string", () => {
      const params = { name: "John Doe", age: 30 };
      expect(UtilsService.toQueryString(params)).toBe("name=John%20Doe&age=30");
    });

    it("should handle special characters in keys and values", () => {
      const params = { "na me": "John & Doe", "a&g#e": 30 };
      expect(UtilsService.toQueryString(params)).toBe("na%20me=John%20%26%20Doe&a%26g%23e=30");
    });

    it("should handle array values", () => {
      const params = { interests: ["coding", "music"] };
      expect(UtilsService.toQueryString(params)).toBe("interests=%5B%22coding%22%2C%22music%22%5D");
    });

    it("should handle empty objects", () => {
      const params = {};
      expect(UtilsService.toQueryString(params)).toBe("");
    });

    it("should handle null and undefined values", () => {
      const params = { name: "John Doe", age: undefined, city: null };
      expect(UtilsService.toQueryString(params)).toBe("name=John%20Doe");
    });

    it("should handle nested objects (serialize as JSON)", () => {
      const params = { user: { name: "John", age: 30 } };
      expect(UtilsService.toQueryString(params)).toBe("user=%7B%22name%22%3A%22John%22%2C%22age%22%3A30%7D");
    });

    it("should handle boolean values", () => {
      const params = { isActive: true, isAdmin: false };
      expect(UtilsService.toQueryString(params)).toBe("isActive=true&isAdmin=false");
    });

    it("should handle number values", () => {
      const params = { age: 30, height: 5.9 };
      expect(UtilsService.toQueryString(params)).toBe("age=30&height=5.9");
    });

    it("should handle mixed types", () => {
      const params = { name: "John", age: 30, isActive: true, hobbies: ["coding", "music"] };
      expect(UtilsService.toQueryString(params)).toBe(
        "name=John&age=30&isActive=true&hobbies=%5B%22coding%22%2C%22music%22%5D"
      );
    });

    it("should handle empty string values", () => {
      const params = { name: "" };
      expect(UtilsService.toQueryString(params)).toBe("name=");
    });

    it("should handle objects with prototype properties", () => {
      const params = Object.create({ prototypeProp: "value" });
      params.name = "John";
      expect(UtilsService.toQueryString(params)).toBe("name=John");
    });

    it("should not include properties from the prototype chain", () => {
      const params = Object.create({ prototypeProp: "value" });
      params.name = "John";
      expect(UtilsService.toQueryString(params)).not.toContain("prototypeProp");
    });

    it("should handle nested arrays and objects", () => {
      const params = { data: { items: ["item1", "item2"], details: { price: 10, available: true } } };
      expect(UtilsService.toQueryString(params)).toBe(
        "data=%7B%22items%22%3A%5B%22item1%22%2C%22item2%22%5D%2C%22details%22%3A%7B%22price%22%3A10%2C%22available%22%3Atrue%7D%7D"
      );
    });
  });

  describe("compressQueryString", () => {
    it("should compress a simple query string", () => {
      const queryString = "name=JohnDoe&age=30";
      const compressed = UtilsService.compressQueryString(queryString);
      expect(compressed).toBeDefined();
      expect(typeof compressed).toBe("string");
    });

    it("should compress a query string with special characters", () => {
      const queryString = "name=John%20Doe&age=30&city=New%20York";
      const compressed = UtilsService.compressQueryString(queryString);
      expect(compressed).toBeDefined();
      expect(typeof compressed).toBe("string");
    });

    it("should compress an empty query string", () => {
      const queryString = "";
      const compressed = UtilsService.compressQueryString(queryString);
      expect(compressed).toBeDefined();
      expect(typeof compressed).toBe("string");
    });

    it("should handle very long query strings", () => {
      const queryString = "name=" + "a".repeat(1000);
      const compressed = UtilsService.compressQueryString(queryString);
      expect(compressed).toBeDefined();
      expect(typeof compressed).toBe("string");
    });

    it("should throw an error for non-string inputs", () => {
      expect(() => UtilsService.compressQueryString(null as any)).toThrow();
      expect(() => UtilsService.compressQueryString(undefined as any)).toThrow();
      expect(() => UtilsService.compressQueryString({} as any)).toThrow();
    });
  });

  describe("decompressQueryString", () => {
    it("should decompress a previously compressed query string", () => {
      const queryString = "name=JohnDoe&age=30";
      const compressed = UtilsService.compressQueryString(queryString);
      const decompressed = UtilsService.decompressQueryString(compressed);
      expect(decompressed).toBe(queryString);
    });

    it("should decompress a query string with special characters", () => {
      const queryString = "name=John%20Doe&age=30&city=New%20York";
      const compressed = UtilsService.compressQueryString(queryString);
      const decompressed = UtilsService.decompressQueryString(compressed);
      expect(decompressed).toBe(queryString);
    });

    it("should decompress an empty query string", () => {
      const queryString = "";
      const compressed = UtilsService.compressQueryString(queryString);
      const decompressed = UtilsService.decompressQueryString(compressed);
      expect(decompressed).toBe(queryString);
    });

    it("should handle very long query strings", () => {
      const queryString = "name=" + "a".repeat(1000);
      const compressed = UtilsService.compressQueryString(queryString);
      const decompressed = UtilsService.decompressQueryString(compressed);
      expect(decompressed).toBe(queryString);
    });

    it("should throw an error for invalid compressed strings", () => {
      const invalidCompressed = "invalidBase64String";
      expect(() => UtilsService.decompressQueryString(invalidCompressed)).toThrow();
    });

    it("should decompress a string with padding issues", () => {
      const queryString = "name=JohnDoe&age=30";
      const compressed = UtilsService.compressQueryString(queryString);
      const compressedWithPaddingIssue = compressed.slice(0, -2); // Remove padding characters
      const decompressed = UtilsService.decompressQueryString(compressedWithPaddingIssue + "==");
      expect(decompressed).toBe(queryString);
    });
  });

  describe("parseQueryString", () => {
    it("should parse a simple query string", () => {
      const queryString = "?name=John%20Doe&age=30";
      const expected = { name: "John Doe", age: "30" };
      expect(UtilsService.parseQueryString(queryString)).toEqual(expected);
    });

    it("should handle special characters in keys and values", () => {
      const queryString = "?na%20me=John%20%26%20Doe&a%26g%23e=30";
      const expected = { "na me": "John & Doe", "a&g#e": "30" };
      expect(UtilsService.parseQueryString(queryString)).toEqual(expected);
    });

    it("should handle array values", () => {
      const queryString = "?interests=coding&interests=music";
      const expected = { interests: ["coding", "music"] };
      expect(UtilsService.parseQueryString(queryString)).toEqual(expected);
    });

    it("should handle empty query strings", () => {
      const queryString = "";
      const expected = {};
      expect(UtilsService.parseQueryString(queryString)).toEqual(expected);
    });

    it("should handle null and undefined values", () => {
      const queryString = "?name=John%20Doe&age";
      const expected = { name: "John Doe", age: null };
      expect(UtilsService.parseQueryString(queryString)).toEqual(expected);
    });

    it("should handle boolean values as strings", () => {
      const queryString = "?isActive=true&isAdmin=false";
      const expected = { isActive: "true", isAdmin: "false" };
      expect(UtilsService.parseQueryString(queryString)).toEqual(expected);
    });

    it("should handle number values as strings", () => {
      const queryString = "?age=30&height=5.9";
      const expected = { age: "30", height: "5.9" };
      expect(UtilsService.parseQueryString(queryString)).toEqual(expected);
    });

    it("should handle mixed types", () => {
      const queryString = "?name=John&age=30&isActive=true&hobbies=coding&hobbies=music";
      const expected = { name: "John", age: "30", isActive: "true", hobbies: ["coding", "music"] };
      expect(UtilsService.parseQueryString(queryString)).toEqual(expected);
    });

    it("should handle empty string values", () => {
      const queryString = "?name=";
      const expected = { name: "" };
      expect(UtilsService.parseQueryString(queryString)).toEqual(expected);
    });

    it("should handle multiple keys with the same name", () => {
      const queryString = "?name=John&name=Doe";
      const expected = { name: ["John", "Doe"] };
      expect(UtilsService.parseQueryString(queryString)).toEqual(expected);
    });

    it("should handle keys without values", () => {
      const queryString = "?name&age=30";
      const expected = { name: null, age: "30" };
      expect(UtilsService.parseQueryString(queryString)).toEqual(expected);
    });
  });

  describe("camelCaseToSentenceCase", () => {
    it("should work", () => {
      expect(UtilsService.camelCaseToSentenceCase("helloThere")).toEqual("Hello There");
      expect(UtilsService.camelCaseToSentenceCase("hello")).toEqual("Hello");
      expect(UtilsService.camelCaseToSentenceCase("")).toEqual("");
      expect(UtilsService.camelCaseToSentenceCase(null)).toEqual("");
      expect(UtilsService.camelCaseToSentenceCase(undefined)).toEqual("");
    });
  });

  describe("camelCaseToSnakeCase", () => {
    it("should work", () => {
      expect(UtilsService.camelCaseToSnakeCase("helloThere")).toEqual("hello_there");
      expect(UtilsService.camelCaseToSnakeCase("hello")).toEqual("hello");
      expect(UtilsService.camelCaseToSnakeCase("")).toEqual("");
      expect(UtilsService.camelCaseToSnakeCase(null)).toEqual("");
      expect(UtilsService.camelCaseToSnakeCase(undefined)).toEqual("");
    });
  });

  describe("camelCaseToCapsCase", () => {
    it("should work", () => {
      expect(UtilsService.camelCaseToCapsCase("helloThere")).toEqual("HELLO_THERE");
      expect(UtilsService.camelCaseToCapsCase("hello")).toEqual("HELLO");
      expect(UtilsService.camelCaseToCapsCase("")).toEqual("");
      expect(UtilsService.camelCaseToCapsCase(null)).toEqual("");
      expect(UtilsService.camelCaseToCapsCase(undefined)).toEqual("");
    });
  });

  describe("toCamelCase", () => {
    it("should work", () => {
      expect(UtilsService.toCamelCase("hello_there")).toEqual("helloThere");
      expect(UtilsService.toCamelCase("hello-there")).toEqual("helloThere");
      expect(UtilsService.toCamelCase("hello")).toEqual("hello");
      expect(UtilsService.toCamelCase("HelloThere")).toEqual("HelloThere");
      expect(UtilsService.toCamelCase(null)).toEqual("");
      expect(UtilsService.toCamelCase(undefined)).toEqual("");
    });
  });

  describe("objectToCamelCase", () => {
    it("should work", () => {
      expect(UtilsService.objectToCamelCase({ foo_bar: { tar_car: 2 } })).toEqual({ fooBar: { tarCar: 2 } });
      expect(UtilsService.objectToCamelCase(null)).toEqual(null);
      expect(UtilsService.objectToCamelCase(undefined)).toEqual(undefined);
      expect(UtilsService.objectToCamelCase("test")).toEqual("test");
    });
  });

  describe("objectToSnakeCase", () => {
    it("should work", () => {
      expect(UtilsService.objectToSnakeCase({ fooBar: { tarCar: 2 } })).toEqual({ foo_bar: { tar_car: 2 } });
      expect(UtilsService.objectToSnakeCase(null)).toEqual(null);
      expect(UtilsService.objectToSnakeCase(undefined)).toEqual(undefined);
      expect(UtilsService.objectToSnakeCase("test")).toEqual("test");
    });
  });

  describe("slugify", () => {
    it("should work", () => {
      expect(UtilsService.slugify("helloThere")).toEqual("hellothere");
      expect(UtilsService.slugify("hello there")).toEqual("hello-there");
      expect(UtilsService.slugify("")).toEqual("");
      expect(UtilsService.slugify(null)).toEqual("");
      expect(UtilsService.slugify(undefined)).toEqual("");
    });
  });

  describe("isNumeric", () => {
    it("should work", () => {
      expect(UtilsService.isNumeric("a")).toBe(false);
      expect(UtilsService.isNumeric("1")).toBe(true);
      expect(UtilsService.isNumeric("5.5")).toBe(true);
      expect(UtilsService.isNumeric("-5.5")).toBe(true);
      expect(UtilsService.isNumeric("+5.5")).toBe(true);
      expect(UtilsService.isNumeric("-5")).toBe(true);
      expect(UtilsService.isNumeric("+5")).toBe(true);
      expect(UtilsService.isNumeric(null)).toBe(false);
      expect(UtilsService.isNumeric(undefined)).toBe(false);
    });
  });

  describe("isString", () => {
    it("should work", () => {
      expect(UtilsService.isString("a")).toBe(true);
      expect(UtilsService.isString("1")).toBe(true);
      expect(UtilsService.isString(1)).toBe(false);
      expect(UtilsService.isString(5.5)).toBe(false);
      expect(UtilsService.isString(null)).toBe(false);
      expect(UtilsService.isString(undefined)).toBe(false);
    });
  });

  describe("isObject", () => {
    it("should work", () => {
      expect(UtilsService.isObject({ a: 1 })).toBe(true);
      expect(UtilsService.isObject({})).toBe(true);
      expect(UtilsService.isObject([])).toBe(false);
      expect(UtilsService.isObject("hello")).toBe(false);
      expect(UtilsService.isObject(() => {})).toBe(false);
      expect(UtilsService.isObject(null)).toBe(false);
      expect(UtilsService.isObject(undefined)).toBe(false);
    });
  });

  describe("isUrl", () => {
    it("should be true for valid URLs", () => {
      expect(UtilsService.isUrl("astrobin.com")).toBe(true);
      expect(UtilsService.isUrl("www.astrobin.com")).toBe(true);
      expect(UtilsService.isUrl("http://www.astrobin.com")).toBe(true);
      expect(UtilsService.isUrl("https://www.astrobin.com")).toBe(true);
      expect(UtilsService.isUrl("https://www.astrobin.com/foo")).toBe(true);
      expect(UtilsService.isUrl("https://www.astrobin.com/foo/")).toBe(true);
      expect(UtilsService.isUrl("https://www.astrobin.com/foo/?a=b")).toBe(true);
      expect(UtilsService.isUrl("https://www.astrobin.com/foo/?a=b#bar")).toBe(true);
      expect(UtilsService.isUrl("http://userid:password@example.com:8080\n")).toBe(true);
    });

    it("should be false for invalid URLs", () => {
      expect(UtilsService.isUrl("www.astrobin")).toBe(false);
      expect(UtilsService.isUrl("astrobin")).toBe(false);
    });
  });

  describe("ensureUrlProtocol", () => {
    it("should not prefix if already contains a protocol", () => {
      expect(UtilsService.ensureUrlProtocol("http://www.astrobin.com")).toEqual("http://www.astrobin.com");
      expect(UtilsService.ensureUrlProtocol("https://www.astrobin.com")).toEqual("https://www.astrobin.com");
      expect(UtilsService.ensureUrlProtocol("ftp://www.astrobin.com")).toEqual("ftp://www.astrobin.com");
      expect(UtilsService.ensureUrlProtocol("ssh://www.astrobin.com")).toEqual("ssh://www.astrobin.com");
    });

    it("should prefix if it does not contains a protocol", () => {
      expect(UtilsService.ensureUrlProtocol("www.astrobin.com")).toEqual("http://www.astrobin.com");
      expect(UtilsService.ensureUrlProtocol("astrobin.com")).toEqual("http://astrobin.com");
    });
  });

  describe("shortenUrl", () => {
    it("should work", () => {
      expect(UtilsService.shortenUrl("https://www.astrobin.com/foo/bar/tar.jpg")).toEqual("astrobin.com/.../tar.jpg");
      expect(UtilsService.shortenUrl("ftp://www.astrobin.com/foo/bar/tar.jpg")).toEqual("astrobin.com/.../tar.jpg");
      expect(UtilsService.shortenUrl("https://www.astrobin.com/foo/bar")).toEqual("astrobin.com/.../bar");
      expect(UtilsService.shortenUrl("https://www.astrobin.com/foo/")).toEqual("astrobin.com/.../foo");
      expect(UtilsService.shortenUrl("https://www.astrobin.com/foo")).toEqual("astrobin.com/.../foo");
      expect(UtilsService.shortenUrl("https://www.astrobin.com")).toEqual("astrobin.com");
      expect(UtilsService.shortenUrl("www.astrobin.com")).toEqual("astrobin.com");
      expect(UtilsService.shortenUrl("http://www.astrobin.com")).toEqual("astrobin.com");
      expect(UtilsService.shortenUrl("ftp://www.astrobin.com")).toEqual("astrobin.com");
      expect(UtilsService.shortenUrl("astrobin.com")).toEqual("astrobin.com");
    });
  });

  describe("sortParent", () => {
    it("should handle corner cases", () => {
      expect(UtilsService.sortParent([])).toEqual([]);
      expect(UtilsService.sortParent(null)).toEqual(null);
      expect(UtilsService.sortParent(undefined)).toEqual(undefined);
    });

    it("should preserve the array when it's flat", () => {
      const array = [
        {
          id: 1,
          parent: null
        },
        {
          id: 2,
          parent: null
        }
      ];

      expect(UtilsService.sortParent(array)).toEqual(array);
    });

    it("should preserve the array when it's not flat but already sorted", () => {
      const array = [
        {
          id: 1,
          parent: null
        },
        {
          id: 2,
          parent: 1
        },
        {
          id: 3,
          parent: null
        }
      ];

      expect(UtilsService.sortParent(array)).toEqual(array);
    });

    it("should sort a non-flat array correctly", () => {
      const array = [
        {
          id: 1,
          parent: null
        },
        {
          id: 2,
          parent: null
        },
        {
          id: 3,
          parent: 1
        }
      ];

      const expected = [
        {
          id: 1,
          parent: null
        },
        {
          id: 3,
          parent: 1
        },
        {
          id: 2,
          parent: null
        }
      ];

      expect(UtilsService.sortParent(array)).toEqual(expected);
    });

    it("should sort a non-flat array correctly when the items have unconventional sorting", () => {
      const array = [
        {
          id: 1,
          parent: 2
        },
        {
          id: 2,
          parent: null
        },
        {
          id: 3,
          parent: null
        }
      ];

      const expected = [
        {
          id: 2,
          parent: null
        },
        {
          id: 1,
          parent: 2
        },
        {
          id: 3,
          parent: null
        }
      ];

      expect(UtilsService.sortParent(array)).toEqual(expected);
    });

    it("should disregard cyclical loops", () => {
      const array = [
        {
          id: 1,
          parent: 2
        },
        {
          id: 2,
          parent: 1
        },
        {
          id: 3,
          parent: null
        }
      ];

      const expected = [
        {
          id: 3,
          parent: null
        }
      ];

      expect(UtilsService.sortParent(array)).toEqual(expected);
    });
  });

  describe("sortObjectsByProperty", () => {
    it("should work", () => {
      expect(UtilsService.sortObjectsByProperty([{ a: 1 }, { a: 2 }], "a")).toEqual([{ a: 1 }, { a: 2 }]);
      expect(UtilsService.sortObjectsByProperty([{ a: 2 }, { a: 1 }], "a")).toEqual([{ a: 1 }, { a: 2 }]);
    });
  });

  describe("cloneValue", () => {
    it("should clone a primitive value", () => {
      expect(UtilsService.cloneValue(42)).toBe(42);
      expect(UtilsService.cloneValue("test")).toBe("test");
      expect(UtilsService.cloneValue(true)).toBe(true);
    });

    it("should clone null and undefined", () => {
      expect(UtilsService.cloneValue(null)).toBeNull();
      expect(UtilsService.cloneValue(undefined)).toBeUndefined();
    });

    it("should clone an array of primitives", () => {
      const array = [1, "test", true];
      const clonedArray = UtilsService.cloneValue(array);
      expect(clonedArray).toEqual(array);
      expect(clonedArray).not.toBe(array);
    });

    it("should clone an array of objects", () => {
      const array = [{ a: 1 }, { b: 2 }];
      const clonedArray = UtilsService.cloneValue(array);
      expect(clonedArray).toEqual(array);
      expect(clonedArray).not.toBe(array);
      expect(clonedArray[0]).not.toBe(array[0]);
    });

    it("should clone a plain object", () => {
      const obj = { a: 1, b: "test" };
      const clonedObj = UtilsService.cloneValue(obj);
      expect(clonedObj).toEqual(obj);
      expect(clonedObj).not.toBe(obj);
    });

    it("should clone a nested object", () => {
      const obj = { a: { b: 2 }, c: 3 };
      const clonedObj = UtilsService.cloneValue(obj);
      expect(clonedObj).toEqual(obj);
      expect(clonedObj).not.toBe(obj);
      expect(clonedObj.a).not.toBe(obj.a);
    });

    it("should clone an array with nested objects", () => {
      const array = [{ a: { b: 2 } }, { c: 3 }];
      const clonedArray = UtilsService.cloneValue(array);
      expect(clonedArray).toEqual(array);
      expect(clonedArray).not.toBe(array);
      expect(clonedArray[0].a).not.toBe(array[0].a);
    });
  });
});
