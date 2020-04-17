import { TestBed } from "@angular/core/testing";
import { WindowRefService } from "@lib/services/window-ref.service";

describe(`WindowRefService`, () => {
  let service: WindowRefService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [WindowRefService]
    });
    service = TestBed.inject(WindowRefService);
  });

  it("should get the window", () => {
    expect(service.nativeWindow).not.toBeUndefined();
  });
});
