import type { ComponentFixture } from "@angular/core/testing";
import { TestBed } from "@angular/core/testing";
import { AppModule } from "@app/app.module";
import { initialMainState } from "@app/store/state";
import { UtilsService } from "@core/services/utils/utils.service";
import { EquipmentModule } from "@features/equipment/equipment.module";
import { provideMockActions } from "@ngrx/effects/testing";
import { provideMockStore } from "@ngrx/store/testing";
import { BrandEditorCardComponent } from "@shared/components/equipment/editors/brand-editor-card/brand-editor-card.component";
import { MockBuilder } from "ng-mocks";
import { ReplaySubject } from "rxjs";

import { SoftwareEditorComponent } from "./software-editor.component";

describe("SoftwareEditorComponent", () => {
  let component: SoftwareEditorComponent;
  let fixture: ComponentFixture<SoftwareEditorComponent>;

  beforeEach(async () => {
    await MockBuilder(SoftwareEditorComponent, EquipmentModule)
      .mock(AppModule, { export: true })
      .provide([
        provideMockStore({ initialState: initialMainState }),
        provideMockActions(() => new ReplaySubject<any>()),
        UtilsService
      ])
      .mock(BrandEditorCardComponent);
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SoftwareEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
