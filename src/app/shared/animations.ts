import { animate, group, query, style, transition, trigger } from "@angular/animations";

export const fadeInOut = trigger("fadeInOut", [
  transition(":enter", [ // void => *
    style({ opacity: 0 }),
    animate("250ms ease-in", style({ opacity: 1 }))
  ]),
  transition(":leave", [ // * => void
    animate("250ms ease-out", style({ opacity: 0 }))
  ])
]);

export const crossFade = trigger("crossFade", [
  transition("* <=> *", [
    group([
      // Animate the element leaving (fade out)
      query(":leave", [
        style({ position: "absolute", width: "100%" }), // Ensures overlap during transition
        animate("150ms ease-out", style({ opacity: 0 }))
      ], { optional: true }),

      // Animate the element entering (fade in)
      query(":enter", [
        style({ opacity: 0, position: "absolute", width: "100%" }), // Ensures overlap
        animate("150ms ease-in", style({ opacity: 1 }))
      ], { optional: true })
    ])
  ])
]);
