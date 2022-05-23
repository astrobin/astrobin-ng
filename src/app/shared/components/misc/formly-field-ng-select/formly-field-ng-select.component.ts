import { Component, OnDestroy, OnInit, ViewChild } from "@angular/core";
import { FieldType } from "@ngx-formly/core";
import { TranslateService } from "@ngx-translate/core";
import { UtilsService } from "@shared/services/utils/utils.service";
import { isObservable, Subject, Subscription } from "rxjs";
import { debounceTime, distinctUntilChanged, take, tap } from "rxjs/operators";
import { NgSelectComponent } from "@ng-select/ng-select";

@Component({
  selector: "astrobin-formly-field-ng-select",
  templateUrl: "./formly-field-ng-select.component.html",
  styleUrls: ["./formly-field-ng-select.component.scss"]
})
export class FormlyFieldNgSelectComponent extends FieldType implements OnInit, OnDestroy {
  input$ = new Subject<string>();
  inputSubscription: Subscription;
  loading = false;
  @ViewChild("ngSelect")
  private _ngSelect: NgSelectComponent;

  constructor(public readonly translateService: TranslateService) {
    super();
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

  ngOnInit() {
    if (this.hasAsyncItems) {
      this.inputSubscription = this.input$
        .pipe(
          distinctUntilChanged(),
          tap(() => (this.loading = true)),
          debounceTime(500)
        )
        .subscribe(value => {
          this.onSearch(value);
        });
    }
  }

  ngOnDestroy() {
    if (this.inputSubscription) {
      this.inputSubscription.unsubscribe();
    }
  }

  onAddTag(term: string) {
    this.to.addTag(this._ngSelect.searchTerm);
    this._ngSelect.close();
  }

  onSearch(value) {
    if (UtilsService.isFunction(this.to.onSearch)) {
      this.to
        .onSearch(value)
        .pipe(take(1))
        .subscribe(() => (this.loading = false));
    }
  }
}
