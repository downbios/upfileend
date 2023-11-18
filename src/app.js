require("dotenv").config();

const express = require("express");
const morgan = require("morgan");
const mongoose = require("mongoose");
const path = require("path")

const app = express();

/*
DATA BASE SETUP ATLAS
*/

const uri = process.env.DB_URI;

mongoose
  .connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log("Conexão ao banco de dados estabelecida");
  })
  .catch((error) => {
    console.error("Erro ao conectar ao banco de dados:", error);
  });

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));
app.use(require("./routes"));
app.use("/files", express.static(path.resolve(__dirname, "..", "tmp", "uploads")));

app.listen(3000);
