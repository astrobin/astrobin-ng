Cypress.Commands.add("equipmentItemBrowserCreate", (selector, text, apiToWait) => {
  cy.ngSelectType(selector, text);

  cy.wait(apiToWait);

  cy.ngSelectShouldHaveOptionsCount(selector, 1);
  cy.ngSelectOptionNumberSelectorShouldContain(selector, 1, "span span", "Create new");
  cy.ngSelectOptionNumberSelectorShouldContain(selector, 1, "span", text);
  cy.ngSelectOptionClick(selector, 1);
});

Cypress.Commands.add("equipmentItemBrowserCreateBrand", (selector, name, website, brandObject) => {
  cy.equipmentItemBrowserCreate(selector, name, "@findBrands");

  cy.get("#brand-field-name").should("have.value", name);
  cy.get("#brand-field-website").type(website);

  cy.route("POST", "**/api/v2/equipment/brand/", brandObject).as("createBrand");
  cy.route("GET", "**/api/v2/equipment/brand/1/", brandObject);

  cy.get("#create-new-brand .btn-primary").click();

  cy.wait("@createBrand");

  cy.ngSelectValueShouldContain(selector, name);
});

Cypress.Commands.add("equipmentItemBrowserCreateBrandUsingSuggestion", (selector, name, brandObject) => {
  cy.equipmentItemBrowserCreate(selector, name, "@findBrands");

  cy.route("GET", "**/api/v2/equipment/brand/?q=*", { count: 1, results: [brandObject] }).as("findBrands");

  cy.get("#brand-field-name").clear();
  cy.get("#brand-field-name").type("Test band");

  cy.wait("@findBrands");

  cy.get("astrobin-similar-items-suggestion").should("be.visible");
  cy.get("astrobin-similar-items-suggestion .btn").click();

  cy.route("GET", "**/api/v2/equipment/brand/1/", brandObject);

  cy.ngSelectValueShouldContain(selector, name);
});

Cypress.Commands.add("equipmentItemBrowserSelectNthBrand", (selector, brandName, brandObject) => {
  cy.route("GET", "**/api/v2/equipment/brand/?q=*", {
    count: 1,
    next: null,
    previous: null,
    results: [brandObject]
  }).as("findBrands");

  cy.ngSelectType(selector, brandName);

  cy.wait("@findBrands");

  cy.ngSelectShouldHaveOptionsCount(selector, 1);
  cy.ngSelectOptionNumberSelectorShouldContain(selector, 1, "astrobin-brand-summary .label", brandName);
  cy.ngSelectOptionClick(selector, 1);
  cy.ngSelectValueShouldContain(selector, brandName);
});

Cypress.Commands.add("equipmentItemBrowserSelectNthSensor", (selector, sensorName, sensorObject) => {
  cy.route("GET", "**/api/v2/equipment/sensor/?q=*", {
    count: 1,
    next: null,
    previous: null,
    results: [sensorObject]
  }).as("findSensors");

  cy.ngSelectType(selector, sensorName);

  cy.wait("@findSensors");

  cy.ngSelectShouldHaveOptionsCount(selector, 2);
  cy.ngSelectOptionNumberSelectorShouldContain(selector, 1, "astrobin-equipment-item-summary .label", sensorName);
  cy.ngSelectOptionClick(selector, 1);
  cy.ngSelectValueShouldContain(selector, sensorName);
});
