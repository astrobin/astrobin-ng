Cypress.Commands.add("setupInitializationRoutes", () => {
  // These routes are necessary to every page, since they are used by the app loading service or common components such
  // as the header or footer.
  cy.setupAuthRoutes();
  cy.setupI18nRoutes();
  cy.setupSubscriptionRoutes();
  cy.setupNotificationRoutes();
});
