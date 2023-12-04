const mongoose = require("mongoose");
const fs = require('fs');
const path = require('path');
const removeFile = require("../removeFile");

const PostSchema = new mongoose.Schema({
  name: String,
  size: Number,
  key: String,
  url: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

PostSchema.pre("save", function(next) {
  if (!this.url) {
    this.url = `${process.env.APP_URL}/files/${this.key}`;
  }
  next();
});

module.exports = mongoose.model("Post", PostSchema);
