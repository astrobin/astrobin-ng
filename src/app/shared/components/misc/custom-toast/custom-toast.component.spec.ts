import { ComponentFixture, TestBed } from "@angular/core/testing";

import { CustomToastComponent } from "./custom-toast.component";
import { MockBuilder } from "ng-mocks";
import { ApiModule } from "@shared/services/api/api.module";

describe("CustomToastComponent", () => {
  let component: CustomToastComponent;
  let fixture: ComponentFixture<CustomToastComponent>;

  beforeEach(async () => {
    await MockBuilder(CustomToastComponent, ApiModule);
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CustomToastComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
