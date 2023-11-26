console.log("Início do arquivo Post.js");

const mongoose = require("mongoose");
const IBM = require("ibm-cos-sdk");
const fs = require("fs").promises;
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

PostSchema.pre("save", function() {
  if (!this.url) {
    this.url = `${process.env.APP_URL}/files/${this.key}`;
  }
});

console.log("Middleware pre('remove') registrado no esquema.");

PostSchema.pre("remove", async function() {
  try {
    console.log("Middleware pre('remove') foi acionado.");
    console.log("Executando pré-remoção...");
    console.log("Valor de this.key:", this.key);
    const filePath = path.resolve(__dirname, "..", "..", "tmp", "uploads", this.key);
  
    console.log("Caminho do arquivo a ser deletado:", filePath);

    // Excluindo o arquivo local
    await fs.unlink(filePath);
    console.log("Arquivo local removido com sucesso:", filePath);
  } catch (error) {
    console.error("Erro ao tentar remover o arquivo:", error);
    throw error;
  }
});

console.log("Fim do arquivo Post.js");

module.exports = mongoose.model("Post", PostSchema);
