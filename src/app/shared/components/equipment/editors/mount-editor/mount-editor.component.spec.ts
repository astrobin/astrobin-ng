import { ComponentFixture, TestBed } from "@angular/core/testing";
import { AppModule } from "@app/app.module";
import { initialMainState } from "@app/store/state";
import { UtilsService } from "@core/services/utils/utils.service";
import { EquipmentModule } from "@features/equipment/equipment.module";
import { provideMockActions } from "@ngrx/effects/testing";
import { provideMockStore } from "@ngrx/store/testing";
import { BrandEditorCardComponent } from "@shared/components/equipment/editors/brand-editor-card/brand-editor-card.component";
import { MockBuilder } from "ng-mocks";
import { ReplaySubject } from "rxjs";

import { MountEditorComponent } from "./mount-editor.component";

describe("MountEditorComponent", () => {
  let component: MountEditorComponent;
  let fixture: ComponentFixture<MountEditorComponent>;

  beforeEach(async () => {
    await MockBuilder(MountEditorComponent, EquipmentModule)
      .mock(AppModule, { export: true })
      .provide([
        provideMockStore({ initialState: initialMainState }),
        provideMockActions(() => new ReplaySubject<any>()),
        UtilsService
      ])
      .mock(BrandEditorCardComponent);
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MountEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
