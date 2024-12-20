import { ComponentFixture, TestBed } from "@angular/core/testing";

import { IotdComponent } from "./iotd.component";
import { AppModule } from "@app/app.module";
import { MockBuilder } from "ng-mocks";
import { provideMockStore } from "@ngrx/store/testing";
import { initialMainState } from "@app/store/state";
import { of } from "rxjs";
import { IotdGenerator } from "@shared/generators/iotd.generator";

describe("IotdComponent", () => {
  let component: IotdComponent;
  let fixture: ComponentFixture<IotdComponent>;

  beforeEach(async () => {
    await MockBuilder(IotdComponent, AppModule).provide([
      provideMockStore({ initialState: initialMainState })
    ]);
    fixture = TestBed.createComponent(IotdComponent);
    component = fixture.componentInstance;

    jest.spyOn(component.iotdApiService, "getCurrentIotd").mockReturnValueOnce(of(IotdGenerator.iotd()));

    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
