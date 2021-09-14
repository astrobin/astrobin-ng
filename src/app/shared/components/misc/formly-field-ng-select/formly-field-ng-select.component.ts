import { Component, OnDestroy, OnInit, ViewChild } from "@angular/core";
import { FieldType } from "@ngx-formly/core";
import { TranslateService } from "@ngx-translate/core";
import { UtilsService } from "@shared/services/utils/utils.service";
import { isObservable, Observable, Subject, Subscription } from "rxjs";
import { debounceTime, distinctUntilChanged, takeUntil, tap } from "rxjs/operators";
import { NgSelectComponent } from "@ng-select/ng-select";

@Component({
  selector: "astrobin-formly-field-ng-select",
  templateUrl: "./formly-field-ng-select.component.html",
  styleUrls: ["./formly-field-ng-select.component.scss"]
})
export class FormlyFieldNgSelectComponent extends FieldType implements OnInit, OnDestroy {
  @ViewChild("ngSelect")
  private _ngSelect: NgSelectComponent;

  constructor(public readonly translateService: TranslateService) {
    super();
  }

  input$ = new Subject<string>();
  inputSubscription: Subscription;
  loading = false;

  ngOnInit() {
    this.inputSubscription = this.input$
      .pipe(
        distinctUntilChanged(),
        tap(() => (this.loading = true)),
        debounceTime(500)
      )
      .subscribe(value => {
        this.onSearch(value);
        this.loading = false;
      });
  }

  ngOnDestroy() {
    if (this.inputSubscription) {
      this.inputSubscription.unsubscribe();
    }
  }

  onAddTag() {
    if (this._ngSelect) {
      this._ngSelect.close();
    }

    this.to.addTag();
  }

  onSearch(value) {
    if (UtilsService.isFunction(this.to.onSearch)) {
      this.to.onSearch(value);
    }
  }

  get hasAsyncItems(): boolean {
    return isObservable(this.to.options);
  }

  get placeholder(): string {
    if (this.to.addTag) {
      return this.translateService.instant("Type to search options or to create a new one...");
    }

    return this.translateService.instant("Type to search options...");
  }

  get notFoundText(): string {
    if (this.to.addTag) {
      return (
        this.translateService.instant("No items found.") +
        " " +
        this.translateService.instant("Type something to create a new one...")
      );
    }

    return this.translateService.instant("No items found.");
  }

  get typeToSearchText(): string {
    if (this.to.addTag) {
      return this.translateService.instant("Type to search options or to create a new one...");
    }

    return this.translateService.instant("Type to search.");
  }
}
