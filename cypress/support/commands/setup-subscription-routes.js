Cypress.Commands.add("setupSubscriptionRoutes", () => {
  cy.intercept({
    method: "GET",
    path: "**/common/subscriptions"
  }, { fixture: "api/common/subscriptions.json" }).as("getSubscriptions");

  cy.intercept({
    method: "get",
    path: "**/common/usersubscriptions/?user=*"
  }, { fixture: "api/common/usersubscriptions_1.json" }).as(
    "getUserSubscriptions"
  );
});
