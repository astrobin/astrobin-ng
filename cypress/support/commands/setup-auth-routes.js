Cypress.Commands.add("setupAuthRoutes", () => {
  cy.route("POST", "**/api-auth-token", { token: "1234567890" }).as("getApiToken");

  cy.route("GET", "**/common/users/*", "fixture:api/common/users_1.json").as("getUser");

  cy.route("GET", "**/common/userprofiles/*", "fixture:api/common/userprofile_1.json").as("getUserProfile");

  cy.route("GET", "**/common/userprofiles/current", "fixture:api/common/userprofile_current.json").as(
    "getCurrentUserProfile"
  );
});
