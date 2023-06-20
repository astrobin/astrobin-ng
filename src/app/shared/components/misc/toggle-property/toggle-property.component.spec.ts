import { ComponentFixture, TestBed } from "@angular/core/testing";

import { TogglePropertyComponent } from "./toggle-property.component";
import { MockBuilder } from "ng-mocks";
import { AppModule } from "@app/app.module";
import { provideMockStore } from "@ngrx/store/testing";
import { initialState } from "@app/store/state";
import { provideMockActions } from "@ngrx/effects/testing";
import { ReplaySubject } from "rxjs";

describe("TogglePropertyComponent", () => {
  let component: TogglePropertyComponent;
  let fixture: ComponentFixture<TogglePropertyComponent>;

  beforeEach(async () => {
    await MockBuilder(TogglePropertyComponent, AppModule).provide([
      provideMockStore({ initialState }),
      provideMockActions(() => new ReplaySubject<any>())
    ]);

    fixture = TestBed.createComponent(TogglePropertyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
