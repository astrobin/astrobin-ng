import { ComponentFixture, TestBed } from "@angular/core/testing";

import { BrandEditorCardComponent } from "./brand-editor-card.component";
import { MockBuilder } from "ng-mocks";
import { AppModule } from "@app/app.module";
import { BrandEditorFormComponent } from "@shared/components/equipment/editors/brand-editor-form/brand-editor-form.component";
import { provideMockStore } from "@ngrx/store/testing";
import { initialState } from "@app/store/state";

describe("BrandEditorCardComponent", () => {
  let component: BrandEditorCardComponent;
  let fixture: ComponentFixture<BrandEditorCardComponent>;

  beforeEach(async () => {
    await MockBuilder(BrandEditorCardComponent, AppModule)
      .mock(BrandEditorFormComponent)
      .provide(provideMockStore({ initialState }));
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BrandEditorCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
