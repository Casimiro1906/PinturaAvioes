const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.post('/guardar', (req, res) => {
  const ficheiro = path.join(__dirname, 'dados.json');
  let dados = [];
  if (fs.existsSync(ficheiro)) {
    dados = JSON.parse(fs.readFileSync(ficheiro, 'utf8') || '[]');
  }
  dados.push(req.body);
  fs.writeFileSync(ficheiro, JSON.stringify(dados, null, 2));
  res.json({ ok: true });
});

app.listen(3000, () => console.log('Servidor em http://localhost:3000'));
