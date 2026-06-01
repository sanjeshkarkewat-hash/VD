async function removeBackgroundWithAI(file) {
    if (!file) {
        showToast('Koi image select karo', true);
        return null;
    }
    
    if (file.size > 5 * 1024 * 1024) {
        showToast('Image 5MB se chhoti honi chahiye', true);
        return null;
    }
    
    showAiLoading(true);
    
    try {
        showToast('📸 Image compress ho rahi hai...', false);
        const compressedImage = await compressImageForAI(file);
        
        showToast('🤖 AI background remove kar raha hai...', false);
        
        // 🔥 FIX: Proper headers with Content-Length
        const formData = new FormData();
        // Convert base64 to blob
        const blob = await (await fetch(compressedImage)).blob();
        formData.append('image', blob, 'image.jpg');
        
        const response = await fetch('https://us-central1-nexi-53897.cloudfunctions.net/removeBackgroundHttp', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
            },
            body: formData
        });
        
        const result = await response.json();
        
        if (result.success) {
            await addImageToCanvasAfterBgRemoval(result.processedImage);
            showToast('✅ Background remove ho gaya!', false);
            return result.processedImage;
        } else {
            throw new Error(result.error || 'Invalid response');
        }
    } catch (error) {
        console.error('Error:', error);
        showToast('❌ Background removal failed: ' + error.message, true);
        return null;
    } finally {
        showAiLoading(false);
    }
}
