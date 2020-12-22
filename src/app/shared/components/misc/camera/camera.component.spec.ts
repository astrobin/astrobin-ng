import { ComponentFixture, TestBed } from "@angular/core/testing";

import { ComponentsModule } from "@shared/components/components.module";
import { MockBuilder } from "ng-mocks";
import { CameraComponent } from "./camera.component";

describe("CameraComponent", () => {
  let component: CameraComponent;
  let fixture: ComponentFixture<CameraComponent>;

  beforeEach(async () => {
    await MockBuilder(CameraComponent, ComponentsModule);
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CameraComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
