context("Nested comments", () => {
  beforeEach(() => {
    cy.server();
    cy.setupInitializationRoutes();

    cy.route("**/api/v2/common/users/1/", "fixture:api/common/users_1.json").as("getUser1");
    cy.route("**/api/v2/common/users/2/", "fixture:api/common/users_2.json").as("getUser2");
  });

  it("should show 'no comments yet' message", () => {
    cy.route("get", "**/api/v2/nestedcomments/nestedcomments/*", []).as("findNestedComments");

    cy.visitPage("/dev/nested-comments");

    cy.get(".nested-comments [data-test='no-comments']").should("be.visible");
  });

  it("should show comments", () => {
    cy.route("get", "**/api/v2/nestedcomments/nestedcomments/*", [
      {
        id: 1,
        author: 2,
        content_type: 108,
        object_id: 1,
        text: "Test comment 1 [b]with bbcode[/b]",
        html: "Test comment 1 <strong>with bbcode</strong>",
        created: "2021-01-01T00:00:00.0",
        updated: "2021-01-01T00:00:00.0",
        deleted: false,
        pending_moderation: false,
        parent: null,
        depth: 1,
        likes: [1]
      },
      {
        id: 2,
        author: 2,
        content_type: 108,
        object_id: 1,
        text: "Additional top-level comment with time between first comment and reply",
        html: "Additional top-level comment with time between first comment and reply",
        created: "2021-01-02T00:00:00.0",
        updated: "2021-01-02T00:00:00.0",
        deleted: false,
        pending_moderation: false,
        parent: null,
        depth: 1,
        likes: []
      },
      {
        id: 3,
        author: 1,
        content_type: 108,
        object_id: 1,
        text: "Comment reply",
        html: "Comment reply",
        created: "2021-01-03T00:00:00.0",
        updated: "2021-01-03T00:00:00.0",
        deleted: false,
        pending_moderation: false,
        parent: 1,
        depth: 2,
        likes: []
      }
    ]).as("findNestedComments");

    cy.get(".nested-comments [data-test='refresh']").click();

    cy.wait("@findNestedComments");
    cy.wait("@getUser1");
    cy.wait("@getUser2");

    cy.get("#c1").should("be.visible");
    cy.get("#c2").should("be.visible");
    cy.get("#c3").should("be.visible");
  });

  it("should show comments in the right order", () => {
    cy.get(".nested-comment")
      .eq(0)
      .should("have.id", "c1");
    cy.get(".nested-comment")
      .eq(1)
      .should("have.id", "c3");
    cy.get(".nested-comment")
      .eq(2)
      .should("have.id", "c2");
  });

  it("should indent reply", () => {
    cy.get(".nested-comment")
      .eq(1)
      .should("have.css", "margin-left")
      .and("equal", "16px");
  });

  it("should render the comment as HTML", () => {
    cy.get(".nested-comment")
      .eq(0)
      .find(".text")
      .should("contain.html", "Test comment 1 <strong>with bbcode</strong>");
  });

  it("should show usernames", () => {
    cy.get(".nested-comment")
      .eq(0)
      .find("astrobin-username .username")
      .should("contain.text", "astrobin_dev");

    cy.get(".nested-comment")
      .eq(1)
      .find("astrobin-username .username")
      .should("contain.text", "astrobin_dev2");

    cy.get(".nested-comment")
      .eq(0)
      .find("astrobin-username .username")
      .should("contain.text", "astrobin_dev");
  });

  it("should show timestamps", () => {
    cy.get(".nested-comment")
      .eq(0)
      .find(".timestamp")
      .should("have.attr", "data-test-value")
      .and("equal", "2021-01-01T00:00:00.0");

    cy.get(".nested-comment")
      .eq(1)
      .find(".timestamp")
      .should("have.attr", "data-test-value")
      .and("equal", "2021-01-03T00:00:00.0");

    cy.get(".nested-comment")
      .eq(2)
      .find(".timestamp")
      .should("have.attr", "data-test-value")
      .and("equal", "2021-01-02T00:00:00.0");
  });

  it("should show likes", () => {
    cy.get(".nested-comment")
      .eq(0)
      .find(".likes")
      .should("contain.text", "1 like");

    cy.get(".nested-comment")
      .eq(1)
      .find(".likes")
      .should("not.exist");

    cy.get(".nested-comment")
      .eq(2)
      .find(".likes")
      .should("not.exist");
  });
});
