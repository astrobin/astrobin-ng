import { Injectable } from "@angular/core";
import { BaseService } from "@shared/services/base.service";
import { environment } from "@env/environment";
import { LoadingService } from "@shared/services/loading.service";
import { AuthService } from "@shared/services/auth.service";
import { AbstractControl } from "@angular/forms";

@Injectable({
  providedIn: "root"
})
export class CKEditorService extends BaseService {
  constructor(public readonly loadingService: LoadingService, public readonly authService: AuthService) {
    super(loadingService);
  }

  plugins(): string[] {
    return [
      "ajax",
      "autocomplete",
      "autogrow",
      "autolink",
      "basicstyles",
      "bbcode",
      "blockquote",
      "button",
      "clipboard",
      "codesnippet",
      "dialog",
      "dialogui",
      "divarea",
      "editorplaceholder",
      "enterkey",
      "entities",
      "fakeobjects",
      "filebrowser",
      "filetools",
      "floatpanel",
      "floatingspace",
      "font",
      "help",
      "indent",
      "indentlist",
      "lineutils",
      "link",
      "list",
      "magicline",
      "maximize",
      "mentions",
      "menu",
      "notification",
      "notificationaggregator",
      "panel",
      "popup",
      "SimpleLink",
      "simpleuploads",
      "smiley",
      "sourcedialog",
      "specialchar",
      "table",
      "textmatch",
      "textwatcher",
      "toolbar",
      "undo",
      "uploadwidget",
      "widget",
      "widgetselection",
      "xml"
    ];
  }

  toolbar(): any {
    return [
      {
        name: "help",
        items: ["HelpButton"]
      },
      {
        name: "document",
        items: ["Sourcedialog", "Maximize"]
      },
      {
        name: "clipboard",
        items: ["Cut", "Copy", "Paste", "Undo", "Redo"]
      },
      {
        name: "basicstyles",
        items: ["FontSize", "Bold", "Italic", "Underline", "Strike", "RemoveFormat"]
      },
      {
        name: "paragraph",
        items: ["NumberedList", "BulletedList", "Blockquote"]
      },
      {
        name: "links",
        items: ["SimpleLink", "Unlink"]
      },
      {
        name: "insert",
        items: ["addFile", "addImage", "CodeSnippet"]
      },
      {
        name: "special",
        items: ["SpecialChar", "Smiley"]
      }
    ];
  }

  mentions(): any {
    return [
      {
        feed: `${
          environment.classicBaseUrl
        }/autocomplete_usernames/?q={encodedQuery}&token=${this.authService.getClassicApiToken()}`,
        marker: "@",
        pattern: new RegExp("@[_a-zA-Z0-9À-ž ]{2,}"),
        itemTemplate: `<li data-id="{id}">
              <img class="avatar" width="40" height="40" src="${environment.cdnUrl}{avatar}" />
              <strong class="realname">{realName}</strong><span class="username">({username})</span>
             </li>`,
        outputTemplate: `<a href="${environment.classicBaseUrl}/users/{username}/">@{displayName}</a><span>&nbsp;</span>`
      },
      {
        feed: `${
          environment.classicBaseUrl
        }/autocomplete_images/?q={encodedQuery}&token=${this.authService.getClassicApiToken()}`,
        marker: "#",
        pattern: new RegExp("#[_a-zA-Z0-9À-ž ]{0,}"),
        itemTemplate: `<li data-id="{id}">
              <img class="image" width="40" height="40" src="{thumbnail}" />
              <span class="title">{title}</span>
            </li>`,
        outputTemplate: `<br/><a href="${environment.classicBaseUrl}{url}">
              <img src="{thumbnail}"/>
              <br/>
              {title}
            </a><br/>`
      }
    ];
  }

  smileyDescriptions(): string[] {
    return [
      "angel",
      "angry-1",
      "angry",
      "arrogant",
      "bored",
      "confused",
      "cool-1",
      "cool",
      "crying-1",
      "crying-2",
      "crying",
      "cute",
      "embarrassed",
      "emoji",
      "greed",
      "happy-1",
      "happy-2",
      "happy-3",
      "happy-4",
      "happy-5",
      "happy-6",
      "happy-7",
      "happy",
      "in-love",
      "kiss-1",
      "kiss",
      "laughing-1",
      "laughing-2",
      "laughing",
      "muted",
      "nerd",
      "sad-1",
      "sad-2",
      "sad",
      "scare",
      "serious",
      "shocked",
      "sick",
      "sleepy",
      "smart",
      "surprised-1",
      "surprised-2",
      "surprised-3",
      "surprised-4",
      "surprised",
      "suspicious",
      "tongue",
      "vain",
      "wink-1",
      "wink"
    ];
  }

  smileyImages(): string[] {
    return [
      "angel.png",
      "angry-1.png",
      "angry.png",
      "arrogant.png",
      "bored.png",
      "confused.png",
      "cool-1.png",
      "cool.png",
      "crying-1.png",
      "crying-2.png",
      "crying.png",
      "cute.png",
      "embarrassed.png",
      "emoji.png",
      "greed.png",
      "happy-1.png",
      "happy-2.png",
      "happy-3.png",
      "happy-4.png",
      "happy-5.png",
      "happy-6.png",
      "happy-7.png",
      "happy.png",
      "in-love.png",
      "kiss-1.png",
      "kiss.png",
      "laughing-1.png",
      "laughing-2.png",
      "laughing.png",
      "muted.png",
      "nerd.png",
      "sad-1.png",
      "sad-2.png",
      "sad.png",
      "scare.png",
      "serious.png",
      "shocked.png",
      "sick.png",
      "sleepy.png",
      "smart.png",
      "surprised-1.png",
      "surprised-2.png",
      "surprised-3.png",
      "surprised-4.png",
      "surprised.png",
      "suspicious.png",
      "tongue.png",
      "vain.png",
      "wink-1.png",
      "wink.png"
    ];
  }

