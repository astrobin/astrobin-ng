import { ChangeDetectorRef, Component, OnDestroy, OnInit, TemplateRef, ViewChild } from "@angular/core";
import { FieldArrayType, FormlyFieldConfig } from "@ngx-formly/core";
import { ColumnMode, TableColumn } from "@swimlane/ngx-datatable";
import { TranslateService } from "@ngx-translate/core";
import { UtilsService } from "@shared/services/utils/utils.service";
import { startWith } from "rxjs/operators";
import { Subscription } from "rxjs";
import { NgbModal, NgbModalRef } from "@ng-bootstrap/ng-bootstrap";
import { ConfirmationDialogComponent } from "@shared/components/misc/confirmation-dialog/confirmation-dialog.component";

@Component({
  selector: "astrobin-formly-field-table",
  templateUrl: "./formly-field-table.component.html",
  styleUrls: ["./formly-field-table.component.scss"]
})
export class FormlyFieldTableComponent extends FieldArrayType implements OnInit, OnDestroy {
  readonly ColumnMode = ColumnMode;

  columns: TableColumn[];
  nonNullProperties: { [key: number]: number } = {};
  fieldChangesSubscription: Subscription;

  @ViewChild("cellTemplate", { static: true }) cellTemplate: TemplateRef<any>;
  @ViewChild("buttonsTemplate", { static: true }) buttonsTemplate: TemplateRef<any>;

  constructor(
    public readonly translateService: TranslateService,
    public readonly changeDetectorRef: ChangeDetectorRef,
    public readonly modalService: NgbModal
  ) {
    super();
  }

  get messages(): any {
    const emptyMessage =
      this.translateService.instant("Nothing to display.") +
      (this.mayAdd ? " " + this.translateService.instant("Use the button below to add data.") : "");

    return {
      emptyMessage
    };
  }

  get mayAdd(): boolean {
    return (
      this.props.allowAdd !== false &&
      (!this.model || this.model.length < this.props.maxRows || this.props.maxRows === undefined)
    );
  }

  ngOnInit() {
    this.columns = this._buildColumns(this.field);
    this.columns.push({
      prop: "actions",
      name: "Actions",
      cellTemplate: this.buttonsTemplate,
      minWidth: 130,
      sortable: false,
      draggable: false,
      resizeable: false,
      canAutoResize: true,
      flexGrow: 0
    });

    this.fieldChangesSubscription = this.field.formControl.valueChanges
      .pipe(startWith(this.field.formControl.value))
      .subscribe(() => {
        this.model.forEach((item, index) => {
          this.nonNullProperties = {
            ...this.nonNullProperties,
            [index]: UtilsService.countNonNullProperties(
              this.model[index],
              this.field.props.excludeFromCountNonNullProperties
            )
          };
          this.changeDetectorRef.detectChanges();
        });
      });
  }

  ngOnDestroy(): void {
    if (!!this.fieldChangesSubscription) {
      this.fieldChangesSubscription.unsubscribe();
      this.fieldChangesSubscription = undefined;
    }
  }

  getField(field: FormlyFieldConfig, column: TableColumn, rowIndex: number): any {
    const f: FormlyFieldConfig = field.fieldGroup[rowIndex].fieldGroup.find(f => f.key === column.prop);

    f.props.descriptionUnderLabel = true;
    f.props.errorUnderLabel = true;

    return f;
  }

  clear(): void {
    if (!this.model) {
      return;
    }

    const modal: NgbModalRef = this.modalService.open(ConfirmationDialogComponent);
    const componentInstance: ConfirmationDialogComponent = modal.componentInstance;

    componentInstance.message = this.translateService.instant(
      "You are about to remove all acquisition sessions you have entered thus far."
    );

    modal.closed.subscribe(item => {
      for (let i = this.model.length - 1; i >= 0; i--) {
        this.remove(i);
      }
    });
  }

  private _buildColumns(field: FormlyFieldConfig): TableColumn[] {
    return (field.fieldArray as any).fieldGroup.map(el => ({
      name: el.props?.label,
      prop: el.key,
      cellTemplate: this.cellTemplate,
      sortable: el.props?.sortable !== undefined ? el.props.sortable : true,
      draggable: el.props?.draggable !== undefined ? el.props.draggable : false,
      resizeable: el.props?.resizeable !== undefined ? el.props.resizeable : false,
      canAutoResize: el.props?.canAutoResize !== undefined ? el.props.canAutoResize : true,
      flexGrow: el.props?.hide ? 0 : 1,
      cellClass: el.props?.hide ? "hidden" : ""
    }));
  }
}
