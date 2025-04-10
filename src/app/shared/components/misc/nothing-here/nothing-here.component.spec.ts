import { ComponentFixture, TestBed } from "@angular/core/testing";
import { AppModule } from "@app/app.module";
import { MockBuilder } from "ng-mocks";

import { NothingHereComponent } from "./nothing-here.component";

describe("NothingHereComponent", () => {
  let component: NothingHereComponent;
  let fixture: ComponentFixture<NothingHereComponent>;

  beforeEach(async () => {
    await MockBuilder(NothingHereComponent, AppModule);
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NothingHereComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
