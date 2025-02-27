import { EnsureUrlProtocolPipe } from "./ensure-url-protocol.pipe";
import { UtilsService } from "@core/services/utils/utils.service";

describe("EnsureUrlProtocolPipe", () => {
  let pipe: EnsureUrlProtocolPipe;

  beforeEach(() => {
    pipe = new EnsureUrlProtocolPipe();
  });

  it("create an instance", () => {
    expect(pipe).toBeTruthy();
  });

  it("should delegate to AstroUtilsService", () => {
    jest.spyOn(UtilsService, "ensureUrlProtocol");

    pipe.transform("foo");

    expect(UtilsService.ensureUrlProtocol).toHaveBeenCalledWith("foo");
  });
});
