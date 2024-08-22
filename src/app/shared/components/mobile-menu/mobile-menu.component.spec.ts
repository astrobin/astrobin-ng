import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MobileMenuComponent } from './mobile-menu.component';
import { initialMainState } from "@app/store/state";
import { MockBuilder } from "ng-mocks";
import { AppModule } from "@app/app.module";
import { provideMockStore } from "@ngrx/store/testing";

describe('MobileMenuComponent', () => {
  let component: MobileMenuComponent;
  let fixture: ComponentFixture<MobileMenuComponent>;

  beforeEach(async () => {
    await MockBuilder(MobileMenuComponent, AppModule).provide([
      provideMockStore({ initialState: initialMainState })
    ]);

    fixture = TestBed.createComponent(MobileMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
