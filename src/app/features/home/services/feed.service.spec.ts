import { TestBed } from "@angular/core/testing";
import { AppModule } from "@app/app.module";
import { MockBuilder } from "ng-mocks";

import { FeedService } from "./feed.service";

describe("FeedService", () => {
  let service: FeedService;

  beforeEach(async () => {
    await MockBuilder(FeedService, AppModule);
    service = TestBed.inject(FeedService);
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });
});
