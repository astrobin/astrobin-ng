import { TestBed } from "@angular/core/testing";

import { UtilsService } from "./utils.service";

describe("UtilsService", () => {
  let service: UtilsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UtilsService);
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });

  describe("fileExtension", () => {
    it("should work", () => {
      expect(service.fileExtension("foo.txt")).toEqual("txt");
      expect(service.fileExtension("foo bar.txt")).toEqual("txt");
      expect(service.fileExtension("名称.txt")).toEqual("txt");
      expect(service.fileExtension("foo.bar.txt")).toEqual("txt");
      expect(service.fileExtension("foo")).toBeUndefined();
      expect(service.fileExtension("")).toBeUndefined();
      expect(service.fileExtension(null)).toBeUndefined();
      expect(service.fileExtension(undefined)).toBeUndefined();
    });
  });
});
