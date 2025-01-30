import { TestBed } from "@angular/core/testing";

import { FormlyFieldService } from "./formly-field.service";
import { MockBuilder } from "ng-mocks";
import { AppModule } from "@app/app.module";

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
