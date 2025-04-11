import { animate, group, query, style, transition, trigger } from "@angular/animations";

export const fadeInOut = trigger("fadeInOut", [
  transition(":enter", [
    // void => *
    style({ opacity: 0 }),
    animate("250ms ease-in", style({ opacity: 1 }))
  ]),
  transition(":leave", [
    // * => void
    animate("250ms ease-out", style({ opacity: 0 }))
  ])
]);
