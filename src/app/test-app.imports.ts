import { HttpClientTestingModule } from "@angular/common/http/testing";
import { ReactiveFormsModule } from "@angular/forms";
import { RouterTestingModule } from "@angular/router/testing";
import { FontAwesomeTestingModule } from "@fortawesome/angular-fontawesome/testing";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { TranslateModule } from "@ngx-translate/core";
import { TimeagoModule } from "ngx-timeago";
import { ToastrModule } from "ngx-toastr";

export const testAppImports = [
  FontAwesomeTestingModule,
  HttpClientTestingModule,
  NgbModule,
  ReactiveFormsModule,
  RouterTestingModule,
  TimeagoModule.forRoot({}),
  ToastrModule.forRoot({}),
  TranslateModule.forRoot({})
];
