import { ComponentFixture, TestBed } from "@angular/core/testing";

import { initialState } from "@app/store/state";
import { IotdModule } from "@features/iotd/iotd.module";
import { provideMockStore } from "@ngrx/store/testing";
import { ImageGenerator } from "@shared/generators/image.generator";
import { MockBuilder } from "ng-mocks";
import { ReviewEntryComponent } from "./review-entry.component";
import { WindowRefService } from "@shared/services/window-ref.service";
import { CookieService } from "ngx-cookie";
import { AppModule } from "@app/app.module";

describe("ReviewEntryComponent", () => {
  let component: ReviewEntryComponent;
  let fixture: ComponentFixture<ReviewEntryComponent>;

  beforeEach(async () => {
    await MockBuilder(ReviewEntryComponent, IotdModule)
      .mock(AppModule, { export: true })
      .provide([WindowRefService, provideMockStore({ initialState }), CookieService]);
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ReviewEntryComponent);
    component = fixture.componentInstance;
    component.entry = ImageGenerator.image();
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
