"use strict";

// Connection
const mongoose = require("mongoose");
const db = mongoose.connect(process.env.DB, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const { Schema } = mongoose;

// Model for issues
const issueSchema = new Schema({
  project: String,
  issue_title: { type: String, required: true },
  issue_text: { type: String, required: true },
  created_by: { type: String, required: true },
  assigned_to: String,
  status_text: String,
  open: Boolean,
  created_on: Date,
  updated_on: Date,
});
const IssueModel = mongoose.model("issue", issueSchema);

// Model for projects
const projectSchema = new Schema({
  userId: { type: String, required: true },
  issues: [issueSchema],
});
const ProjectModel = mongoose.model("project", projectSchema);

module.exports = function (app) {
  app
    .route("/api/issues/:project")

    .get(function (req, res) {
      let project = req.params.project;
    })

    .post(function (req, res) {
      let project = req.params.project;
      const {
        issue_title,
        issue_text,
        created_by,
        assigned_to,
        status_text,
      } = req.body;
      if (!issue_title || !issue_text || !created_by) {
        res.json({ error: "required field(s) missing" });
      } else {
        // Create the issue
        const newIssue = new IssueModel({
          project,
          issue_title,
          issue_text,
          created_by,
          assigned_to: assigned_to || "",
          status_text: status_text || "",
          open: true,
          created_on: new Date().toUTCString(),
          updated_on: new Date().toUTCString(),
        });
        newIssue.save((err, savedIssue) => {
          if (!err && savedIssue) {
            console.log(savedIssue);
          }
        });
    })

    .put(function (req, res) {
      let project = req.params.project;
    })

    .delete(function (req, res) {
      let project = req.params.project;
    });
};
