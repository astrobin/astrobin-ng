import { ChangeDetectionStrategy, Component, Inject, Input, OnChanges, PLATFORM_ID, SimpleChanges } from "@angular/core";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { BehaviorSubject } from "rxjs";
import { delay, distinctUntilChanged } from "rxjs/operators";
import { MainState } from "@app/store/state";
import { Store } from "@ngrx/store";
import { isPlatformBrowser } from "@angular/common";

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
        <span *ngIf="isBrowser" class="sr-only">{{ "Loading..." | translate }}</span>
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

  protected readonly isBrowser: boolean;

  private _progressSubject = new BehaviorSubject<boolean>(false);

  shouldShowProgress$ = this._progressSubject.pipe(
    distinctUntilChanged(),
    delay(this.progressDelay)
  );

  constructor(
    public readonly store$: Store<MainState>,
    @Inject(PLATFORM_ID) private readonly platformId: Object
  ) {
    super(store$);
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.progress) {
      const showProgress = changes.progress.currentValue > 0 && changes.progress.currentValue < 100;
      this._progressSubject.next(showProgress);
    }
  }
}
