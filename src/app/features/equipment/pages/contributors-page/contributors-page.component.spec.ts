import { ComponentFixture, TestBed } from "@angular/core/testing";

import { ContributorsPageComponent } from "./contributors-page.component";
import { MockBuilder } from "ng-mocks";
import { AppModule } from "@app/app.module";
import { provideMockStore } from "@ngrx/store/testing";
import { initialState } from "@app/store/state";

describe("ContributorsPageComponent", () => {
  let component: ContributorsPageComponent;
  let fixture: ComponentFixture<ContributorsPageComponent>;

  beforeEach(async () => {
    await MockBuilder(ContributorsPageComponent, AppModule).provide([provideMockStore({ initialState })]);
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ContributorsPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
