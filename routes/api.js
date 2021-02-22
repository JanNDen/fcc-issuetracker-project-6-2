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
          if (err || !savedIssue) {
            res.send("There was an error saving the issue", err);
          } else {
            res.json(savedIssue);
          }
        });
      }
    })

    .put(function (req, res) {
      let updateValues = {};
      for (const prop in req.body) {
        if (req.body[prop] != "") updateValues[prop] = req.body[prop];
      }
      if (!updateValues._id || Object.keys(updateValues).length < 2) {
        res.json({ error: "no update field(s) sent", _id: updateValues._id });
      } else {
        updateValues.updated_on = new Date().toUTCString();
        IssueModel.findByIdAndUpdate(
          updateValues._id,
          updateValues,
          { new: true },
          (err, updatedIssue) => {
            if (!err && updatedIssue) {
              updatedIssue.result = "successfully updated";
              return res.json({
                result: "successfully updated",
                _id: updatedIssue._id,
              });
            } else if (!updatedIssue) {
              return res.json({
                error: "could not update",
                _id: updatedIssue._id,
              });
            }
          }
        );
      }
      console.log(updateValues);
    })

    .delete(function (req, res) {
      if (!req.body._id) {
        res.json({ error: "missing _id" });
      } else {
        IssueModel.findByIdAndRemove(req.body._id, (err) => {
          if (err) {
            res.json({ result: "could not delete", _id: req.body._id });
          } else {
            res.json({ result: "successfully deleted", _id: req.body._id });
          }
        });
      }
    });
};
