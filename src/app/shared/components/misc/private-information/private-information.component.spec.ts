import { ComponentFixture, TestBed } from "@angular/core/testing";
import { AppModule } from "@app/app.module";
import { MockBuilder } from "ng-mocks";

import { PrivateInformationComponent } from "./private-information.component";

describe("NothingHereComponent", () => {
  let component: PrivateInformationComponent;
  let fixture: ComponentFixture<PrivateInformationComponent>;

  beforeEach(async () => {
    await MockBuilder(PrivateInformationComponent, AppModule);
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PrivateInformationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
