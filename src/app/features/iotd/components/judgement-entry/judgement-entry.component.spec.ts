import { ComponentFixture, TestBed } from "@angular/core/testing";
import { AppModule } from "@app/app.module";
import { initialMainState } from "@app/store/state";
import { WindowRefService } from "@core/services/window-ref.service";
import { IotdModule } from "@features/iotd/iotd.module";
import { provideMockStore } from "@ngrx/store/testing";
import { ImageGenerator } from "@shared/generators/image.generator";
import { MockBuilder } from "ng-mocks";
import { CookieService } from "ngx-cookie";

import { JudgementEntryComponent } from "./judgement-entry.component";

describe("JudgementEntryComponent", () => {
  let component: JudgementEntryComponent;
  let fixture: ComponentFixture<JudgementEntryComponent>;

  beforeEach(async () => {
    await MockBuilder(JudgementEntryComponent, IotdModule)
      .mock(AppModule, { export: true })
      .provide([WindowRefService, provideMockStore({ initialState: initialMainState }), CookieService]);
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
