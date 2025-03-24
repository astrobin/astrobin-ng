import { ChangeDetectionStrategy, Component, Input, OnChanges, SimpleChanges } from "@angular/core";
import { DomSanitizer, SafeHtml } from "@angular/platform-browser";

@Component({
  selector: "astrobin-coordinates-display",
  templateUrl: "./coordinates-display.component.html",
  styleUrls: ["./coordinates-display.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CoordinatesDisplayComponent implements OnChanges {
  @Input() raHtml: string;
  @Input() decHtml: string;
  @Input() galacticRaHtml: string;
  @Input() galacticDecHtml: string;
  @Input() showGalactic = false;
  @Input() showAttribution = false;
  
  protected ra: SafeHtml;
  protected dec: SafeHtml;
  protected galacticRa: SafeHtml;
  protected galacticDec: SafeHtml;
  
  constructor(private domSanitizer: DomSanitizer) {}
  
  ngOnChanges(changes: SimpleChanges): void {
    if (changes.raHtml) {
      this.ra = this.raHtml ? this.domSanitizer.bypassSecurityTrustHtml(this.raHtml) : null;
    }
    
    if (changes.decHtml) {
      this.dec = this.decHtml ? this.domSanitizer.bypassSecurityTrustHtml(this.decHtml) : null;
    }
    
    if (changes.galacticRaHtml) {
      this.galacticRa = this.galacticRaHtml ? this.domSanitizer.bypassSecurityTrustHtml(this.galacticRaHtml) : null;
    }
    
    if (changes.galacticDecHtml) {
      this.galacticDec = this.galacticDecHtml ? this.domSanitizer.bypassSecurityTrustHtml(this.galacticDecHtml) : null;
    }
  }
}
