import { UtcToLocalPipe } from "./utc-to-local.pipe";

describe("UtcToLocalPipe", () => {
  let pipe: UtcToLocalPipe;

  beforeEach(() => {
    pipe = new UtcToLocalPipe();
  });

  it("should create an instance", () => {
    expect(pipe).toBeTruthy();
  });

  it("should correctly convert a UTC date to local time (Date input)", () => {
    const utcDate = new Date(Date.UTC(2023, 7, 31, 12, 0, 0)); // August 31, 2023 12:00 UTC
    const localDate = pipe.transform(utcDate);

    const expectedLocalDate = new Date(utcDate.getTime() - utcDate.getTimezoneOffset() * 60000);
    expect(localDate.toISOString()).toBe(expectedLocalDate.toISOString());
  });

  it("should correctly convert a UTC date to local time (string input)", () => {
    const utcString = "2023-08-31T12:00:00Z"; // August 31, 2023 12:00 UTC
    const localDate = pipe.transform(utcString);

    const utcDate = new Date(utcString);
    const expectedLocalDate = new Date(utcDate.getTime() - utcDate.getTimezoneOffset() * 60000);
    expect(localDate.toISOString()).toBe(expectedLocalDate.toISOString());
  });

  it("should correctly handle dates across different months", () => {
    const utcDate = new Date(Date.UTC(2023, 0, 31, 23, 0, 0)); // January 31, 2023 23:00 UTC
    const localDate = pipe.transform(utcDate);

    const expectedLocalDate = new Date(utcDate.getTime() - utcDate.getTimezoneOffset() * 60000);
    expect(localDate.toISOString()).toBe(expectedLocalDate.toISOString());
  });

  it("should correctly handle dates across different years", () => {
    const utcDate = new Date(Date.UTC(2023, 11, 31, 23, 0, 0)); // December 31, 2023 23:00 UTC
    const localDate = pipe.transform(utcDate);

    const expectedLocalDate = new Date(utcDate.getTime() - utcDate.getTimezoneOffset() * 60000);
    expect(localDate.toISOString()).toBe(expectedLocalDate.toISOString());
  });

  it("should correctly handle leap years", () => {
    const utcDate = new Date(Date.UTC(2024, 1, 29, 12, 0, 0)); // February 29, 2024 12:00 UTC (Leap Year)
    const localDate = pipe.transform(utcDate);

    const expectedLocalDate = new Date(utcDate.getTime() - utcDate.getTimezoneOffset() * 60000);
    expect(localDate.toISOString()).toBe(expectedLocalDate.toISOString());
  });

  it("should correctly handle dates with timezones causing day changes", () => {
    const utcDate = new Date(Date.UTC(2023, 0, 1, 0, 0, 0)); // January 1, 2023 00:00 UTC
    const localDate = pipe.transform(utcDate);

    const expectedLocalDate = new Date(utcDate.getTime() - utcDate.getTimezoneOffset() * 60000);
    expect(localDate.toISOString()).toBe(expectedLocalDate.toISOString());
  });
});
