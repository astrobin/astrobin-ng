import type { ComponentFixture } from "@angular/core/testing";
import { TestBed } from "@angular/core/testing";
import { AppModule } from "@app/app.module";
import { initialMainState } from "@app/store/state";
import { provideMockStore } from "@ngrx/store/testing";
import { BrandEditorFormComponent } from "@shared/components/equipment/editors/brand-editor-form/brand-editor-form.component";
import { MockBuilder } from "ng-mocks";

import { BrandEditorCardComponent } from "./brand-editor-card.component";

describe("BrandEditorCardComponent", () => {
  let component: BrandEditorCardComponent;
  let fixture: ComponentFixture<BrandEditorCardComponent>;

  beforeEach(async () => {
    await MockBuilder(BrandEditorCardComponent, AppModule)
      .mock(BrandEditorFormComponent)
      .provide(provideMockStore({ initialState: initialMainState }));
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
