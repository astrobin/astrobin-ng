import { ComponentFixture, TestBed } from "@angular/core/testing";

import { initialState } from "@app/store/state";
import { IotdModule } from "@features/iotd/iotd.module";
import { provideMockStore } from "@ngrx/store/testing";
import { ImageGenerator } from "@shared/generators/image.generator";
import { MockBuilder } from "ng-mocks";
import { JudgementEntryComponent } from "./judgement-entry.component";
import { WindowRefService } from "@shared/services/window-ref.service";
import { CookieService } from "ngx-cookie";
import { AppModule } from "@app/app.module";

describe("JudgementEntryComponent", () => {
  let component: JudgementEntryComponent;
  let fixture: ComponentFixture<JudgementEntryComponent>;

  beforeEach(async () => {
    await MockBuilder(JudgementEntryComponent, IotdModule)
      .mock(AppModule, { export: true })
      .provide([WindowRefService, provideMockStore({ initialState }), CookieService]);
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(JudgementEntryComponent);
    component = fixture.componentInstance;
    component.entry = ImageGenerator.image() as any;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
