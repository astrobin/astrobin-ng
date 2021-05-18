Cypress.Commands.add("mockGeolocation", (latitude = 47.36667, longitude = 8.55) => {
  cy.window().then($window => {
    cy.stub($window.navigator.geolocation, "getCurrentPosition", callback => {
      return callback({ coords: { latitude, longitude } });
    });
  });
});
