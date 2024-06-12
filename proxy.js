import express from 'express';
import axios from 'axios';

const app = express();
const port = 3000;

// CORS Middleware
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    next();
});

app.get('/api/weather', async (req, res) => {
    try {
        const response = await axios.get('https://weather.hiveeyes.org/api/climart/zku/weatherstation/main/data.json?from=now-24h&to=now');
        res.json(response.data);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

app.get('/api/signal', async (req, res) => {
    try {
        const response = await axios.get('https://weather.hiveeyes.org/api/umwelt/openbeeresearch/luftdaten/airrohr-01/data.json?from=now-5d&to=now');
        res.json(response.data);
    } catch (error) {
        res.status(500).send(error.message);
    }
});


app.listen(port, () => {
    console.log(`Proxy server running at http://localhost:${port}`);
});
