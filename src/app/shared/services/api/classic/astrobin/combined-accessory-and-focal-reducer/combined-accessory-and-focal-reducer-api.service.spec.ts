import { TestBed } from "@angular/core/testing";
import { CombinedAccessoryAndFocalReducerApiService } from "./combined-accessory-and-focal-reducer-api.service";
import { MockBuilder } from "ng-mocks";
import { AppModule } from "@app/app.module";

describe("FocalReducerApiService", () => {
  let service: CombinedAccessoryAndFocalReducerApiService;

  beforeEach(async () => {
    await MockBuilder(CombinedAccessoryAndFocalReducerApiService, AppModule);
    service = TestBed.inject(CombinedAccessoryAndFocalReducerApiService);
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });
});
