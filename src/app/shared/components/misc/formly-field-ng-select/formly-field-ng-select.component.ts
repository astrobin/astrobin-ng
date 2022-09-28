import { Component, OnChanges, OnDestroy, OnInit, SimpleChanges, ViewChild } from "@angular/core";
import { FieldType } from "@ngx-formly/core";
import { TranslateService } from "@ngx-translate/core";
import { UtilsService } from "@shared/services/utils/utils.service";
import { isObservable, Subject, Subscription } from "rxjs";
import { debounceTime, distinctUntilChanged, map, take, tap } from "rxjs/operators";
import { NgSelectComponent } from "@ng-select/ng-select";
import { NgbActiveModal, NgbModal, NgbModalRef } from "@ng-bootstrap/ng-bootstrap";
import { WindowRefService } from "@shared/services/window-ref.service";
import { Actions, ofType } from "@ngrx/effects";
import { EquipmentActionTypes } from "@features/equipment/store/equipment.actions";

@Component({
  selector: "astrobin-formly-field-ng-select",
  templateUrl: "./formly-field-ng-select.component.html",
  styleUrls: ["./formly-field-ng-select.component.scss"]
})
export class FormlyFieldNgSelectComponent extends FieldType implements OnInit, OnDestroy, OnChanges {
  readonly TOO_MANY_OPTIONS = 30;

  input$ = new Subject<string>();
  inputSubscription: Subscription;
  loading = false;
  value = null;
  showCreateNewButton = false;
  fullscreen = false;
  exitFullscreenSubscription: Subscription;
  hasAsyncItems: boolean;

  private _ngSelectModalRef: NgbModalRef;

  @ViewChild("ngSelect")
  private _ngSelect: NgSelectComponent;

  @ViewChild("ngSelectModal")
  private _ngSelectModal: NgbActiveModal;

  constructor(
    public actions$: Actions,
    public readonly translateService: TranslateService,
    public readonly modalService: NgbModal,
    public readonly windowRefService: WindowRefService,
    public readonly utilsService: UtilsService
  ) {
    super();
  }

  get placeholder(): string {
    if (this.to.addTag) {
      if (this.to.addTagPlaceholder) {
        return this.to.addTagPlaceholder;
      }

      return this.translateService.instant("Type to search options or to create a new one...");
    }

    return this.translateService.instant("Type to search options...");
  }

  get notFoundText(): string {
    if (this.to.addTag) {
      return (
        this.translateService.instant("No items found.") +
        " " +
        this.translateService.instant("You can create a new one using the button below.")
      );
    }

    return this.translateService.instant("No items found.");
  }

  ngOnInit() {
    this.hasAsyncItems = isObservable(this.to.options);

    if (this.hasAsyncItems) {
      this.inputSubscription = this.input$
        .pipe(
          debounceTime(500),
          map(value => (value ? value.trim() : value)),
          distinctUntilChanged(),
          tap(() => (this.loading = true))
        )
        .subscribe(value => {
          this.value = value;
          this.onSearch(value);
        });
    }

    this.formControl.valueChanges.subscribe(value => {
      if (!this.to.multiple) {
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
    this.hasAsyncItems = isObservable(this.to.options);
  }

  ngOnDestroy() {
    if (this.inputSubscription) {
      this.inputSubscription.unsubscribe();
    }

    if (this.exitFullscreenSubscription) {
      this.exitFullscreenSubscription.unsubscribe();
    }
  }

  toggleEnableFullscreen() {
    this.to.enableFullscreen = !this.to.enableFullscreen;
  }

  goFullscreen($event: Event, q) {
    if (!!$event) {
      const target: any = $event.target;

      if (target.disabled) {
        return;
      }
    }

    if (this.to.enableFullscreen && !this.fullscreen) {
      this.fullscreen = true;
      this._ngSelectModalRef = this.modalService.open(this._ngSelectModal, { size: "xl" });
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
    this.to.addTag(this._ngSelect.searchTerm);

    if (!this.to.multiple) {
      this._ngSelect.close();
      this.exitFullscreen();
    }
  }

  onSearch(value) {
    if (UtilsService.isFunction(this.to.onSearch)) {
      this.to
        .onSearch(value)
        .pipe(take(1))
        .subscribe(options => {
          const hasAddTag = !!this.to.addTag;
          const hasValue = !!this.value;
          const alreadyInOptions =
            !!options &&
            options.filter(option => hasValue && option.label.toLowerCase() === this.value.toLowerCase()).length > 0;

          this.showCreateNewButton = hasAddTag && hasValue && !alreadyInOptions;
          this.loading = false;
        });
    }
  }
}
