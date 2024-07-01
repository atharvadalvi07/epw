// server.js

const { spawn } = require('child_process');
const express = require('express');
const axios = require('axios');
const path = require('path');

const app = express();
const port = 3000;

// Path to your Flask app
const flaskAppPath = path.join(__dirname, 'app.py');

// Function to start Flask app
function startFlaskApp() {
    const flaskProcess = spawn('python', [flaskAppPath]);

    flaskProcess.stdout.on('data', (data) => {
        console.log(`Flask stdout: ${data}`);
    });

    flaskProcess.stderr.on('data', (data) => {
        console.error(`Flask stderr: ${data}`);
    });

    flaskProcess.on('close', (code) => {
        console.log(`Flask process exited with code ${code}`);
    });

    return flaskProcess;
}

// Start Flask app
const flaskProcess = startFlaskApp();

// Proxy endpoint to forward requests to the Flask app
app.get('/api/data', async (req, res) => {
    try {
        const { imei, outdoor_imei, guideline } = req.query;
        const flaskResponse = await axios.get('http://127.0.0.1:5000/data', {
            params: { imei, outdoor_imei, guideline },
        });
        res.json(flaskResponse.data);
    } catch (error) {
        console.error(`Error communicating with Flask app: ${error}`);
        res.status(500).json({ error: 'Error communicating with Flask app' });
    }
});

app.listen(port, () => {
    console.log(`Node.js server running at http://localhost:${port}`);
});
