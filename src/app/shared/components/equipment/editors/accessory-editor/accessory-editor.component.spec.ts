import { ComponentFixture, TestBed } from "@angular/core/testing";
import { AppModule } from "@app/app.module";
import { initialMainState } from "@app/store/state";
import { UtilsService } from "@core/services/utils/utils.service";
import { provideMockActions } from "@ngrx/effects/testing";
import { provideMockStore } from "@ngrx/store/testing";
import { BrandEditorCardComponent } from "@shared/components/equipment/editors/brand-editor-card/brand-editor-card.component";
import { MockBuilder } from "ng-mocks";
import { ReplaySubject } from "rxjs";

import { AccessoryEditorComponent } from "./accessory-editor.component";

describe("AccessoryEditorComponent", () => {
  let component: AccessoryEditorComponent;
  let fixture: ComponentFixture<AccessoryEditorComponent>;

  beforeEach(async () => {
    await MockBuilder(AccessoryEditorComponent, AppModule)
      .provide([
        provideMockStore({ initialState: initialMainState }),
        provideMockActions(() => new ReplaySubject<any>()),
        UtilsService
      ])
      .mock(BrandEditorCardComponent);
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AccessoryEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
