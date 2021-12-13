import { ComponentFixture, TestBed } from "@angular/core/testing";

import { initialState } from "@app/store/state";
import { IotdModule } from "@features/iotd/iotd.module";
import { provideMockStore } from "@ngrx/store/testing";
import { ImageGenerator } from "@shared/generators/image.generator";
import { MockBuilder } from "ng-mocks";
import { JudgementEntryComponent } from "./judgement-entry.component";

describe("JudgementEntryComponent", () => {
  let component: JudgementEntryComponent;
  let fixture: ComponentFixture<JudgementEntryComponent>;

  beforeEach(async () => {
    await MockBuilder(JudgementEntryComponent, IotdModule).provide(provideMockStore({ initialState }));
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
