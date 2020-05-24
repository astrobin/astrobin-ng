Cypress.Commands.add("setupAppRoutes", () => {
  cy.route("GET", "**/json-api/common/app-config/", "fixture:api/json/app-config.json").as("appConfig");
  cy.route("GET", "**/json-api/i18n/messages/*/?version=*", "fixture:api/json/i18n.txt").as("i18n");
});
