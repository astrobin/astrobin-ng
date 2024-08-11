import { TestBed } from "@angular/core/testing";
import { DatePipe } from "@angular/common";
import { DateService } from "@shared/services/date.service";
import { AppModule } from "@app/app.module";
import { MockBuilder } from "ng-mocks";
import { TranslateService } from "@ngx-translate/core";

/**
 * This test suite verifies the behavior of the DateService.formatDates method.
 *
 * Requirements:
 * 1. The method accepts a list of date strings as input.
 * 2. If the list contains a single date, return it formatted in a short format according to the user's locale.
 * 3. If the list represents contiguous dates:
 *    - If the dates are in the same month, return a range in the format "10-14 Jul 2024".
 *    - If the dates overlap two months, return a range in the format "30 Jul - 8 Aug 2024".
 *    - If the dates overlap two years, return a range in the format "20 Dec 2023 - 4 Jan 2024".
 * 4. If the list contains exactly two non-contiguous dates, return them both, separated by a comma (e.g., "4 Jul 2023, 8 Jul 2023").
 * 5. If the list contains more than two non-contiguous dates or multiple contiguous date ranges:
 *    - If all dates are in the same month, return "n days in Jul 2024".
 *    - If dates span multiple months in the same year, return "n days in 2024".
 *    - If dates span multiple years, return "n days".
 */

