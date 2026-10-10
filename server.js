const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(session({
    secret: 'feldw_super_secret_key_2026',
    resave: false,
    saveUninitialized: true
}));

const ADMIN_USER = "Feldw";
const ADMIN_PASS = "123456";

function getBotsSorted() {
    const rawData = fs.readFileSync(path.join(__dirname, 'bots.json'));
    const bots = JSON.parse(rawData);
    return bots.sort((a, b) => a.rank - b.rank);
}

function saveBots(bots) {
    fs.writeFileSync(path.join(__dirname, 'bots.json'), JSON.stringify(bots, null, 2));
}

function checkAuth(req, res, next) {
    if (req.session.loggedIn) {
        next();
    } else {
        res.redirect('/login');
    }
}

app.get('/login', (req, res) => {
    res.render('login', { error: null });
});

app.post('/login', (req, res) => {
    const { username, password } = req.body;
    if (username === ADMIN_USER && password === ADMIN_PASS) {
        req.session.loggedIn = true;
        req.session.user = username;
        res.redirect('/');
    } else {
        res.render('login', { error: 'Ungültige Zugangsdaten, Sir!' });
    }
});

app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/login');
});

app.get('/', checkAuth, (req, res) => {
    const bots = getBotsSorted();
    res.render('dashboard', { user: req.session.user, bots });
});

app.post('/api/bot/update', (req, res) => {
    const { botId, status, rankTitle, secret } = req.body;
    if (secret !== 'bot_api_token_123') {
        return res.status(403).json({ success: false, message: 'Unberechtigt' });
    }
    let bots = getBotsSorted();
    const botIndex = bots.findIndex(b => b.id === botId);
    if (botIndex !== -1) {
        bots[botIndex].status = status || bots[botIndex].status;
        if (rankTitle) bots[botIndex].rankTitle = rankTitle;
        bots[botIndex].lastSeen = new Date().toLocaleString('de-DE');
        saveBots(bots);
        return res.json({ success: true, message: `Bot ${botId} aktualisiert.` });
    } else {
        return res.status(404).json({ success: false, message: 'Bot nicht gefunden.' });
    }
});

app.get('/api/bots', (req, res) => {
    const bots = getBotsSorted();
    res.json(bots);
});

app.listen(PORT, () => {
    console.log(`[Panel] Team Panel läuft auf http://localhost:${PORT}`);
});
