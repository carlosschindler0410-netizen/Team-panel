const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const BOTS_FILE = path.join(__dirname, 'bots.json');

if (!fs.existsSync(BOTS_FILE)) {
  fs.writeFileSync(BOTS_FILE, JSON.stringify([
    { name: "Toxic-Clean", owner: "ASツFeldw", role: "Leader", status: "Online" }
  ], null, 2));
}

app.get('/', (req, res) => {
  let bots = [];
  try {
    const rawData = fs.readFileSync(BOTS_FILE, 'utf8');
    bots = JSON.parse(rawData || '[]');
  } catch (err) {
    bots = [{ name: "Toxic-Clean", owner: "ASツFeldw", role: "Leader", status: "Online" }];
  }

  let botRows = bots.map(b => `
    <tr>
      <td style="padding:10px; border-bottom:1px solid #333;"><b>${b.name}</b></td>
      <td style="padding:10px; border-bottom:1px solid #333;">${b.owner}</td>
      <td style="padding:10px; border-bottom:1px solid #333;">${b.role}</td>
      <td style="padding:10px; border-bottom:1px solid #333; color:${b.status === 'Online' ? '#00ff7f' : '#ff4757'};">${b.status}</td>
    </tr>
  `).join('');

  const html = `
    <!DOCTYPE html>
    <html lang="de">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Team Panel - ASツFeldw</title>
      <style>
        body { background:#121212; color:#fff; font-family:sans-serif; text-align:center; padding:20px; }
        .card { background:#1e1e1e; border-radius:10px; padding:20px; max-width:600px; margin:auto; box-shadow:0 4px 10px rgba(0,0,0,0.5); }
        h1 { color:#00d2d3; margin-bottom:5px; }
        p { color:#aaa; font-size:14px; }
        table { width:100%; margin-top:20px; border-collapse:collapse; text-align:left; }
        th { background:#252525; padding:10px; border-bottom:2px solid #444; color:#00d2d3; }
      </style>
    </head>
    <body>
      <div class="card">
        <h1>Team Panel</h1>
        <p>Leitung: <b>ASツFeldw</b></p>
        <table>
          <thead>
            <tr>
              <th>Bot Name</th>
              <th>Owner</th>
              <th>Rolle</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${botRows}
          </tbody>
        </table>
      </div>
    </body>
    </html>
  `;
  res.send(html);
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
