const path = require('path');
const express = require('express');
const engine = require('./lib/engine');

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/assets', express.static(path.join(__dirname, 'assets')));

const api = express.Router();

api.post('/matches', (req, res) => res.status(201).json(engine.createMatch(req.body || {})));
api.get('/matches/:id', (req, res) => res.json(engine.publicState(engine.getMatch(req.params.id))));
api.post('/matches/:id/spin', (req, res) => res.json(engine.spin(req.params.id)));
api.post('/matches/:id/balance', (req, res) => res.json(engine.submitBalance(req.params.id, req.body || {})));
api.post('/matches/:id/advance', (req, res) => res.json(engine.advance(req.params.id)));

app.use('/api', api);

app.use((err, req, res, next) => {
  res.status(err.status || 500).json({ error: err.message });
});

const PORT = process.env.PORT || 4600;
app.listen(PORT, () => console.log(`DeltaBet API corriendo en http://localhost:${PORT}`));
