const routes = require("express").Router();
const multer = require("multer");
const multerConfig = require("./config/multer");
const IBM = require("ibm-cos-sdk");
const removeFile = require("./removeFile");
const path = require('path');

const COS = new IBM.S3({
  endpoint: process.env.COS_ENDPOINT,
  apiKeyId: process.env.API_KEY,
  ibmAuthEndpoint: 'https://iam.cloud.ibm.com/identity/token',
  serviceInstanceId: process.env.RESOURCE_INSTANCE_ID,
});


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

routes.delete('/posts/:id', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ error: 'Post não encontrado' });
    }

    await Post.findByIdAndRemove({ _id: req.params.id });

    if (process.env.STORAGE_TYPE === 's3') {
      const filename = `${post.key}`;

      const params = {
        Bucket: process.env.IBM_BUCKET_NAME,
        Key: filename,
      };

      await COS.deleteObject(params).promise();
      console.log(`Arquivo ${filename} removido do bucket com sucesso.`);
    } else {
      const filePath = path.resolve(`${process.cwd()}/tmp/uploads/${post.key}`);
      await removeFile(filePath);
    }

    return res.send();
  } catch (error) {
    console.error('Erro ao remover o post:', error);
    return res.status(500).json({ error: 'Erro ao remover o post' });
  }
});

module.exports = routes;