  specialChars(): string[] {
    return [
      "!",
      "&quot;",
      "#",
      "$",
      "%",
      "&amp;",
      "'",
      "(",
      ")",
      "*",
      "+",
      "-",
      ".",
      "/",
      "4",
      "5",
      "6",
      "7",
      "8",
      "9",
      ":",
      ";",
      "&lt;",
      "=",
      "&gt;",
      "?",
      "@",
      "[",
      "]",
      "^",
      "_",
      "`",
      "{",
      "|",
      "}",
      "~",
      "&euro;",
      "&lsquo;",
      "&rsquo;",
      "&ldquo;",
      "&rdquo;",
      "&ndash;",
      "&mdash;",
      "&iexcl;",
      "&cent;",
      "&pound;",
      "&curren;",
      "&yen;",
      "&brvbar;",
      "&sect;",
      "&uml;",
      "&copy;",
      "&ordf;",
      "&laquo;",
      "&not;",
      "&reg;",
      "&macr;",
      "&deg;",
      "&sup2;",
      "&sup3;",
      "&acute;",
      "&micro;",
      "&para;",
      "&middot;",
      "&cedil;",
      "&sup1;",
      "&ordm;",
      "&raquo;",
      "&frac14;",
      "&frac12;",
      "&frac34;",
      "&iquest;",
      "&Agrave;",
      "&Aacute;",
      "&Acirc;",
      "&Atilde;",
      "&Auml;",
      "&Aring;",
      "&AElig;",
      "&Ccedil;",
      "&Egrave;",
      "&Eacute;",
      "&Ecirc;",
      "&Euml;",
      "&Igrave;",
      "&Iacute;",
      "&Icirc;",
      "&Iuml;",
      "&ETH;",
      "&Ntilde;",
      "&Ograve;",
      "&Oacute;",
      "&Ocirc;",
      "&Otilde;",
      "&Ouml;",
      "&times;",
      "&Oslash;",
      "&Ugrave;",
      "&Uacute;",
      "&Ucirc;",
      "&Uuml;",
      "&Yacute;",
      "&THORN;",
      "&alpha;",
      "&szlig;",
      "&agrave;",
      "&aacute;",
      "&acirc;",
      "&atilde;",
      "&auml;",
      "&aring;",
      "&aelig;",
      "&ccedil;",
      "&egrave;",
      "&eacute;",
      "&ecirc;",
      "&euml;",
      "&igrave;",
      "&iacute;",
      "&icirc;",
      "&iuml;",
      "&eth;",
      "&ntilde;",
      "&ograve;",
      "&oacute;",
      "&ocirc;",
      "&otilde;",
      "&ouml;",
      "&divide;",
      "&oslash;",
      "&ugrave;",
      "&uacute;",
      "&ucirc;",
      "&uuml;",
      "&yacute;",
      "&thorn;",
      "&yuml;",
      "&OElig;",
      "&oelig;",
      "&#372;",
      "&#374",
      "&#373",
      "&#375;",
      "&sbquo;",
      "&#8219;",
      "&bdquo;",
      "&hellip;",
      "&trade;",
      "&#9658;",
      "&bull;",
      "&rarr;",
      "&rArr;",
      "&hArr;",
      "&diams;",
      "&asymp;"
    ];
  }

  options(formControl: AbstractControl): any {
    const self = this;

    const onChange = editor => {
      editor.updateElement();

      if (formControl) {
        formControl.setValue(editor.getData());
        formControl.updateValueAndValidity();
        formControl.markAsTouched();
        formControl.markAsDirty();
      }
    };

    return {
      skin: "minimalist",
      language: "en",
      disableNativeSpellChecker: false,
      disableObjectResizing: true,
      extraPlugins: this.plugins().join(","),
      toolbar: this.toolbar(),
      filebrowserUploadUrl: `${environment.classicBaseUrl}/json-api/common/ckeditor-upload/`,
      mentions: this.mentions(),
      smiley_columns: 10,
      smiley_path: "https://cdn.astrobin.com/static/astrobin/emoticons/",
      smiley_descriptions: this.smileyDescriptions(),
      smiley_images: this.smileyImages(),
      specialChars: this.specialChars(),
      fontSize_sizes: "50%/50%;100%/100%;200%/200%",
      autoGrow_minHeight: 300,
      autoGrow_maxHeight: 1200,
      autoGrow_bottomSpace: 50,
      codeSnippet_languages: {
        bash: "Bash",
        coffeescript: "CoffeeScript",
        cpp: "C++",
        cs: "C#",
        css: "CSS",
        diff: "Diff",
        html: "HTML",
        java: "Java",
        javascript: "JavaScript",
        json: "JSON",
        objectivec: "Objective-C",
        perl: "Perl",
        php: "PHP",
        python: "Python",
        ruby: "Ruby",
        sql: "SQL",
        vbscript: "VBScript",
        xhtml: "XHTML",
        xml: "XML"
      },
      on: {
        change() {
          onChange(this);
        },
        "simpleuploads.startUpload"() {
          self.loadingService.setLoading(true);
        },
        "simpleuploads.finishedUpload"() {
          onChange(this);
          self.loadingService.setLoading(false);
        },
        beforeCommandExec(event) {
          // Show the paste dialog for the paste buttons and right-click paste
          if (event.data.name === "paste") {
            event.editor._.forcePasteDialog = true;
          }

          // Don't show the paste dialog for Ctrl+Shift+V
          if (event.data.name === "pastetext" && event.data.commandData.from === "keystrokeHandler") {
            event.cancel();
          }
        }
      }
    };
  }
}
