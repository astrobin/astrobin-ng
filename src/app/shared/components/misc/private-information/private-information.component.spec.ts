import { ComponentFixture, TestBed } from "@angular/core/testing";

import { PrivateInformationComponent } from "./private-information.component";
import { MockBuilder } from "ng-mocks";
import { AppModule } from "@app/app.module";

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
