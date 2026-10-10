const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

const BOTS_FILE = path.join(__dirname, 'bots.json');

if (!fs.existsSync(BOTS_FILE)) {
  fs.writeFileSync(BOTS_FILE, JSON.stringify([
    { name: "Toxic-Clean", owner: "ASツFeldw", role: "Leader", status: "Online" }
  ], null, 2));
}

app.get('/', (req, res) => {
  try {
    const rawData = fs.readFileSync(BOTS_FILE, 'utf8');
    const bots = JSON.parse(rawData || '[]');
    res.render('index', { bots });
  } catch (err) {
    res.send(`<h2>Team-Panel bereit!</h2><p>ASツFeldw Dashboard läuft.</p>`);
  }
});

app.post('/api/update', (req, res) => {
  try {
    const { botName, ownerName, role, status } = req.body;
    let bots = JSON.parse(fs.readFileSync(BOTS_FILE, 'utf8') || '[]');
    
    const index = bots.findIndex(b => b.name === botName);
    if (index !== -1) {
      bots[index] = { name: botName, owner: ownerName, role, status };
    } else {
      bots.push({ name: botName, owner: ownerName, role, status });
    }

    fs.writeFileSync(BOTS_FILE, JSON.stringify(bots, null, 2));
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.listen(PORT, () => console.log(`Server läuft auf Port ${PORT}`));
