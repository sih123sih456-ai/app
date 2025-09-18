# Gemini API Setup Guide

This guide will help you set up the Gemini API for the chatbot functionality in the Civic Issue Reporting System.

## Prerequisites

- A Google Cloud account
- Access to the Google AI Studio or Google Cloud Console

## Step 1: Get Your API Key

1. Go to [Google AI Studio](https://aistudio.google.com/)
2. Sign in with your Google account
3. Click on "Get API Key" in the left sidebar
4. Click "Create API Key"
5. Copy the generated API key

## Step 2: Configure the Application

### Option 1: Update the Config File (Recommended)

1. Open `js/config.js`
2. Find the line: `GEMINI_API_KEY: 'YOUR_GEMINI_API_KEY_HERE'`
3. Replace `YOUR_GEMINI_API_KEY_HERE` with your actual API key
4. Save the file

### Option 2: Set via Browser Console

1. Open the application in your browser
2. Open the browser's developer console (F12)
3. Run the following command:
   ```javascript
   Config.setApiKey('YOUR_ACTUAL_API_KEY_HERE');
   ```
4. Refresh the page

### Option 3: Set via Local Storage

1. Open the application in your browser
2. Open the browser's developer console (F12)
3. Run the following command:
   ```javascript
   localStorage.setItem('civicAppConfig', JSON.stringify({
     ...JSON.parse(localStorage.getItem('civicAppConfig') || '{}'),
     GEMINI_API_KEY: 'YOUR_ACTUAL_API_KEY_HERE'
   }));
   ```
4. Refresh the page

## Step 3: Test the Integration

1. Open the application
2. Login as any user (Citizen, Admin, or Officer)
3. Navigate to the "Help & Support" section
4. Try asking the chatbot a question like:
   - "What's the status of my issues?"
   - "How do I submit a new issue?"
   - "What can you help me with?"

## Troubleshooting

### API Key Not Working

- Make sure you copied the API key correctly
- Check that there are no extra spaces or characters
- Verify the API key is active in Google AI Studio

### CORS Errors

- The Gemini API should work from any domain
- If you encounter CORS issues, check your browser's console for specific error messages

### Rate Limiting

- The Gemini API has rate limits
- If you hit the limit, wait a few minutes before trying again
- Consider implementing request throttling for production use

### Fallback Mode

- If the API key is not configured, the chatbot will use fallback responses
- This ensures the application works even without the API key
- Check the browser console for warnings about API key configuration

## Security Notes

- Never commit your API key to version control
- Consider using environment variables in production
- Monitor your API usage in Google AI Studio
- Set up billing alerts if needed

## API Usage and Costs

- The Gemini API has a free tier with generous limits
- Check the [Google AI pricing page](https://ai.google.dev/pricing) for current rates
- Monitor your usage in the Google AI Studio dashboard

## Support

- For API issues, check the [Google AI documentation](https://ai.google.dev/docs)
- For application issues, check the browser console for error messages
- The chatbot will work in fallback mode even without the API key

## Example API Key Configuration

```javascript
// In js/config.js
const Config = {
    GEMINI_API_KEY: 'AIzaSyBvOkBw3cUzF8nQ9tR2sE6yH1mP4kL7vX0', // Example key format
    // ... rest of configuration
};
```

Remember to replace the example key with your actual API key!
