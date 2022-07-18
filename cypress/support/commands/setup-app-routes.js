Cypress.Commands.add("setupAppRoutes", () => {
  cy.route("GET", "**/json-api/common/app-config/", "fixture:api/json/app-config.json").as("appConfig");
  cy.route("GET", "**/assets/i18n/*.po?version=*", []).as("i18n");
});
