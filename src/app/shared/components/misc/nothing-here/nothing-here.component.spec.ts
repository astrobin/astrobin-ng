import { ComponentFixture, TestBed } from "@angular/core/testing";

import { NothingHereComponent } from "./nothing-here.component";
import { MockBuilder } from "ng-mocks";
import { AppModule } from "@app/app.module";

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
