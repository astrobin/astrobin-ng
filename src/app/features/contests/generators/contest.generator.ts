import { ContestInterface } from "@features/contests/interfaces/contest.interface";
import moment from "moment";

export class ContestGenerator {
  static contest(): ContestInterface {
    return {
      user: 1,
      title: "Test contest",
      description: "Test contest description",
      rules: "Test contest rules",
      startDate: new Date("2100-01-01"),
      endDate: new Date("2100-01-14"),
      minParticipants: 2,
      maxParticipants: 100,
      created: new Date("2099-12-31"),
      updated: new Date("2099-12-31")
    };
  }

  static openContest(): ContestInterface {
    const contest = this.contest();

    contest.startDate = moment()
      .add(1, "days")
      .toDate();
    contest.endDate = moment(contest.startDate)
      .add(14, "days")
      .toDate();

    return contest;
  }

  static runningContest(): ContestInterface {
    const contest = this.contest();

    contest.startDate = moment()
      .subtract(1, "days")
      .toDate();
    contest.endDate = moment(contest.startDate)
      .add(14, "days")
      .toDate();

    return contest;
  }

  static closedContest(): ContestInterface {
    const contest = this.contest();

    contest.startDate = moment()
      .subtract(1, "years")
      .toDate();
    contest.endDate = moment(contest.startDate)
      .add(14, "days")
      .toDate();

    return contest;
  }
}
