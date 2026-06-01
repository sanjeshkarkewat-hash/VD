const functions = require('firebase-functions');
const admin = require('firebase-admin');
const axios = require('axios');
const FormData = require('form-data');
const cors = require('cors')({ origin: true });

admin.initializeApp();

exports.removeBackgroundHttp = functions.https.onRequest((req, res) => {
    cors(req, res, async () => {
        if (req.method !== 'POST') {
            res.status(405).send('Method not allowed');
            return;
        }
        
        try {
            const { imageDataUrl } = req.body;
            
            if (!imageDataUrl) {
                res.status(400).json({ error: 'Image is required' });
                return;
            }
            
            const base64Data = imageDataUrl.split(',')[1];
            const imageBuffer = Buffer.from(base64Data, 'base64');
            
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
                responseType: 'arraybuffer'
            });
            
            const outputBase64 = Buffer.from(response.data).toString('base64');
            
            res.status(200).json({
                success: true,
                processedImage: `data:image/png;base64,${outputBase64}`
            });
            
        } catch (error) {
            console.error('Error:', error.message);
            res.status(500).json({ error: 'Background removal failed' });
        }
    });
});