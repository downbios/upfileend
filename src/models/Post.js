const mongoose = require("mongoose");
const IBM = require("ibm-cos-sdk");
const fs = require("fs");
const path = require("path");

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

PostSchema.pre("save", function(next) {
  if (!this.url) {
    this.url = `${process.env.APP_URL}/files/${this.key}`;
  }
  next();
});

PostSchema.pre("remove", async function (next) {
  try {
    const filePath = path.resolve(__dirname, "..", "..", "tmp", "uploads", this.key);
    
    // Remova o arquivo de forma assíncrona e aguarde sua conclusão
    await fs.promises.unlink(filePath);
    
    next();
  } catch (error) {
    console.error("Erro ao remover o arquivo:", error);
    next(error); // Propague o erro para o próximo middleware
  }
});

module.exports = mongoose.model("Post", PostSchema);
