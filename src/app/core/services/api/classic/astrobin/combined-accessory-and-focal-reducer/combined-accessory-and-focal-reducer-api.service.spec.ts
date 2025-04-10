import { HttpClientModule } from "@angular/common/http";
import { HttpClientTestingModule } from "@angular/common/http/testing";
import { TestBed } from "@angular/core/testing";
import { AppModule } from "@app/app.module";
import { MockBuilder } from "ng-mocks";

import { CombinedAccessoryAndFocalReducerApiService } from "./combined-accessory-and-focal-reducer-api.service";

describe("FocalReducerApiService", () => {
  let service: CombinedAccessoryAndFocalReducerApiService;

  beforeEach(async () => {
    await MockBuilder(CombinedAccessoryAndFocalReducerApiService, AppModule).replace(
      HttpClientModule,
      HttpClientTestingModule
    );
    service = TestBed.inject(CombinedAccessoryAndFocalReducerApiService);
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });
});
