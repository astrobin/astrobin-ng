import { ComponentFixture, TestBed } from "@angular/core/testing";

import { SubmissionQueueComponent } from "./submission-queue.component";

describe("SubmissionQueueComponent", () => {
  let component: SubmissionQueueComponent;
  let fixture: ComponentFixture<SubmissionQueueComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SubmissionQueueComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SubmissionQueueComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
