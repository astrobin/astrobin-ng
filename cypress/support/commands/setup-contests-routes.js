Cypress.Commands.add("setupContestsRoutes", () => {
  cy.route("GET", "**/contests/contest/*", "fixture:api/contests/contest-list.json").as("listContests");
});
