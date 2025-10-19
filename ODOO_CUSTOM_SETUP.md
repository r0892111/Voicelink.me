# Custom Odoo OAuth Configuration

This guide explains how to configure VoiceLink to work with custom Odoo implementations that host their own login pages.

## Overview

VoiceLink supports two methods for Odoo integration:

1. **Standard OAuth** (for Odoo.com hosted instances)
2. **Custom OAuth** (for self-hosted or custom Odoo implementations)

## Method 1: Standard OAuth (Odoo.com)

For standard Odoo.com accounts, no additional configuration is needed. The system uses `https://accounts.odoo.com` for authentication.

**Environment Variables:**
```env
VITE_ODOO_CLIENT_ID=your_client_id_here
```

## Method 2: Custom OAuth (Self-Hosted Odoo)

For custom Odoo implementations with their own OAuth server:

### Prerequisites

1. Your Odoo instance must support OAuth 2.0
2. You need to register VoiceLink as an OAuth application in your Odoo instance
3. Your OAuth server must return tokens in the same format as Odoo.com

### Configuration Steps

1. **Add Environment Variables**

Add these variables to your `.env` file:

```env
# Your custom Odoo OAuth server URL (without /oauth2/auth path)
VITE_ODOO_AUTH_URL=https://your-odoo-instance.com

# Your OAuth Client ID from your Odoo instance
VITE_ODOO_CLIENT_ID=your_custom_client_id

# Backend needs the Client Secret (add to Supabase Edge Function secrets)
ODOO_CLIENT_SECRET=your_custom_client_secret
```

2. **Configure OAuth Redirect URI**

In your Odoo OAuth application settings, add this redirect URI:
```
https://your-voicelink-domain.com/auth/odoo/callback
```

For local development:
```
http://localhost:5173/auth/odoo/callback
```

3. **OAuth Scopes**

Ensure your Odoo OAuth application grants the `userinfo` scope.

### How It Works

1. When users click "Connect with Odoo", the system checks for `VITE_ODOO_AUTH_URL`
2. If found, it uses your custom URL instead of `accounts.odoo.com`
3. After authentication, the callback sends the custom OAuth URL to the backend
4. The backend exchanges the code for tokens using your custom OAuth server

### Troubleshooting

**Login redirects to accounts.odoo.com instead of my custom domain:**
- Verify `VITE_ODOO_AUTH_URL` is set in your `.env` file
- Rebuild the application: `npm run build`
- Clear browser cache and localStorage

**Authentication fails with "invalid_client":**
- Check that `VITE_ODOO_CLIENT_ID` matches your OAuth application
- Verify the redirect URI matches exactly (including http/https)
- Ensure `ODOO_CLIENT_SECRET` is configured in Supabase Edge Function secrets

**State parameter mismatch:**
- Clear browser localStorage
- Try authentication again
- Check that cookies are enabled

## Method 3: API Key (Alternative for Custom Odoo)

If OAuth is not available or not working, you can use API key authentication:

1. Log in to VoiceLink (create account with email)
2. Go to Dashboard → Odoo Settings
3. Enter your Odoo database name and API key
4. The system will use API key authentication instead of OAuth

### Getting Your Odoo API Key

1. Log into your Odoo instance
2. Go to Settings → Users & Companies → Users
3. Select your user
4. Click "Preferences" tab
5. Go to "Account Security" section
6. Click "New API Key"
7. Enter a description (e.g., "VoiceLink Integration")
8. **IMPORTANT**: Select "Permanent key" as duration
9. Copy the generated API key

## Backend Configuration

The `odoo-auth` Edge Function automatically handles both standard and custom OAuth. Ensure it has access to these environment variables:

```typescript
// Automatically available in Edge Functions:
Deno.env.get("ODOO_CLIENT_SECRET")

// Passed from frontend:
odoo_oauth_url // (if using custom domain)
```

## Testing

1. **Test Standard OAuth:**
   ```
   No special configuration needed
   Click "Connect with Odoo" → Should redirect to accounts.odoo.com
   ```

2. **Test Custom OAuth:**
   ```
   Set VITE_ODOO_AUTH_URL in .env
   Rebuild: npm run build
   Click "Connect with Odoo" → Should redirect to your custom domain
   ```

## Support

If you continue experiencing issues with custom Odoo OAuth:

1. Check browser console for errors
2. Verify all environment variables are set
3. Test OAuth flow manually with curl/Postman
4. Contact support with error logs

## Security Notes

- Never commit `.env` files to version control
- Store `ODOO_CLIENT_SECRET` securely in Supabase Edge Function secrets
- Use HTTPS in production
- Regularly rotate API keys and OAuth secrets
