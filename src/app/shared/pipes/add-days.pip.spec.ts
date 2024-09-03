import { AddDaysPipe } from "@shared/pipes/add-days.pipe";

describe("AddDaysPipe", () => {
  let pipe: AddDaysPipe;

  beforeEach(() => {
    pipe = new AddDaysPipe();
  });

  it("should create an instance", () => {
    expect(pipe).toBeTruthy();
  });

  it("should add 0 days (return the same date)", () => {
    const date = new Date(Date.UTC(2023, 7, 31)); // August 31, 2023
    const result = pipe.transform(date, 0);
    expect(result.toISOString()).toBe(date.toISOString());
  });

  it("should add positive days within the same month", () => {
    const date = new Date(Date.UTC(2023, 7, 25)); // August 25, 2023
    const result = pipe.transform(date, 5); // August 30, 2023
    expect(result.toISOString()).toBe(new Date(Date.UTC(2023, 7, 30)).toISOString());
  });

  it("should add days and cross into the next month", () => {
    const date = new Date(Date.UTC(2023, 7, 29)); // August 29, 2023
    const result = pipe.transform(date, 3); // September 1, 2023
    expect(result.toISOString()).toBe(new Date(Date.UTC(2023, 8, 1)).toISOString());
  });

  it("should add days and cross into the next year", () => {
    const date = new Date(Date.UTC(2023, 11, 30)); // December 30, 2023
    const result = pipe.transform(date, 5); // January 4, 2024
    expect(result.toISOString()).toBe(new Date(Date.UTC(2024, 0, 4)).toISOString());
  });

  it("should handle negative days correctly", () => {
    const date = new Date(Date.UTC(2023, 7, 25)); // August 25, 2023
    const result = pipe.transform(date, -10); // August 15, 2023
    expect(result.toISOString()).toBe(new Date(Date.UTC(2023, 7, 15)).toISOString());
  });

  it("should handle negative days crossing into the previous month", () => {
    const date = new Date(Date.UTC(2023, 7, 5)); // August 5, 2023
    const result = pipe.transform(date, -10); // July 26, 2023
    expect(result.toISOString()).toBe(new Date(Date.UTC(2023, 6, 26)).toISOString());
  });

  it("should handle negative days crossing into the previous year", () => {
    const date = new Date(Date.UTC(2023, 0, 5)); // January 5, 2023
    const result = pipe.transform(date, -10); // December 26, 2022
    expect(result.toISOString()).toBe(new Date(Date.UTC(2022, 11, 26)).toISOString());
  });

  it("should work with string input (ISO format)", () => {
    const date = "2023-08-25T00:00:00Z"; // August 25, 2023
    const result = pipe.transform(date, 5); // August 30, 2023
    expect(result.toISOString()).toBe(new Date(Date.UTC(2023, 7, 30)).toISOString());
  });

  it("should work with string input and cross into the next month", () => {
    const date = "2023-08-29T00:00:00Z"; // August 29, 2023
    const result = pipe.transform(date, 3); // September 1, 2023
    expect(result.toISOString()).toBe(new Date(Date.UTC(2023, 8, 1)).toISOString());
  });
});
