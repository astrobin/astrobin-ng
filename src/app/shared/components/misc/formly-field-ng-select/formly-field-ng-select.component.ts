import { Component, HostListener, OnDestroy, OnInit, ViewChild } from "@angular/core";
import { FieldType } from "@ngx-formly/core";
import { TranslateService } from "@ngx-translate/core";
import { UtilsService } from "@shared/services/utils/utils.service";
import { isObservable, Subject, Subscription } from "rxjs";
import { debounceTime, distinctUntilChanged, map, take, tap } from "rxjs/operators";
import { NgSelectComponent } from "@ng-select/ng-select";
import { NgbActiveModal, NgbModal, NgbModalRef } from "@ng-bootstrap/ng-bootstrap";
import { WindowRefService } from "@shared/services/window-ref.service";

@Component({
  selector: "astrobin-formly-field-ng-select",
  templateUrl: "./formly-field-ng-select.component.html",
  styleUrls: ["./formly-field-ng-select.component.scss"]
})
export class FormlyFieldNgSelectComponent extends FieldType implements OnInit, OnDestroy {
  readonly TOO_MANY_OPTIONS = 30;

  input$ = new Subject<string>();
  inputSubscription: Subscription;
  loading = false;
  value = null;
  showCreateNewButton = false;
  fullscreen = false;

  private _ngSelectModalRef: NgbModalRef;

  @ViewChild("ngSelect")
  private _ngSelect: NgSelectComponent;

  @ViewChild("ngSelectModal")
  private _ngSelectModal: NgbActiveModal;

  constructor(
    public readonly translateService: TranslateService,
    public readonly modalService: NgbModal,
    public readonly windowRefService: WindowRefService
  ) {
    super();
  }

  get hasAsyncItems(): boolean {
    return isObservable(this.to.options);
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

  @HostListener("document:keydown.escape", ["$event"]) onKeydownHandler(event: KeyboardEvent) {
    this.exitFullscreen();
  }

  ngOnInit() {
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
      this.exitFullscreen();
    });
  }

  ngOnDestroy() {
    if (this.inputSubscription) {
      this.inputSubscription.unsubscribe();
    }
  }

  toggleEnableFullscreen() {
    this.to.enableFullscreen = !this.to.enableFullscreen;
  }

  goFullscreen($event: Event, q) {
    if (!!$event) {
      const target: any = $event.target;

      if (target.nodeName.toLowerCase() !== "input" || target.disabled) {
        return;
      }
    }

    if (this.to.enableFullscreen && !this.fullscreen) {
      this.fullscreen = true;
      this._ngSelectModalRef = this.modalService.open(this._ngSelectModal, { windowClass: "fullscreen" });
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
    }
  }

  exitFullscreen() {
    if (this.fullscreen) {
      this.fullscreen = false;
      this._ngSelectModalRef.close();
    }
  }

  onAddTag(term: string) {
    this.to.addTag(this._ngSelect.searchTerm);
    this._ngSelect.close();
    this.exitFullscreen();
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
