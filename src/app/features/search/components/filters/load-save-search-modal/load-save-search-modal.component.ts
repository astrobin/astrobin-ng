import { Component, OnInit } from "@angular/core";
import { FormlyFieldConfig } from "@ngx-formly/core";
import { AbstractControl, FormGroup, ValidationErrors, ValidatorFn } from "@angular/forms";
import { Store } from "@ngrx/store";
import { MainState } from "@app/store/state";
import { NgbActiveModal, NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { TranslateService } from "@ngx-translate/core";
import { LoadingService } from "@shared/services/loading.service";
import { SavedSearchInterface } from "@features/search/interfaces/saved-search.interface";
import { SavedSearchApiService } from "@shared/services/api/classic/saved-search/saved-search-api.service";
import { PopNotificationsService } from "@shared/services/pop-notifications.service";
import { Observable, of } from "rxjs";
import { ConfirmationDialogComponent } from "@shared/components/misc/confirmation-dialog/confirmation-dialog.component";

@Component({
  selector: "astrobin-load-save-search-modal",
  templateUrl: "./load-save-search-modal.component.html",
  styleUrls: ["./load-save-search-modal.component.scss"]
})
export class LoadSaveSearchModalComponent extends BaseComponentDirective implements OnInit {
  saveFields: FormlyFieldConfig[];
  saveForm: FormGroup = new FormGroup({});
  saveModel: {
    name: string;
    params: string;
  } = {
    name: null,
    params: null
  };
  active = 1;
  savedSearches: SavedSearchInterface[] = null;

  constructor(
    public readonly store$: Store<MainState>,
    public readonly modal: NgbActiveModal,
    public readonly translateService: TranslateService,
    public readonly loadingService: LoadingService,
    public readonly savedSearchApiService: SavedSearchApiService,
    public readonly popNotificationsService: PopNotificationsService,
    public readonly modalService: NgbModal
  ) {
    super(store$);
  }

  ngOnInit(): void {
    super.ngOnInit();
    this.initFields();
    this.loadSavedSearches();
  }

  loadSavedSearches(): void {
    this.savedSearchApiService.load().subscribe(savedSearches => {
      this.savedSearches = savedSearches;
    });
  }

  initFields(): void {
    this.saveFields = [
      {
        key: "name",
        type: "input",
        wrappers: ["default-wrapper"],
        id: "name",
        props: {
          label: this.translateService.instant("Name"),
          required: true,
          maxLength: 256
        },
        asyncValidators: {
          validation: [this.uniqueNameValidator()]
        },
        validation: {
          messages: {
            nameExists: this.translateService.instant("This name is already in use.")
          }
        }
      },
      {
        key: "params",
        type: "textarea",
        className: "hidden"
      }
    ];
  }

  uniqueNameValidator(): ValidatorFn {
    return (control: AbstractControl): Observable<ValidationErrors | null> => {
      if (!control.value) {
        return of(null);
      }

      const nameExists = this.savedSearches?.some(
        search => search.name.trim().toLowerCase() === control.value.trim().toLowerCase()
      );

      return of(nameExists ? { nameExists: true } : null);
    };
  }

  onSaveSearch(event: Event): void {
    event.preventDefault();

    if (!this.saveForm.valid) {
      return;
    }

    this.loadingService.setLoading(true);

    this.savedSearchApiService.save(this.saveModel.name, this.saveModel.params).subscribe({
      complete: () => {
        this.loadingService.setLoading(false);
        this.modal.close();
        this.popNotificationsService.success(
          this.translateService.instant("Search saved successfully.")
        );
      },
      error: () => {
        this.loadingService.setLoading(false);
        this.popNotificationsService.error(
          this.translateService.instant("An error occurred while saving the search.")
        );
      }
    });
  }

  onLoadSearch(search: SavedSearchInterface): void {
    this.modal.close(search.params);
  }

  onDeleteSearch(id: SavedSearchInterface["id"]): void {
    const confirmationModalRef = this.modalService.open(ConfirmationDialogComponent);
    confirmationModalRef.closed.subscribe(() => {
      this.savedSearchApiService.delete(id).subscribe({
        complete: () => {
          this.savedSearches = this.savedSearches.filter(search => search.id !== id);
          this.popNotificationsService.success(
            this.translateService.instant("Search deleted successfully.")
          );
        },
        error: () => {
          this.popNotificationsService.error(
            this.translateService.instant("An error occurred while deleting the search.")
          );
        }
      });
    });
  }
}
