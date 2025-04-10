import { ComponentFixture, TestBed } from "@angular/core/testing";
import { AppModule } from "@app/app.module";
import { initialMainState } from "@app/store/state";
import { provideMockActions } from "@ngrx/effects/testing";
import { provideMockStore } from "@ngrx/store/testing";
import { MockBuilder } from "ng-mocks";
import { ReplaySubject } from "rxjs";

import { TogglePropertyComponent } from "./toggle-property.component";

describe("TogglePropertyComponent", () => {
  let component: TogglePropertyComponent;
  let fixture: ComponentFixture<TogglePropertyComponent>;

  beforeEach(async () => {
    await MockBuilder(TogglePropertyComponent, AppModule).provide([
      provideMockStore({ initialState: initialMainState }),
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
