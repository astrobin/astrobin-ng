import { TestBed } from "@angular/core/testing";
import { provideMockActions } from "@ngrx/effects/testing";
import { Observable } from "rxjs";
import { IotdEffects } from "./iotd.effects";

describe("IotdEffects", () => {
  let actions$: Observable<any>;
  let effects: IotdEffects;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [IotdEffects, provideMockActions(() => actions$)]
    });

    effects = TestBed.inject(IotdEffects);
  });

  it("should be created", () => {
    expect(effects).toBeTruthy();
  });
});
