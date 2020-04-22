import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";
import { routes } from "@features/not-found-404/not-found-404.routing";
import { TranslateModule } from "@ngx-translate/core";
import { NotFound404PageComponent } from "./pages/not-found-404-page/not-found-404-page.component";

@NgModule({
  declarations: [NotFound404PageComponent],
  imports: [CommonModule, RouterModule.forChild(routes), TranslateModule.forChild()]
})
export class NotFound404Module {}
