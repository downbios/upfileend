const routes = require("express").Router();
const multer = require("multer");
const multerConfig = require("./config/multer");

const Post = require("./models/Post");

routes.get("/posts", async (req, res) => {
  const posts = await Post.find();

  return res.json(posts);
});

routes.post("/posts", multer(multerConfig).single("file"), async (req, res) => {
  const { originalname: name, size, key, location: url = "" } = req.file;

  const post = await Post.create({
    name,
    size,
    key,
    url,
  });

  return res.json(post);
});

routes.delete("/posts/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    // Verificando se o post existe
    if (!post) {
      return res.status(404).json({ error: "Post não encontrado" });
    }

    await Post.findByIdAndRemove({ _id: req.params.id });
    return res.send();
  } catch (error) {
    console.error("Erro ao remover o post:", error);
    return res.status(500).json({ error: "Erro ao remover o post" });
  }
});

module.exports = routes;
