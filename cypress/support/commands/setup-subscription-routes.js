Cypress.Commands.add("setupSubscriptionRoutes", () => {
  cy.route("GET", "**/common/subscriptions", "fixture:api/common/subscriptions.json").as("getSubscriptions");
});
