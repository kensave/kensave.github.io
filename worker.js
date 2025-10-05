import { pipeline, env } from 'https://cdn.jsdelivr.net/npm/@xenova/transformers';

env.allowLocalModels = false;

let textGenerator = null;

// Listen for messages from main thread
self.addEventListener('message', async (event) => {
    const { type, data } = event.data;
    
    if (type === 'init') {
        try {
            self.postMessage({ type: 'status', message: 'Loading AI model...' });
            
            textGenerator = await pipeline('question-answering', 'Xenova/distilbert-base-cased-distilled-squad', {
                progress_callback: (progress) => {
                    if (progress.status === 'downloading') {
                        const percent = Math.round((progress.loaded / progress.total) * 100);
                        self.postMessage({ 
                            type: 'progress', 
                            message: `Downloading model: ${percent}%` 
                        });
                    }
                }
            });
            
            self.postMessage({ type: 'ready', message: 'AI model loaded successfully!' });
        } catch (error) {
            self.postMessage({ type: 'error', message: 'Failed to load AI model' });
        }
    }
    
    if (type === 'generate' && textGenerator) {
        try {
            const answer = await textGenerator(data.query, data.systemPrompt);
            
            self.postMessage({ 
                type: 'result', 
                data: answer.answer
            });
        } catch (error) {
            self.postMessage({ 
                type: 'error', 
                message: 'Generation failed: ' + error.message
            });
        }
    }
});
