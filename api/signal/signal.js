import express from 'express';
import axios from 'axios';

const app = express();

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    next();
});

app.get('/api/signal', async (req, res) => {
    try {
        const response = await axios.get('https://weather.hiveeyes.org/api/umwelt/openbeeresearch/luftdaten/airrohr-01/data.json?from=now-5d&to=now');
        res.json(response.data.reverse());
    } catch (error) {
        res.status(500).send(error.message);
    }
});

export default app;

// Create an export that Vercel understands
module.exports = app;
