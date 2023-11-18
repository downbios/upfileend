const mongoose = require("mongoose");
const IBM = require("ibm-cos-sdk");
const fs = require("fs");
const path = require("path");
const { promisify } = require("util");

const cos = new IBM.S3({
  endpoint: process.env.COS_ENDPOINT,
  apiKeyId: process.env.API_KEY,
  ibmAuthEndpoint: "https://iam.cloud.ibm.com/identity/token",
  serviceInstanceId: process.env.RESOURCE_INSTANCE_ID,
});

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

PostSchema.pre("save", function(){
  if (!this.url) {
    this.url = `${process.env.APP_URL}/files/${this.key}`;
  }

});

PostSchema.pre("remove", function() {
  if (process.env.STORAGE_TYPE === "s3") {
    return cos
      .deleteObject({
        Bucket: process.env.BUCKET_NAME,
        Key: this.key
      })
      .promise()
      .then(response => {
        console.log(response.status);
      })
      .catch(response => {
        console.log(response.status);
      });
  } else {
    return promisify(fs.unlink)(
      path.resolve(__dirname, "..", "..", "tmp", "uploads", this.key)
    );
  }
});

module.exports = mongoose.model("Post", PostSchema);
