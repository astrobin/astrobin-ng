import { Subject, throttleTime } from "rxjs";

const subjectsMap = new WeakMap<any, Map<string, Subject<any>>>();

export function Throttle(delay = 100) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const original = descriptor.value;

    descriptor.value = function (...args: any[]) {
      // Get or create the subject map for this component instance
      let subjectsByMethod = subjectsMap.get(this);
      if (!subjectsByMethod) {
        subjectsByMethod = new Map();
        subjectsMap.set(this, subjectsByMethod);
      }

      // Get or create subject for this specific method
      let subject = subjectsByMethod.get(propertyKey);
      if (!subject) {
        subject = new Subject<any>();
        subject.pipe(throttleTime(delay)).subscribe(args => {
          original.apply(this, args);
        });
        subjectsByMethod.set(propertyKey, subject);
      }

      subject.next(args);
    };

    return descriptor;
  };
}
