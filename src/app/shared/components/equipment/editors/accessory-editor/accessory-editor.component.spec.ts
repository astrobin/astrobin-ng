import { ComponentFixture, TestBed } from "@angular/core/testing";

import { AccessoryEditorComponent } from "./accessory-editor.component";
import { MockBuilder } from "ng-mocks";
import { provideMockStore } from "@ngrx/store/testing";
import { initialState } from "@app/store/state";
import { provideMockActions } from "@ngrx/effects/testing";
import { ReplaySubject } from "rxjs";
import { AppModule } from "@app/app.module";
import { BrandEditorCardComponent } from "@shared/components/equipment/editors/brand-editor-card/brand-editor-card.component";
import { UtilsService } from "@shared/services/utils/utils.service";

describe("AccessoryEditorComponent", () => {
  let component: AccessoryEditorComponent;
  let fixture: ComponentFixture<AccessoryEditorComponent>;

  beforeEach(async () => {
    await MockBuilder(AccessoryEditorComponent, AppModule)
      .provide([provideMockStore({ initialState }), provideMockActions(() => new ReplaySubject<any>()), UtilsService])
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
