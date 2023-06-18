import { ComponentFixture, TestBed } from "@angular/core/testing";

import { TogglePropertyComponent } from "./toggle-property.component";
import { MockBuilder } from "ng-mocks";
import { AppModule } from "@app/app.module";

describe("TogglePropertyComponent", () => {
  let component: TogglePropertyComponent;
  let fixture: ComponentFixture<TogglePropertyComponent>;

  beforeEach(async () => {
    await MockBuilder(TogglePropertyComponent, AppModule);

    fixture = TestBed.createComponent(TogglePropertyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
