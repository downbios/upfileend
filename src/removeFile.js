const fs = require('fs');
const path = require('path');

async function removeFile(filePath) {
  try {
    if (fs.existsSync(filePath)) {
      await fs.promises.unlink(filePath);
      console.log(`Arquivo ${filePath} removido com sucesso.`);
    } else {
      console.log(`O arquivo ${filePath} não foi encontrado.`);
    }
  } catch (error) {
    console.error('Erro ao remover o arquivo:', error);
    throw error;
  }
}

module.exports = removeFile;