import { TestBed } from "@angular/core/testing";

import { PopNotificationsService } from "./pop-notifications.service";
import { ToastrModule } from "ngx-toastr";
import { TranslateModule } from "@ngx-translate/core";

describe("PopNotificationsService", () => {
  beforeEach(() => TestBed.configureTestingModule({
    imports: [
      ToastrModule.forRoot(),
      TranslateModule.forRoot(),
    ]
  }));

  it("should be created", () => {
    const service: PopNotificationsService = TestBed.get(PopNotificationsService);
    expect(service).toBeTruthy();
  });
});
