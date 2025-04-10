import { ComponentFixture, TestBed } from "@angular/core/testing";
import { AppModule } from "@app/app.module";
import { initialMainState } from "@app/store/state";
import { UtilsService } from "@core/services/utils/utils.service";
import { provideMockStore } from "@ngrx/store/testing";
import { MockBuilder } from "ng-mocks";

import { CameraComponent } from "./camera.component";

describe("CameraComponent", () => {
  let component: CameraComponent;
  let fixture: ComponentFixture<CameraComponent>;

  beforeEach(async () => {
    await MockBuilder(CameraComponent, AppModule).provide([
      provideMockStore({ initialState: initialMainState }),
      UtilsService
    ]);
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CameraComponent);
    component = fixture.componentInstance;
    component.id = 1;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
