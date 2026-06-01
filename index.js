const functions = require('firebase-functions');
const axios = require('axios');
const FormData = require('form-data');
const busboy = require('busboy');

exports.removeBackgroundHttp = functions.https.onRequest(async (req, res) => {
    // CORS headers
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.set('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
        res.status(204).send('');
        return;
    }
    
    if (req.method !== 'POST') {
        res.status(405).json({ error: 'Method not allowed' });
        return;
    }
    
    try {
        let imageBuffer = null;
        
        await new Promise((resolve, reject) => {
            const bb = busboy({ headers: req.headers });
            
            bb.on('file', (name, file, info) => {
                const chunks = [];
                file.on('data', (data) => chunks.push(data));
                file.on('end', () => {
                    imageBuffer = Buffer.concat(chunks);
                    resolve();
                });
            });
            
            bb.on('error', reject);
            req.pipe(bb);
        });
        
        if (!imageBuffer) {
            res.status(400).json({ error: 'No image uploaded' });
            return;
        }
        
        const formData = new FormData();
        formData.append('image_file', imageBuffer, {
            filename: 'upload.png',
            contentType: 'image/png'
        });
        formData.append('size', 'auto');
        formData.append('type', 'product');
        
        const apiKey = process.env.REMOVE_BG_API_KEY;
        
        const response = await axios({
            method: 'post',
            url: 'https://api.remove.bg/v1.0/removebg',
            data: formData,
            headers: {
                ...formData.getHeaders(),
                'X-Api-Key': apiKey
            },
            responseType: 'arraybuffer',
            timeout: 30000
        });
        
        const outputBase64 = Buffer.from(response.data).toString('base64');
        
        res.status(200).json({
            success: true,
            processedImage: `data:image/png;base64,${outputBase64}`
        });
        
    } catch (error) {
        console.error('Error:', error.message);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});
