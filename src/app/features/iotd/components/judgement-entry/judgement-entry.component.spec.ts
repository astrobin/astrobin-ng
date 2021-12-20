import { ComponentFixture, TestBed } from "@angular/core/testing";

import { initialState } from "@app/store/state";
import { IotdModule } from "@features/iotd/iotd.module";
import { provideMockStore } from "@ngrx/store/testing";
import { ImageGenerator } from "@shared/generators/image.generator";
import { MockBuilder } from "ng-mocks";
import { JudgementEntryComponent } from "./judgement-entry.component";
import { WindowRefService } from "@shared/services/window-ref.service";

describe("JudgementEntryComponent", () => {
  let component: JudgementEntryComponent;
  let fixture: ComponentFixture<JudgementEntryComponent>;

  beforeEach(async () => {
    await MockBuilder(JudgementEntryComponent, IotdModule).provide([
      WindowRefService,
      provideMockStore({ initialState })
    ]);
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(JudgementEntryComponent);
    component = fixture.componentInstance;
    component.entry = ImageGenerator.image();
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
