import { TestBed } from "@angular/core/testing";
import { AppModule } from "@app/app.module";
import { MockBuilder } from "ng-mocks";
import { PopNotificationsService } from "./pop-notifications.service";

describe("PopNotificationsService", () => {
  let service: PopNotificationsService;

  beforeEach(async () => {
    await MockBuilder(PopNotificationsService, AppModule);
    service = TestBed.inject(PopNotificationsService);
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });

  describe("success", () => {
    beforeEach(() => {
      jest.spyOn(service.toastrService, "success");
    });

    it("should defer to toastr module, with title", () => {
      service.success("message", "title");

      expect(service.toastrService.success).toHaveBeenCalledWith("message", "title", undefined);
    });

    it("should defer to toastr module, without title", () => {
      service.success("message");

      expect(service.toastrService.success).toHaveBeenCalledWith("message", "Success!", undefined);
    });
  });

  describe("info", () => {
    beforeEach(() => {
      jest.spyOn(service.toastrService, "info");
    });

    it("should defer to toastr module, with title", () => {
      service.info("message", "title");

      expect(service.toastrService.info).toHaveBeenCalledWith("message", "title", undefined);
    });

    it("should defer to toastr module, without title", () => {
      service.info("message");

      expect(service.toastrService.info).toHaveBeenCalledWith("message", "Info", undefined);
    });
  });

  describe("warning", () => {
    beforeEach(() => {
      jest.spyOn(service.toastrService, "warning");
    });

    it("should defer to toastr module, with title", () => {
      service.warning("message", "title");

      expect(service.toastrService.warning).toHaveBeenCalledWith("message", "title", undefined);
    });

    it("should defer to toastr module, without title", () => {
      service.warning("message");

      expect(service.toastrService.warning).toHaveBeenCalledWith("message", "Warning!", undefined);
    });
  });

  describe("error", () => {
    beforeEach(() => {
      jest.spyOn(service.toastrService, "error");
    });

    it("should defer to toastr module, with title", () => {
      service.error("message", "title");

      expect(service.toastrService.error).toHaveBeenCalledWith("message", "title", undefined);
    });

    it("should defer to toastr module, without title", () => {
      service.error("message");

      expect(service.toastrService.error).toHaveBeenCalledWith("message", "Error!", undefined);
    });
  });
});
