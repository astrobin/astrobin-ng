import { ChangeDetectionStrategy, Component, Input, OnChanges, SimpleChanges } from "@angular/core";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { BehaviorSubject } from "rxjs";
import { delay, distinctUntilChanged } from "rxjs/operators";

@Component({
  selector: "astrobin-loading-indicator",
  template: `
    <div
      *ngIf="(shouldShowProgress$ | async) && progress !== undefined && progress > 0 && progress < 100; else noProgress"
      class="d-flex justify-content-center align-items-center flex-column"
    >
      <ngb-progressbar
        [animated]="true"
        [striped]="true"
        [value]="progress"
        type="light"
      ></ngb-progressbar>

      <ng-container *ngIf="message">
        <ng-container [ngTemplateOutlet]="messageTemplate"></ng-container>
      </ng-container>
    </div>

    <ng-template #noProgress>
      <div>
        <div class="loading-indicator"></div>
        <span class="sr-only">{{ "Loading..." | translate }}</span>
      </div>

      <ng-container *ngIf="message">
        <ng-container [ngTemplateOutlet]="messageTemplate"></ng-container>
      </ng-container>
    </ng-template>

    <ng-template #messageTemplate>
      <div class="message" [innerHTML]="message"></div>
    </ng-template>
  `,
  styleUrls: ["./loading-indicator.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoadingIndicatorComponent extends BaseComponentDirective implements OnChanges {
  @Input()
  progress: number;

  @Input()
  message: string;

  @Input()
  progressDelay = 1000;

  private progressSubject = new BehaviorSubject<boolean>(false);
  shouldShowProgress$ = this.progressSubject.pipe(
    distinctUntilChanged(),
    delay(this.progressDelay)
  );

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.progress) {
      const showProgress = changes.progress.currentValue > 0 && changes.progress.currentValue < 100;
      this.progressSubject.next(showProgress);
    }
  }
}
