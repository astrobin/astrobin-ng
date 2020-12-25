import { ComponentFixture, TestBed } from "@angular/core/testing";

import { initialState } from "@app/store/state";
import { provideMockStore } from "@ngrx/store/testing";
import { ComponentsModule } from "@shared/components/components.module";
import { MockBuilder } from "ng-mocks";
import { CameraComponent } from "./camera.component";

describe("CameraComponent", () => {
  let component: CameraComponent;
  let fixture: ComponentFixture<CameraComponent>;

  beforeEach(async () => {
    await MockBuilder(CameraComponent, ComponentsModule).provide(provideMockStore({ initialState }));
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
