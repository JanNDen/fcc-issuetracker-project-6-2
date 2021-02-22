/*
No idea why the contents of this file were deleted here:
https://github.com/freeCodeCamp/boilerplate-project-issuetracker/pull/16/files#diff-3650997cdf1bda8231c92d6958450613e19ae46d24aa5dbdacacb784da7edf0d
Renewed older version follows
*/

var chaiHttp = require("chai-http");
var chai = require("chai");
var assert = chai.assert;
var server = require("../server");
chai.use(chaiHttp);

let testId = "";

suite("Functional Tests", function () {
  suite("POST /api/issues/{project} => object with issue data", function () {
    test("Every field filled in", function (done) {
      chai
        .request(server)
        .post("/api/issues/test")
        .send({
          issue_title: "Title",
          issue_text: "text",
          created_by: "Functional Test - Every field filled in",
          assigned_to: "Chai and Mocha",
          status_text: "In QA",
        })
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.body.issue_title, "Title");
          assert.equal(res.body.issue_text, "text");
          assert.equal(
            res.body.created_by,
            "Functional Test - Every field filled in"
          );
          assert.equal(res.body.assigned_to, "Chai and Mocha");
          assert.equal(res.body.status_text, "In QA");
          assert.equal(res.body.project, "test");

          // Save the created ID for later use
          testId = res.body._id;

          done();
        });
    });

    test("Required fields filled in, Optional Fields Blank", function (done) {
      chai
        .request(server)
        .post("/api/issues/test")
        .send({
          issue_title: "Second test",
          issue_text: "text",
          created_by: "Functional Test - Required fields filled in",
        })
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.body.issue_title, "Second test");
          assert.equal(res.body.issue_text, "text");
          assert.equal(
            res.body.created_by,
            "Functional Test - Required fields filled in"
          );
          assert.equal(res.body.assigned_to, "");
          assert.equal(res.body.status_text, "");
          assert.equal(res.body.project, "test");

          // Save the created ID for later use
          secondTestId = res.body._id;

          done();
        });
    });

    test("Missing required fields => { error: 'required field(s) missing' }", function (done) {
      chai
        .request(server)
        .post("/api/issues/test")
        .send({
          issue_title: "Title",
        })
        .end(function (err, res) {
          assert.equal(res.body.error, "required field(s) missing");
          done();
        });
    });
  });

  suite(
    "GET /api/issues/{project} => Array of objects with issue data",
    function () {
      test("No filter", function (done) {
        chai
          .request(server)
          .get("/api/issues/test")
          .query({})
          .end(function (err, res) {
            assert.equal(res.status, 200);
            assert.isArray(res.body);
            assert.property(res.body[0], "issue_title");
            assert.property(res.body[0], "issue_text");
            assert.property(res.body[0], "created_on");
            assert.property(res.body[0], "updated_on");
            assert.property(res.body[0], "created_by");
            assert.property(res.body[0], "assigned_to");
            assert.property(res.body[0], "open");
            assert.property(res.body[0], "status_text");
            assert.property(res.body[0], "_id");
            done();
          });
      });

      test("One filter", function (done) {
        chai
          .request(server)
          .get("/api/issues/test")
          .query({ created_by: "Functional Test - Every field filled in" })
          .end(function (err, res) {
            res.body.forEach((issueResult) => {
              assert.equal(
                issueResult.created_by,
                "Functional Test - Every field filled in"
              );
            });
            done();
          });
      });

      test("Multiple filters (test for multiple fields you know will be in the db for a return)", function (done) {
        chai
          .request(server)
          .get("/api/issues/test")
          .query({
            open: true,
            created_by: "Functional Test - Every field filled in",
          })
          .end(function (err, res) {
            res.body.forEach((issueResult) => {
              assert.equal(issueResult.open, true);
              assert.equal(
                issueResult.created_by,
                "Functional Test - Every field filled in"
              );
            });
            done();
          });
      });
    }
  );

  suite("PUT /api/issues/{project}", function () {
    test("One field to update => {result: 'successfully updated', _id: _id}", function (done) {
      chai
        .request(server)
        .put("/api/issues/test")
        .send({
          _id: testId,
          issue_text: "new text",
        })
        .end(function (err, res) {
          assert.equal(res.body.result, "successfully updated");
          assert.equal(res.body._id, testId);
          done();
        });
    });

    test("Multiple fields to update => {result: 'successfully updated', _id: _id}", function (done) {
      chai
        .request(server)
        .put("/api/issues/test")
        .send({
          _id: testId,
          issue_title: "new title",
          issue_text: "new text",
        })
        .end(function (err, res) {
          assert.equal(res.body.result, "successfully updated");
          assert.equal(res.body._id, testId);
          done();
        });
    });
    test("No _id submitted => { error: 'missing _id' }", function (done) {
      chai
        .request(server)
        .put("/api/issues/test")
        .send({
          issue_title: "new title",
          issue_text: "new text",
        })
        .end(function (err, res) {
          assert.equal(res.body.error, "missing _id");
          done();
        });
    });
    test("No fields to update => { error: 'no update field(s) sent', _id: _id }", function (done) {
      chai
        .request(server)
        .put("/api/issues/test")
        .send({
          _id: testId,
        })
        .end(function (err, res) {
          assert.equal(res.body.error, "no update field(s) sent");
          assert.equal(res.body._id, testId);
          done();
        });
    });
    test("Invalid _id => { error: 'missing _id' }", function (done) {
      const badId = "5f665eb46e296f6b9b6a504d";
      chai
        .request(server)
        .put("/api/issues/test")
        .send({
          _id: badId,
          issue_title: "new title",
          issue_text: "new text",
        })
        .end(function (err, res) {
          assert.equal(res.body.error, "could not update");
          done();
        });
    });
  });

  suite("DELETE /api/issues/{project}", function () {
    test("Valid _id", function (done) {
      chai
        .request(server)
        .delete("/api/issues/test")
        .send({
          _id: testId,
        })
        .end(function (err, res) {
          assert.equal(res.body.result, "successfully deleted");
          assert.equal(res.body._id, testId);
          done();
        });
    });
    test('Invalid _id => { error: "could not delete", "_id": _id }', function (done) {
      const badId = "5f665eb46e296f6b9b6a504d";
      chai
        .request(server)
        .delete("/api/issues/test")
        .send({
          _id: badId,
        })
        .end(function (err, res) {
          assert.equal(res.body.error, "could not delete");
          assert.equal(res.body._id, badId);
          done();
        });
    });
    test("No _id => { error: 'missing _id' }", function (done) {
      chai
        .request(server)
        .delete("/api/issues/test")
        .send({})
        .end(function (err, res) {
          assert.equal(res.body.error, "missing _id");
          done();
        });
    });
  });
});
