import { ChangeDetectorRef, OnChanges, OnDestroy, OnInit, SimpleChanges, Component, ViewChild } from "@angular/core";
import { UtilsService } from "@core/services/utils/utils.service";
import { WindowRefService } from "@core/services/window-ref.service";
import { EquipmentActionTypes } from "@features/equipment/store/equipment.actions";
import { NgbActiveModal, NgbModal, NgbModalRef } from "@ng-bootstrap/ng-bootstrap";
import { NgSelectComponent } from "@ng-select/ng-select";
import { Actions, ofType } from "@ngrx/effects";
import { FieldType } from "@ngx-formly/core";
import { TranslateService } from "@ngx-translate/core";
import { ConfirmationDialogComponent } from "@shared/components/misc/confirmation-dialog/confirmation-dialog.component";
import { Subscription, isObservable, Subject } from "rxjs";
import { debounceTime, distinctUntilChanged, map, take, tap } from "rxjs/operators";

@Component({
  selector: "astrobin-formly-field-ng-select",
  templateUrl: "./formly-field-ng-select.component.html",
  styleUrls: ["./formly-field-ng-select.component.scss"]
})
export class FormlyFieldNgSelectComponent extends FieldType implements OnInit, OnDestroy, OnChanges {
  readonly TOO_MANY_OPTIONS = 30;
  readonly cypressTesting: boolean;

  input$ = new Subject<string>();
  inputSubscription: Subscription;
  loading = false;
  value = null;
  valueChangesSubscription: Subscription;
  showCreateNewButton = false;
  fullscreen = false;
  exitFullscreenSubscription: Subscription;
  hasAsyncItems: boolean;

  private _ngSelectModalRef: NgbModalRef;
  private _previousModelValue = null;

  @ViewChild("ngSelect")
  private _ngSelect: NgSelectComponent;

  @ViewChild("ngSelectModal")
  private _ngSelectModal: NgbActiveModal;

  constructor(
    public actions$: Actions,
    public readonly translateService: TranslateService,
    public readonly modalService: NgbModal,
    public readonly windowRefService: WindowRefService,
    public readonly utilsService: UtilsService,
    public readonly changeDetectionRef: ChangeDetectorRef
  ) {
    super();

    this.cypressTesting = (this.windowRefService.nativeWindow as any).Cypress !== undefined;
  }

  get placeholder(): string {
    if (this.props.placeholder) {
      return this.props.placeholder;
    }

    if (this.props.addTag) {
      if (this.props.addTagPlaceholder) {
        return this.props.addTagPlaceholder;
      }

      return this.translateService.instant("Type to search options or to create a new one...");
    }

    if (this.props.searchable !== false) {
      return this.translateService.instant("Type to search options...");
    }

    return this.translateService.instant("Select") + "...";
  }

  get notFoundText(): string {
    if (this.props.addTag) {
      return (
        this.translateService.instant("No items found.") +
        " " +
        this.translateService.instant("You can create a new one using the button below.")
      );
    }

    return this.translateService.instant("No items found.");
  }

  ngOnInit() {
    this._previousModelValue = this.formControl.value;
    this.hasAsyncItems = isObservable(this.props.options);

    if (this.hasAsyncItems) {
      this.inputSubscription = this.input$
        .pipe(
          debounceTime(500),
          map(value => (value ? value.trim() : value)),
          distinctUntilChanged(),
          tap(() => {
            this.loading = true;
            this.changeDetectionRef.detectChanges();
          })
        )
        .subscribe(value => {
          this.value = value;
          this.onSearch(value);
        });
    }

    this.valueChangesSubscription = this.formControl.valueChanges.subscribe(value => {
      if (!this.props.multiple) {
        this.exitFullscreen();
      }
    });

    this.exitFullscreenSubscription = this.actions$
      .pipe(ofType(EquipmentActionTypes.ITEM_BROWSER_EXIT_FULLSCREEN))
      .subscribe(() => {
        this.exitFullscreen();
      });
  }

  ngOnChanges(changes: SimpleChanges) {
    this.hasAsyncItems = isObservable(this.props.options);
  }

  ngOnDestroy() {
    if (!!this.inputSubscription) {
      this.inputSubscription.unsubscribe();
    }

    if (!!this.exitFullscreenSubscription) {
      this.exitFullscreenSubscription.unsubscribe();
    }

    if (!!this.valueChangesSubscription) {
      this.valueChangesSubscription.unsubscribe();
    }
  }

  onChange(event: any) {
    if (
      !!this.props.changeConfirmationCondition &&
      UtilsService.isFunction(this.props.changeConfirmationCondition) &&
      this.props.changeConfirmationCondition(this._previousModelValue, event.value)
    ) {
      const modalRef: NgbModalRef = this.modalService.open(ConfirmationDialogComponent);
      const componentInstance: ConfirmationDialogComponent = modalRef.componentInstance;

      componentInstance.message = this.props.changeConfirmationMessage;

      modalRef.dismissed.subscribe(() => {
        this.formControl.setValue(this._previousModelValue);
      });

      modalRef.closed.subscribe(() => {
        this._previousModelValue = event.value;
        this.props.onChangeConfirmation(event.value);
      });
    } else {
      this._previousModelValue = !!event ? event.value : null;
    }
  }

  toggleEnableFullscreen() {
    this.props.enableFullscreen = !this.props.enableFullscreen;
  }

  goFullscreen($event: Event, q) {
    if (!!$event) {
      const target: any = $event.target;

      if (target.disabled) {
        return;
      }
    }

    if (this.props.enableFullscreen && !this.fullscreen) {
      this.fullscreen = true;
      this._ngSelectModalRef = this.modalService.open(this._ngSelectModal, {
        size: "xxl",
        windowClass: "equipment-item-browser-fullscreen-modal"
      });
      this._ngSelectModalRef.shown.pipe(take(1)).subscribe(() => {
        const elementSelector = ".modal .ng-select input";

        if (!!q) {
          const inputElement = this.windowRefService.nativeWindow.document.querySelector(
            elementSelector
          ) as HTMLInputElement;
          const placeholderElement = this.windowRefService.nativeWindow.document.querySelector(
            ".modal .ng-select .ng-placeholder"
          );

          inputElement.value = q.term;
          placeholderElement.remove();
        }

        this.windowRefService.focusElement(elementSelector);
      });
      this._ngSelectModalRef.hidden.pipe(take(1)).subscribe(() => {
        this.fullscreen = false;
      });
    }
  }

  exitFullscreen() {
    if (this.fullscreen) {
      this._ngSelectModalRef.close();
      this._ngSelect.writeValue(this.formControl.value);
    }
  }

  onAddTag(term: string) {
    this.props.addTag(this._ngSelect.searchTerm);

    if (!this.props.multiple) {
      this._ngSelect.close();
    }

    this.exitFullscreen();
  }

  onSearch(value) {
    if (UtilsService.isFunction(this.props.onSearch)) {
      this.to
        .onSearch(value)
        .pipe(take(1))
        .subscribe(options => {
          const hasAddTag = !!this.props.addTag;
          const hasValue = !!this.value;
          const alreadyInOptions =
            !!options &&
            options.filter(
              option => hasValue && !!option.label && option.label.toLowerCase() === this.value.toLowerCase()
            ).length > 0;

          this.showCreateNewButton = hasAddTag && hasValue && !alreadyInOptions;
          this.loading = false;
          this.changeDetectionRef.detectChanges();
        });
    }
  }
}
