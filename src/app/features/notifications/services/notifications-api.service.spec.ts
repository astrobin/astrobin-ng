import { HttpClientTestingModule } from "@angular/common/http/testing";
import { TestBed } from "@angular/core/testing";
import { NotificationsApiService } from "./notifications-api.service";

describe("NotificationsApiService", () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule]
    })
  );

  it("should be created", () => {
    const service: NotificationsApiService = TestBed.inject(NotificationsApiService);
    expect(service).toBeTruthy();
  });
});
