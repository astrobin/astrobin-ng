import { TestBed } from "@angular/core/testing";
import { CombinedAccessoryAndFocalReducerApiService } from "./combined-accessory-and-focal-reducer-api.service";
import { MockBuilder } from "ng-mocks";
import { AppModule } from "@app/app.module";
import { HttpClientTestingModule } from "@angular/common/http/testing";
import { HttpClientModule } from "@angular/common/http";

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
