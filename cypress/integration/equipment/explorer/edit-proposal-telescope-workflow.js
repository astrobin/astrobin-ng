import {
  testBrand,
  testTelescope,
  testTelescopeEditProposal
} from "../../../support/commands/equipment-item-browser-utils";

context("Equipment", () => {
  beforeEach(() => {
    cy.server();
    cy.setupInitializationRoutes();
    cy.setupEquipmentDefaultRoutes();

    cy.route("get", "**/api/v2/equipment/telescope-edit-proposal/?edit_proposal_target=*", { results: [] });
  });

  context("Explorer", () => {
    it("should not have the 'Propose edit' button if logged out", () => {
      cy.visitPage("/equipment/explorer/telescope");
      cy.url().should("contain", "logging-in");

      // TODO: replace above with the commented part when the equipment explorer is open to non moderators.
      // cy.equipmentItemBrowserSelectFirstTelescope("#equipment-item-field", "Test", testTelescope);
      //
      // cy.get(".card .card-header")
      //   .contains("Telescope")
      //   .should("be.visible");
      //
      // cy.get(".card .card-body astrobin-equipment-item-summary").should("be.visible");
      //
      // cy.get("[data-test=propose-edit]").should("not.exist");
    });

    it("should have the 'Propose edit' button if logged in", () => {
      cy.login();
      cy.visitPage("/equipment/explorer/telescope");

      cy.equipmentItemBrowserSelectFirstTelescope("#equipment-item-field", "Test", testTelescope);

      cy.get(".card .card-header")
        .contains("Telescope")
        .should("be.visible");

      cy.get(".card .card-body astrobin-equipment-item-summary").should("be.visible");

      cy.get("[data-test=propose-edit]").should("be.visible");
    });

    it("should show all the prefilled data in the form", () => {
      cy.get("[data-test=propose-edit]").click();
      cy.get("astrobin-telescope-editor").should("be.visible");
      cy.ngSelectValueShouldContain("#equipment-item-field-brand", testBrand.name);
      cy.get("#equipment-item-field-name").should("have.value", testTelescope.name);
      cy.ngSelectValueShouldContain("#telescope-field-type", "Refractor: achromatic");
      cy.get("#telescope-field-aperture").should("have.value", testTelescope.aperture);
      cy.get("#telescope-field-min-focal-length").should("have.value", testTelescope.minFocalLength);
      cy.get("#telescope-field-max-focal-length").should("have.value", testTelescope.maxFocalLength);
    });

    it("should the comment field", () => {
      cy.get("#equipment-item-field-edit-proposal-comment").should("be.visible");
    });

    it("should show warning if name is changed", () => {
      cy.route("get", "**/api/v2/equipment/telescope/?name=*", {
        count: 0,
        next: null,
        previous: null,
        results: []
      }).as("findTelescopesByName");

      cy.get("#equipment-item-field-name")
        .clear()
        .type("Foo");

      cy.get(".alert-warning span")
        .contains("Change the name only to fix a typo")
        .should("be.visible");
    });

    it("should submit the form", () => {
      cy.route("post", "**/api/v2/equipment/telescope-edit-proposal/", testTelescopeEditProposal).as(
        "saveEditProposal"
      );
      cy.route("get", "**/api/v2/equipment/telescope-edit-proposal/?edit_proposal_target=*", {
        results: [testTelescopeEditProposal]
      }).as("getEditProposals");

      cy.get("[data-test=propose-edit-confirm]").click();

      cy.wait("@saveEditProposal");
      cy.wait("@getEditProposals");

      cy.get(".toast-message")
        .contains("Your edit proposal has been submitted")
        .should("be.visible");

      cy.get("astrobin-telescope-editor").should("not.be.visible");
    });

    it("should show the new edit proposal on the page", () => {
      cy.get("astrobin-item-edit-proposal").should("be.visible");
      cy.get("astrobin-item-edit-proposal .edit-proposal astrobin-username .username").should(
        "contain",
        "AstroBin Dev"
      );
      cy.get("astrobin-item-edit-proposal").click();
      cy.get("astrobin-item-edit-proposal .change .property-name")
        .contains("Name:")
        .should("be.visible");
      cy.get("astrobin-item-edit-proposal .change .before")
        .contains("Test telescope")
        .should("be.visible");
      cy.get("astrobin-item-edit-proposal .change .after")
        .contains("Test telescope Pro")
        .should("be.visible");
    });

    it("should have disabled buttons because the proposer cannot review", () => {
      cy.get("astrobin-item-edit-proposal .btn")
        .contains("Reject edit…")
        .should("be.visible")
        .should("be.disabled");
      cy.get("astrobin-item-edit-proposal .btn")
        .contains("Approve edit…")
        .should("be.visible")
        .should("be.disabled");
      cy.get("astrobin-item-edit-proposal .alert")
        .contains("You cannot review this edit proposal because you were the one who proposed it.")
        .should("be.visible");
    });
  });
});