describe("DateService", () => {
  let service: DateService;

  beforeEach(async () => {
    await MockBuilder(DateService, AppModule).provide(DatePipe);
    service = TestBed.inject(DateService);

    // Mock the current year to 2024
    jest.spyOn(service, "getCurrentYear").mockReturnValue(2024);
  });

  afterEach(() => {
    jest.restoreAllMocks(); // Restore the original implementation after each test
  });

  it("should ignore null values in the dates list", () => {
    const dates = [
      "2024-07-10T00:00:00Z",
      null,
      "2024-07-12T00:00:00Z"
    ];
    const result = service.formatDates(dates);
    expect(result).toBe("10 Jul, 12 Jul");
  });

  it("should return an empty string if all values in the dates list are null", () => {
    const dates = [null, null, null];
    const result = service.formatDates(dates);
    expect(result).toBe("");
  });

  it("should return a single date formatted in short format", () => {
    const dates = ["2024-07-10T00:00:00Z"];
    const result = service.formatDates(dates);
    expect(result).toBe("10 Jul");
  });

  it("should return a range of contiguous dates in the same month", () => {
    const dates = [
      "2024-07-10T00:00:00Z",
      "2024-07-11T00:00:00Z",
      "2024-07-12T00:00:00Z"
    ];
    const result = service.formatDates(dates);
    expect(result).toBe("10-12 Jul");
  });

  it("should return a range of contiguous dates in different months of the same year", () => {
    const dates = [
      "2024-07-30T00:00:00Z",
      "2024-07-31T00:00:00Z",
      "2024-08-01T00:00:00Z"
    ];
    const result = service.formatDates(dates);
    expect(result).toBe("30 Jul - 1 Aug");
  });

  it("should return a range of contiguous dates in different years", () => {
    const dates = [
      "2023-12-30T00:00:00Z",
      "2023-12-31T00:00:00Z",
      "2024-01-01T00:00:00Z"
    ];
    const result = service.formatDates(dates);
    expect(result).toBe("30 Dec 2023 - 1 Jan 2024");
  });

  it("should return two non-contiguous dates separated by a comma", () => {
    const dates = [
      "2024-07-04T00:00:00Z",
      "2024-07-08T00:00:00Z"
    ];
    const result = service.formatDates(dates);
    expect(result).toBe("4 Jul, 8 Jul");
  });

  it("should return \"n days in [month year]\" for more than two non-contiguous dates in the same month", () => {
    const dates = [
      "2024-07-01T00:00:00Z",
      "2024-07-04T00:00:00Z",
      "2024-07-08T00:00:00Z"
    ];
    const result = service.formatDates(dates);
    expect(result).toBe("3 days in Jul 2024");
  });

  it("should return \"n days in [year]\" for more than two non-contiguous dates in different months of the same year", () => {
    const dates = [
      "2024-07-01T00:00:00Z",
      "2024-08-04T00:00:00Z",
      "2024-09-08T00:00:00Z"
    ];
    const result = service.formatDates(dates);
    expect(result).toBe("3 days in 2024");
  });

  it("should return \"n days\" for non-contiguous dates spanning multiple years", () => {
    const dates = [
      "2023-12-31T00:00:00Z",
      "2024-01-01T00:00:00Z",
      "2024-01-05T00:00:00Z"
    ];
    const result = service.formatDates(dates);
    expect(result).toBe("3 days");
  });

  it("should return \"n days\" for multiple contiguous date ranges", () => {
    const dates = [
      "2024-07-01T00:00:00Z",
      "2024-07-02T00:00:00Z",
      "2024-07-10T00:00:00Z",
      "2024-07-11T00:00:00Z",
      "2024-07-15T00:00:00Z"
    ];
    const result = service.formatDates(dates);
    expect(result).toBe("5 days in Jul 2024");
  });

  describe("DateService with en-US locale", () => {
    let service: DateService;
    let translateService: TranslateService;

    beforeEach(async () => {
      await MockBuilder(DateService, AppModule).provide(DatePipe);
      service = TestBed.inject(DateService);
      translateService = TestBed.inject(TranslateService);

      // Mock the locale to be 'en-US'
      jest.spyOn(translateService, 'currentLang', 'get').mockReturnValue('en-US');
    });

    it("should return a single date formatted in en-US short format", () => {
      const dates = ["2024-07-10T00:00:00Z"];
      const result = service.formatDates(dates);
      expect(result).toBe("Jul 10");
    });

    it("should return a range of contiguous dates in the same month with en-US format", () => {
      const dates = [
        "2024-07-10T00:00:00Z",
        "2024-07-11T00:00:00Z",
        "2024-07-12T00:00:00Z"
      ];
      const result = service.formatDates(dates);
      expect(result).toBe("Jul 10-12");
    });

    it("should return a range of contiguous dates in different months of the same year with en-US format", () => {
      const dates = [
        "2024-07-30T00:00:00Z",
        "2024-07-31T00:00:00Z",
        "2024-08-01T00:00:00Z"
      ];
      const result = service.formatDates(dates);
      expect(result).toBe("Jul 30 - Aug 1");
    });

    it("should return a range of contiguous dates in different years with en-US format", () => {
      const dates = [
        "2023-12-30T00:00:00Z",
        "2023-12-31T00:00:00Z",
        "2024-01-01T00:00:00Z"
      ];
      const result = service.formatDates(dates);
      expect(result).toBe("Dec 30, 2023 - Jan 1, 2024");
    });

    it("should return two non-contiguous dates separated by a comma with en-US format", () => {
      const dates = [
        "2024-07-04T00:00:00Z",
        "2024-07-08T00:00:00Z"
      ];
      const result = service.formatDates(dates);
      expect(result).toBe("Jul 4, Jul 8");
    });

    it("should return \"n days in [month year]\" for more than two non-contiguous dates in the same month with en-US format", () => {
      const dates = [
        "2024-07-01T00:00:00Z",
        "2024-07-04T00:00:00Z",
        "2024-07-08T00:00:00Z"
      ];
      const result = service.formatDates(dates);
      expect(result).toBe("3 days in Jul 2024");
    });

    it("should return \"n days in [year]\" for more than two non-contiguous dates in different months of the same year with en-US format", () => {
      const dates = [
        "2024-07-01T00:00:00Z",
        "2024-08-04T00:00:00Z",
        "2024-09-08T00:00:00Z"
      ];
      const result = service.formatDates(dates);
      expect(result).toBe("3 days in 2024");
    });

    it("should return \"n days\" for non-contiguous dates spanning multiple years with en-US format", () => {
      const dates = [
        "2023-12-31T00:00:00Z",
        "2024-01-01T00:00:00Z",
        "2024-01-05T00:00:00Z"
      ];
      const result = service.formatDates(dates);
      expect(result).toBe("3 days");
    });

    it("should return \"n days\" for multiple contiguous date ranges with en-US format", () => {
      const dates = [
        "2024-07-01T00:00:00Z",
        "2024-07-02T00:00:00Z",
        "2024-07-10T00:00:00Z",
        "2024-07-11T00:00:00Z",
        "2024-07-15T00:00:00Z"
      ];
      const result = service.formatDates(dates);
      expect(result).toBe("5 days in Jul 2024");
    });
  });

  describe("DateService with past years", () => {
    it("should format a single date from a past year correctly", () => {
      const dates = ["1985-07-10T00:00:00Z"];
      const result = service.formatDates(dates);
      expect(result).toBe("10 Jul 1985");
    });

    it("should format a range of contiguous dates in the same month and year from the past", () => {
      const dates = [
        "1985-07-10T00:00:00Z",
        "1985-07-11T00:00:00Z",
        "1985-07-12T00:00:00Z"
      ];
      const result = service.formatDates(dates);
      expect(result).toBe("10-12 Jul 1985");
    });

    it("should format a range of contiguous dates spanning different months in a past year", () => {
      const dates = [
        "1985-07-31T00:00:00Z",
        "1985-08-01T00:00:00Z",
        "1985-08-02T00:00:00Z"
      ];
      const result = service.formatDates(dates);
      expect(result).toBe("31 Jul - 2 Aug 1985");
    });

    it("should format two non-contiguous dates from a past year correctly", () => {
      const dates = [
        "1985-07-04T00:00:00Z",
        "1985-07-08T00:00:00Z"
      ];
      const result = service.formatDates(dates);
      expect(result).toBe("4 Jul 1985, 8 Jul 1985");
    });

    it("should format multiple non-contiguous dates in the same month and year from the past", () => {
      const dates = [
        "1985-07-01T00:00:00Z",
        "1985-07-04T00:00:00Z",
        "1985-07-08T00:00:00Z"
      ];
      const result = service.formatDates(dates);
      expect(result).toBe("3 days in Jul 1985");
    });

    it("should format multiple non-contiguous dates spanning different months in the same past year", () => {
      const dates = [
        "1985-07-01T00:00:00Z",
        "1985-08-04T00:00:00Z",
        "1985-09-08T00:00:00Z"
      ];
      const result = service.formatDates(dates);
      expect(result).toBe("3 days in 1985");
    });

    it("should format non-contiguous dates spanning multiple past years", () => {
      const dates = [
        "1984-12-31T00:00:00Z",
        "1985-01-01T00:00:00Z",
        "1985-01-05T00:00:00Z"
      ];
      const result = service.formatDates(dates);
      expect(result).toBe("3 days");
    });

    it("should format multiple contiguous date ranges in a past year", () => {
      const dates = [
        "1985-07-01T00:00:00Z",
        "1985-07-02T00:00:00Z",
        "1985-07-10T00:00:00Z",
        "1985-07-11T00:00:00Z",
        "1985-07-15T00:00:00Z"
      ];
      const result = service.formatDates(dates);
      expect(result).toBe("5 days in Jul 1985");
    });
  });

  describe("DateService with past years and en-US locale", () => {
    let translateService: TranslateService;

    beforeEach(async () => {
      translateService = TestBed.inject(TranslateService);

      // Mock the locale to be 'en-US'
      jest.spyOn(translateService, 'currentLang', 'get').mockReturnValue('en-US');
    });

    it("should format a single date from a past year correctly in en-US format", () => {
      const dates = ["1985-07-10T00:00:00Z"];
      const result = service.formatDates(dates);
      expect(result).toBe("Jul 10, 1985");
    });

    it("should format a range of contiguous dates in the same month and year from the past in en-US format", () => {
      const dates = [
        "1985-07-10T00:00:00Z",
        "1985-07-11T00:00:00Z",
        "1985-07-12T00:00:00Z"
      ];
      const result = service.formatDates(dates);
      expect(result).toBe("Jul 10-12, 1985");
    });

    it("should format a range of contiguous dates spanning different months in a past year in en-US format", () => {
      const dates = [
        "1985-07-31T00:00:00Z",
        "1985-08-01T00:00:00Z",
        "1985-08-02T00:00:00Z"
      ];
      const result = service.formatDates(dates);
      expect(result).toBe("Jul 31 - Aug 2, 1985");
    });

    it("should format two non-contiguous dates from a past year correctly in en-US format", () => {
      const dates = [
        "1985-07-04T00:00:00Z",
        "1985-07-08T00:00:00Z"
      ];
      const result = service.formatDates(dates);
      expect(result).toBe("Jul 4, 1985, Jul 8, 1985");
    });

    it("should format multiple non-contiguous dates in the same month and year from the past in en-US format", () => {
      const dates = [
        "1985-07-01T00:00:00Z",
        "1985-07-04T00:00:00Z",
        "1985-07-08T00:00:00Z"
      ];
      const result = service.formatDates(dates);
      expect(result).toBe("3 days in Jul 1985");
    });

    it("should format multiple non-contiguous dates spanning different months in the same past year in en-US format", () => {
      const dates = [
        "1985-07-01T00:00:00Z",
        "1985-08-04T00:00:00Z",
        "1985-09-08T00:00:00Z"
      ];
      const result = service.formatDates(dates);
      expect(result).toBe("3 days in 1985");
    });

    it("should format non-contiguous dates spanning multiple past years in en-US format", () => {
      const dates = [
        "1984-12-31T00:00:00Z",
        "1985-01-01T00:00:00Z",
        "1985-01-05T00:00:00Z"
      ];
      const result = service.formatDates(dates);
      expect(result).toBe("3 days");
    });

    it("should format multiple contiguous date ranges in a past year in en-US format", () => {
      const dates = [
        "1985-07-01T00:00:00Z",
        "1985-07-02T00:00:00Z",
        "1985-07-10T00:00:00Z",
        "1985-07-11T00:00:00Z",
        "1985-07-15T00:00:00Z"
      ];
      const result = service.formatDates(dates);
      expect(result).toBe("5 days in Jul 1985");
    });
  });

  describe("DateService Additional Tests", () => {
    it("should return an empty string for an empty date list", () => {
      const dates: string[] = [];
      const result = service.formatDates(dates);
      expect(result).toBe("");
    });

    it("should correctly handle a list of dates that are out of order", () => {
      const dates = [
        "2024-07-12T00:00:00Z",
        "2024-07-10T00:00:00Z",
        "2024-07-11T00:00:00Z"
      ];
      const result = service.formatDates(dates);
      expect(result).toBe("10-12 Jul");
    });

    it("should correctly format a single date on New Year's Eve", () => {
      const dates = ["2024-12-31T00:00:00Z"];
      const result = service.formatDates(dates);
      expect(result).toBe("31 Dec");
    });

    it("should correctly format a single date on New Year's Eve in the past", () => {
      const dates = ["1985-12-31T00:00:00Z"];
      const result = service.formatDates(dates);
      expect(result).toBe("31 Dec 1985");
    });

    it("should correctly format dates around a leap year", () => {
      const dates = [
        "2024-02-28T00:00:00Z",
        "2024-02-29T00:00:00Z",
        "2024-03-01T00:00:00Z"
      ];
      const result = service.formatDates(dates);
      expect(result).toBe("28 Feb - 1 Mar");
    });

    it("should handle a single date on February 29th in a leap year", () => {
      const dates = ["2024-02-29T00:00:00Z"];
      const result = service.formatDates(dates);
      expect(result).toBe("29 Feb");
    });

    describe("Locale-specific edge cases", () => {
      let translateService: TranslateService;

      beforeEach(() => {
        translateService = TestBed.inject(TranslateService);
      });

      it("should format correctly for New Year's Eve and New Year's Day in en-GB locale", () => {
        jest.spyOn(translateService, 'currentLang', 'get').mockReturnValue('en-GB');
        const dates = ["2023-12-31T00:00:00Z", "2024-01-01T00:00:00Z"];
        const result = service.formatDates(dates);
        expect(result).toBe("31 Dec 2023 - 1 Jan 2024");
      });

      it("should format correctly for New Year's Eve and New Year's Day in en-US locale", () => {
        jest.spyOn(translateService, 'currentLang', 'get').mockReturnValue('en-US');
        const dates = ["2023-12-31T00:00:00Z", "2024-01-01T00:00:00Z"];
        const result = service.formatDates(dates);
        expect(result).toBe("Dec 31, 2023 - Jan 1, 2024");
      });
    });
  });

  describe("DateService - Handling Duplicate Dates", () => {
    it("should return a single date when multiple identical dates are provided", () => {
      const dates = [
        "2024-07-10T00:00:00Z",
        "2024-07-10T00:00:00Z",
        "2024-07-10T00:00:00Z"
      ];
      const result = service.formatDates(dates);
      expect(result).toBe("10 Jul");
    });

    it("should return a range of contiguous dates even if duplicates are present", () => {
      const dates = [
        "2024-07-10T00:00:00Z",
        "2024-07-11T00:00:00Z",
        "2024-07-11T00:00:00Z",
        "2024-07-12T00:00:00Z"
      ];
      const result = service.formatDates(dates);
      expect(result).toBe("10-12 Jul");
    });

    it("should return a range of dates across different months even if duplicates are present", () => {
      const dates = [
        "2024-07-30T00:00:00Z",
        "2024-07-31T00:00:00Z",
        "2024-07-31T00:00:00Z",
        "2024-08-01T00:00:00Z"
      ];
      const result = service.formatDates(dates);
      expect(result).toBe("30 Jul - 1 Aug");
    });

    it("should return two non-contiguous dates separated by a comma even if duplicates are present", () => {
      const dates = [
        "2024-07-04T00:00:00Z",
        "2024-07-04T00:00:00Z",
        "2024-07-08T00:00:00Z"
      ];
      const result = service.formatDates(dates);
      expect(result).toBe("4 Jul, 8 Jul");
    });

    it("should return the correct number of days for non-contiguous dates in the same month with duplicates", () => {
      const dates = [
        "2024-07-01T00:00:00Z",
        "2024-07-04T00:00:00Z",
        "2024-07-08T00:00:00Z",
        "2024-07-04T00:00:00Z"
      ];
      const result = service.formatDates(dates);
      expect(result).toBe("3 days in Jul 2024");
    });

    it("should return the correct number of days for non-contiguous dates in different months with duplicates", () => {
      const dates = [
        "2024-07-01T00:00:00Z",
        "2024-08-04T00:00:00Z",
        "2024-09-08T00:00:00Z",
        "2024-08-04T00:00:00Z"
      ];
      const result = service.formatDates(dates);
      expect(result).toBe("3 days in 2024");
    });

    it("should return the correct number of days for multiple contiguous date ranges with duplicates", () => {
      const dates = [
        "2024-07-01T00:00:00Z",
        "2024-07-02T00:00:00Z",
        "2024-07-10T00:00:00Z",
        "2024-07-11T00:00:00Z",
        "2024-07-11T00:00:00Z",
        "2024-07-15T00:00:00Z"
      ];
      const result = service.formatDates(dates);
      expect(result).toBe("5 days in Jul 2024");
    });
  });

  describe("DateService with en-US locale and duplicate dates", () => {
    let service: DateService;
    let translateService: TranslateService;

    beforeEach(async () => {
      await MockBuilder(DateService, AppModule).provide(DatePipe);
      service = TestBed.inject(DateService);
      translateService = TestBed.inject(TranslateService);

      // Mock the locale to be 'en-US'
      jest.spyOn(translateService, 'currentLang', 'get').mockReturnValue('en-US');
    });

    it("should return a single date when multiple identical dates are provided in en-US format", () => {
      const dates = [
        "2024-07-10T00:00:00Z",
        "2024-07-10T00:00:00Z",
        "2024-07-10T00:00:00Z"
      ];
      const result = service.formatDates(dates);
      expect(result).toBe("Jul 10");
    });

    it("should return a range of contiguous dates even if duplicates are present in en-US format", () => {
      const dates = [
        "2024-07-10T00:00:00Z",
        "2024-07-11T00:00:00Z",
        "2024-07-11T00:00:00Z",
        "2024-07-12T00:00:00Z"
      ];
      const result = service.formatDates(dates);
      expect(result).toBe("Jul 10-12");
    });

    it("should return a range of dates across different months even if duplicates are present in en-US format", () => {
      const dates = [
        "2024-07-30T00:00:00Z",
        "2024-07-31T00:00:00Z",
        "2024-07-31T00:00:00Z",
        "2024-08-01T00:00:00Z"
      ];
      const result = service.formatDates(dates);
      expect(result).toBe("Jul 30 - Aug 1");
    });

    it("should return two non-contiguous dates separated by a comma even if duplicates are present in en-US format", () => {
      const dates = [
        "2024-07-04T00:00:00Z",
        "2024-07-04T00:00:00Z",
        "2024-07-08T00:00:00Z"
      ];
      const result = service.formatDates(dates);
      expect(result).toBe("Jul 4, Jul 8");
    });

    it("should return the correct number of days for non-contiguous dates in the same month with duplicates in en-US format", () => {
      const dates = [
        "2024-07-01T00:00:00Z",
        "2024-07-04T00:00:00Z",
        "2024-07-08T00:00:00Z",
        "2024-07-04T00:00:00Z"
      ];
      const result = service.formatDates(dates);
      expect(result).toBe("3 days in Jul 2024");
    });

    it("should return the correct number of days for non-contiguous dates in different months with duplicates in en-US format", () => {
      const dates = [
        "2024-07-01T00:00:00Z",
        "2024-08-04T00:00:00Z",
        "2024-09-08T00:00:00Z",
        "2024-08-04T00:00:00Z"
      ];
      const result = service.formatDates(dates);
      expect(result).toBe("3 days in 2024");
    });

    it("should return the correct number of days for multiple contiguous date ranges with duplicates in en-US format", () => {
      const dates = [
        "2024-07-01T00:00:00Z",
        "2024-07-02T00:00:00Z",
        "2024-07-10T00:00:00Z",
        "2024-07-11T00:00:00Z",
        "2024-07-11T00:00:00Z",
        "2024-07-15T00:00:00Z"
      ];
      const result = service.formatDates(dates);
      expect(result).toBe("5 days in Jul 2024");
    });
  });

  describe("DateService with same day but different times", () => {
    it("should treat multiple dates on the same day as a single date", () => {
      const dates = [
        "2024-07-10T10:00:00Z",
        "2024-07-10T12:00:00Z",
        "2024-07-10T14:00:00Z"
      ];
      const result = service.formatDates(dates);
      expect(result).toBe("10 Jul");
    });

    it("should handle a mix of same day and different day dates correctly", () => {
      const dates = [
        "2024-07-10T10:00:00Z",
        "2024-07-10T12:00:00Z",
        "2024-07-11T14:00:00Z"
      ];
      const result = service.formatDates(dates);
      expect(result).toBe("10-11 Jul");
    });

    it("should handle same day dates with different times and other non-contiguous dates correctly", () => {
      const dates = [
        "2024-07-10T10:00:00Z",
        "2024-07-10T12:00:00Z",
        "2024-07-15T14:00:00Z"
      ];
      const result = service.formatDates(dates);
      expect(result).toBe("10 Jul, 15 Jul");
    });

    it("should handle same day dates with different times and a range of contiguous dates correctly", () => {
      const dates = [
        "2024-07-10T10:00:00Z",
        "2024-07-10T12:00:00Z",
        "2024-07-11T14:00:00Z",
        "2024-07-12T10:00:00Z"
      ];
      const result = service.formatDates(dates);
      expect(result).toBe("10-12 Jul");
    });

    it("should treat multiple dates on the same day with different times as a single date when mixed with a larger range", () => {
      const dates = [
        "2024-07-01T10:00:00Z",
        "2024-07-02T12:00:00Z",
        "2024-07-10T10:00:00Z",
        "2024-07-10T12:00:00Z",
        "2024-07-15T14:00:00Z"
      ];
      const result = service.formatDates(dates);
      expect(result).toBe("4 days in Jul 2024");
    });
  });
});
