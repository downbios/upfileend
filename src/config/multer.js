const multer = require("multer");
const path = require("path");
const crypto = require("crypto");
const multerS3 = require("multer-s3");
const IBM = require("ibm-cos-sdk");

const cos = new IBM.S3({
  endpoint: process.env.COS_ENDPOINT,
  apiKeyId: process.env.API_KEY,
  ibmAuthEndpoint: "https://iam.cloud.ibm.com/identity/token",
  serviceInstanceId: process.env.RESOURCE_INSTANCE_ID,
});

const storageTypes = {
  local: multer.diskStorage({
    destination: (req, file, callback) => {
      callback(null, path.resolve(__dirname, "..", "..", "tmp", "uploads"));
    },
    filename: (req, file, callback) => {
      crypto.randomBytes(16, (err, hash) => {
        // Gere um hash de 16 bytes (32 caracteres)
        if (err) callback(err);

        file.key = `${hash.toString("hex")}-${file.originalname}`;
        callback(null, file.key);
      });
    },
  }),
  s3: multerS3({
    s3: cos,
    bucket: process.env.IBM_BUCKET_NAME,
    acl: "public-read", // Permissões de acesso aos arquivos
    contentType: multerS3.AUTO_CONTENT_TYPE,
    key: (req, file, callback) => {
      crypto.randomBytes(16, (err, hash) => {
        // Gere um hash de 16 bytes (32 caracteres)
        if (err) callback(err);

        const filename = `${hash.toString("hex")}-${file.originalname}`;
        callback(null, filename);
      });
    },
  }),
};

module.exports = {
  dest: path.resolve(__dirname, "..", "..", "tmp", "uploads"),
  storage: storageTypes[process.env.STORAGE_TYPE],
  limits: {
    fileSize: 2 * 1024 * 1024,
  },
  fileFilter: (req, file, callback) => {
    const allowedFileExtensions = [".pdf", ".doc", ".docx", ".odt"];
    const fileExtension = file.originalname.split(".").pop().toLowerCase();

    if (allowedFileExtensions.includes("." + fileExtension)) {
      callback(null, true);
    } else {
      callback(new Error("Tipo de arquivo não permitido."));
    }
  },
};
