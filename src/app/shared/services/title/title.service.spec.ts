import { TestBed } from "@angular/core/testing";

import { TitleService } from "./title.service";

describe("TitleService", () => {
  let service: TitleService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TitleService);
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });

  describe("setTitle", () => {
    it("should append the site's name to the title", () => {
      jest.spyOn(service.titleService, "setTitle");

      service.setTitle("foo");

      expect(service.titleService.setTitle).toHaveBeenCalledWith("foo - AstroBin");
    });
  });
});
