import { ComponentFixture, TestBed } from "@angular/core/testing";

import { MigrationToolComponent } from "./migration-tool.component";

describe("MigrationToolComponent", () => {
  let component: MigrationToolComponent;
  let fixture: ComponentFixture<MigrationToolComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MigrationToolComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MigrationToolComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
