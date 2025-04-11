import { OnInit, Component, Input } from "@angular/core";
import { Router } from "@angular/router";
import { MainState } from "@app/store/state";
import { ImageAlias } from "@core/enums/image-alias.enum";
import { ClassicRoutesService } from "@core/services/classic-routes.service";
import { WindowRefService } from "@core/services/window-ref.service";
import { IotdArchiveInterface } from "@features/iotd/types/iotd-archive.interface";
import { TopPickArchiveInterface } from "@features/iotd/types/top-pick-archive.interface";
import { TopPickNominationArchiveInterface } from "@features/iotd/types/top-pick-nomination-archive.interface";
import { Store } from "@ngrx/store";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { take } from "rxjs/operators";

@Component({
  selector: "astrobin-iotd-tp-archive-item",
  template: `
    <div class="iotd-tp-archive-item">
      <img [alt]="item.image.title" [src]="thumbnailUrl" />

      <div class="info">
        <div class="title">
          {{ item.image.title }},
          <span *ngFor="let photographer of photographers; let last = last">
            <a
              [href]="photographer.link"
              (click)="openGallery(photographer.username)"
              class="user-display-name"
              astrobinEventPreventDefault
              astrobinEventStopPropagation
              >{{ photographer.displayName }}</a
            ><span *ngIf="!last" class="separator">&middot;</span>
          </span>
        </div>

        <div class="date">
          {{ date | localDate | date: "shortDate" }}
        </div>
      </div>
    </div>
  `,
  styleUrls: ["./iotd-tp-archive-item.component.scss"]
})
export class IotdTpArchiveItemComponent extends BaseComponentDirective implements OnInit {
  @Input() item: IotdArchiveInterface | TopPickArchiveInterface | TopPickNominationArchiveInterface;

  protected thumbnailUrl: string;
  protected date: string;
  protected photographers: {
    id: number;
    username: string;
    link: string;
    displayName: string;
  }[];

  private _newGalleryExperience: boolean;

  constructor(
    public readonly store$: Store<MainState>,
    public readonly classicRoutesService: ClassicRoutesService,
    public readonly router: Router,
    public readonly windowRefService: WindowRefService
  ) {
    super(store$);
  }

  ngOnInit(): void {
    this.thumbnailUrl = this.item.image.thumbnails.find(thumbnail => thumbnail.alias === ImageAlias.REGULAR)?.url;
    this.date = (this.item as any).date ? (this.item as any).date : this.item.created;

    this.currentUserProfile$.pipe(take(1)).subscribe(currentUserProfile => {
      this._newGalleryExperience = !currentUserProfile || currentUserProfile.enableNewGalleryExperience;

      this.photographers = [
        {
          id: this.item.image.user,
          username: this.item.image.username,
          link: this._newGalleryExperience
            ? `/u/${this.item.image.username}/`
            : this.classicRoutesService.GALLERY(this.item.image.username),
          displayName: this.item.image.userDisplayName
        },
        ...(this.item.image.collaborators || []).map(collaborator => ({
          id: collaborator.id,
          username: collaborator.username,
          link: this._newGalleryExperience
            ? `/u/${collaborator.username}/`
            : this.classicRoutesService.GALLERY(collaborator.username),
          displayName: collaborator.displayName
        }))
      ];
    });
  }

  openGallery(username: string): void {
    if (this._newGalleryExperience) {
      void this.router.navigate(["/u", username]);
    } else {
      this.windowRefService.nativeWindow.open(this.classicRoutesService.GALLERY(username), "_self");
    }
  }
}
