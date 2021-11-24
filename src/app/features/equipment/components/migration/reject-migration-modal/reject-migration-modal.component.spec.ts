import { ComponentFixture, TestBed } from "@angular/core/testing";

import { RejectMigrationModalComponent } from "./reject-migration-modal.component";
import { MockBuilder } from "ng-mocks";
import { provideMockStore } from "@ngrx/store/testing";
import { initialState } from "@app/store/state";
import { provideMockActions } from "@ngrx/effects/testing";
import { ReplaySubject } from "rxjs";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import { MigrationFlag } from "@shared/services/api/classic/astrobin/migratable-gear-item-api.service.interface";
import { AppModule } from "@app/app.module";

describe("RejectMigrationModalComponent", () => {
  let component: RejectMigrationModalComponent;
  let fixture: ComponentFixture<RejectMigrationModalComponent>;

  beforeEach(async () => {
    await MockBuilder(RejectMigrationModalComponent, AppModule).provide([
      NgbActiveModal,
      provideMockStore({ initialState }),
      provideMockActions(() => new ReplaySubject<any>())
    ]);
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RejectMigrationModalComponent);
    component = fixture.componentInstance;
    component.migrationStrategy = {
      migrationFlag: MigrationFlag.DIY
    };
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
