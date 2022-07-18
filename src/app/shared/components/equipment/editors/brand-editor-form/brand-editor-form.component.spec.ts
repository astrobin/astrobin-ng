import { ComponentFixture, TestBed } from "@angular/core/testing";

import { BrandEditorFormComponent } from "./brand-editor-form.component";
import { MockBuilder } from "ng-mocks";
import { EquipmentModule } from "@features/equipment/equipment.module";
import { provideMockStore } from "@ngrx/store/testing";
import { initialState } from "@app/store/state";
import { AppModule } from "@app/app.module";
import { UtilsService } from "@shared/services/utils/utils.service";

describe("BrandEditorComponent", () => {
  let component: BrandEditorFormComponent;
  let fixture: ComponentFixture<BrandEditorFormComponent>;

  beforeEach(async () => {
    await MockBuilder(BrandEditorFormComponent, EquipmentModule)
      .mock(AppModule)
      .provide([provideMockStore({ initialState }), UtilsService]);
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BrandEditorFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
