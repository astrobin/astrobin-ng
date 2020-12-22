import { ComponentFixture, TestBed } from "@angular/core/testing";

import { ComponentsModule } from "@shared/components/components.module";
import { MockBuilder } from "ng-mocks";
import { RefreshButtonComponent } from "./refresh-button.component";

describe("RefreshButtonComponent", () => {
  let component: RefreshButtonComponent;
  let fixture: ComponentFixture<RefreshButtonComponent>;

  beforeEach(async () => {
    await MockBuilder(RefreshButtonComponent, ComponentsModule);
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RefreshButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
