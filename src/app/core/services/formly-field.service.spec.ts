import { TestBed } from "@angular/core/testing";
import { AppModule } from "@app/app.module";
import { MockBuilder } from "ng-mocks";

import { FormlyFieldService } from "./formly-field.service";

describe("FormlyFieldService", () => {
  let service: FormlyFieldService;

  beforeEach(async () => {
    await MockBuilder(FormlyFieldService, AppModule);
    service = TestBed.inject(FormlyFieldService);
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });
});
