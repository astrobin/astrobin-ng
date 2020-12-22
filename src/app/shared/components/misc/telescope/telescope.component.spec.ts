import { ComponentFixture, TestBed } from "@angular/core/testing";

import { ComponentsModule } from "@shared/components/components.module";
import { MockBuilder } from "ng-mocks";
import { TelescopeComponent } from "./telescope.component";

describe("TelescopeComponent", () => {
  let component: TelescopeComponent;
  let fixture: ComponentFixture<TelescopeComponent>;

  beforeEach(async () => {
    await MockBuilder(TelescopeComponent, ComponentsModule);
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TelescopeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
