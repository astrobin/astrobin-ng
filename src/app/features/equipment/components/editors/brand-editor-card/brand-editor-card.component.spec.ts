import { ComponentFixture, TestBed } from "@angular/core/testing";

import { BrandEditorCardComponent } from "./brand-editor-card.component";
import { MockBuilder } from "ng-mocks";
import { AppModule } from "@app/app.module";
import { BrandEditorFormComponent } from "@features/equipment/components/editors/brand-editor-form/brand-editor-form.component";

describe("BrandEditorCardComponent", () => {
  let component: BrandEditorCardComponent;
  let fixture: ComponentFixture<BrandEditorCardComponent>;

  beforeEach(async () => {
    await MockBuilder(BrandEditorCardComponent, AppModule).mock(BrandEditorFormComponent);
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
