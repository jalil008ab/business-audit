import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import geminiHandler from './api/gemini.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Parse JSON request bodies
app.use(express.json());

// Serve static frontend assets from the root directory
app.use(express.static(__dirname));

// Route for Gemini API serverless function adapter
app.post('/api/gemini', async (req, res) => {
    // Vercel Serverless Function request/response adapter
    const mockReq = {
        method: req.method,
        body: req.body,
        headers: req.headers,
        query: req.query
    };

    const mockRes = {
        statusSent: false,
        statusCode: 200,
        headers: {},
        status(code) {
            this.statusCode = code;
            res.status(code);
            return this;
        },
        json(data) {
            if (!this.statusSent) {
                res.json(data);
                this.statusSent = true;
            }
            return this;
        },
        send(data) {
            if (!this.statusSent) {
                res.send(data);
                this.statusSent = true;
            }
            return this;
        },
        setHeader(name, value) {
            this.headers[name] = value;
            res.setHeader(name, value);
            return this;
        }
    };

    try {
        await geminiHandler(mockReq, mockRes);
    } catch (error) {
        console.error("Express API/Gemini error:", error);
        if (!res.headersSent) {
            res.status(500).json({ error: 'Server ichki xatoligi yuz berdi' });
        }
    }
});

// Fallback for HTML5 history API or general requests
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});
