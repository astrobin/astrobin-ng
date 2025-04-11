import { TestBed } from "@angular/core/testing";
import { AppModule } from "@app/app.module";
import { GearUserInfoApiService } from "@core/services/api/classic/astrobin/gear-user-info/gear-user-info-api.service";
import { MockBuilder } from "ng-mocks";

import { GearService } from "./gear.service";

describe("GearService", () => {
  let service: GearService;

  beforeEach(async () => {
    await MockBuilder(GearService, AppModule).mock(GearUserInfoApiService);
    service = TestBed.inject(GearService);
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });

  describe("getDisplayName", () => {
    it("should be just the name if the make is repeated in the name", () => {
      expect(service.getDisplayName("foo", "foo bar")).toEqual("foo bar");
    });

    it("should be the make plus the name", () => {
      expect(service.getDisplayName("foo", "bar")).toEqual("foo bar");
    });

    it("should work if there's no make", () => {
      expect(service.getDisplayName("", "bar")).toEqual("bar");
      expect(service.getDisplayName(null, "bar")).toEqual("bar");
      expect(service.getDisplayName(undefined, "bar")).toEqual("bar");
    });

    it("should work if there's no name", () => {
      expect(service.getDisplayName("bar", "")).toEqual("bar");
      expect(service.getDisplayName("bar", null)).toEqual("bar");
      expect(service.getDisplayName("bar", undefined)).toEqual("bar");
    });

    it("should trim the result", () => {
      expect(service.getDisplayName(" foo", "bar ")).toEqual("foo bar");
      expect(service.getDisplayName("foo ", " bar ")).toEqual("foo bar");
    });
  });

  describe("getProperAttributes", () => {
    it("should work", () => {
      expect(service.getProperAttributes({ id: 1, foo: "bar", tar: "car", migrationFlagModeratorLock: 1 })).toEqual([
        "foo",
        "tar"
      ]);
    });
  });
});
