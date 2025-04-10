import type { ComponentFixture } from "@angular/core/testing";
import { TestBed } from "@angular/core/testing";
import { AppModule } from "@app/app.module";
import { initialMainState } from "@app/store/state";
import { UtilsService } from "@core/services/utils/utils.service";
import type { CameraInterface } from "@features/equipment/types/camera.interface";
import { provideMockActions } from "@ngrx/effects/testing";
import { provideMockStore } from "@ngrx/store/testing";
import { MockBuilder } from "ng-mocks";
import { ReplaySubject } from "rxjs";

import { BaseItemEditorComponent } from "./base-item-editor.component";

describe("BaseEquipmentItemEditorComponent", () => {
  let component: BaseItemEditorComponent<CameraInterface>;
  let fixture: ComponentFixture<BaseItemEditorComponent<CameraInterface>>;

  beforeEach(async () => {
    await MockBuilder(BaseItemEditorComponent, AppModule).provide([
      provideMockStore({ initialState: initialMainState }),
      provideMockActions(() => new ReplaySubject<any>()),
      UtilsService
    ]);
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BaseItemEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
