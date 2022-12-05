import { TestBed } from "@angular/core/testing";

import { IotdModule } from "@features/iotd/iotd.module";
import { MockBuilder } from "ng-mocks";
import { IotdApiService } from "./iotd-api.service";
import { HttpClientModule } from "@angular/common/http";
import { HttpClientTestingModule } from "@angular/common/http/testing";

describe("IotdApiService", () => {
  let service: IotdApiService;

  beforeEach(async () => {
    await MockBuilder(IotdApiService, IotdModule).replace(HttpClientModule, HttpClientTestingModule);
    service = TestBed.inject(IotdApiService);
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });
});
