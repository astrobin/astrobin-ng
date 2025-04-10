import type { ComponentFixture } from "@angular/core/testing";
import { TestBed } from "@angular/core/testing";
import { AppModule } from "@app/app.module";
import { initialMainState } from "@app/store/state";
import { provideMockStore } from "@ngrx/store/testing";
import { IotdGenerator } from "@shared/generators/iotd.generator";
import { MockBuilder } from "ng-mocks";
import { of } from "rxjs";

import { IotdComponent } from "./iotd.component";

describe("IotdComponent", () => {
  let component: IotdComponent;
  let fixture: ComponentFixture<IotdComponent>;

  beforeEach(async () => {
    await MockBuilder(IotdComponent, AppModule).provide([provideMockStore({ initialState: initialMainState })]);
    fixture = TestBed.createComponent(IotdComponent);
    component = fixture.componentInstance;

    jest.spyOn(component.iotdApiService, "getCurrentIotd").mockReturnValueOnce(of(IotdGenerator.iotd()));

    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
