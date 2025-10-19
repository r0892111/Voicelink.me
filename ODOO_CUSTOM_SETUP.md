# Self-Hosted Odoo Setup Guide

This guide explains how to configure VoiceLink to work with self-hosted Odoo implementations.

## Quick Start for Self-Hosted Odoo Users

**If your company uses a self-hosted Odoo instance (like https://odoo.afc-collection.co or odoo.yourcompany.com):**

1. Go to the [Test Signup Page](/test-signup)
2. Fill in your details and select "Odoo" as your CRM platform
3. After signup, go to Dashboard → Odoo Settings
4. Enter your Odoo database name and API key
5. Start using VoiceLink!

---

## Overview

VoiceLink supports three methods for Odoo integration:

1. **Standard OAuth** - For Odoo.com hosted accounts (e.g., yourcompany.odoo.com)
2. **API Key Authentication** - For self-hosted Odoo (e.g., odoo.yourcompany.com) ⭐ **RECOMMENDED**
3. **Custom OAuth** - For self-hosted Odoo with OAuth server configured (advanced)

## Method 1: Standard OAuth (Odoo.com)

For standard Odoo.com accounts, no additional configuration is needed. The system uses `https://accounts.odoo.com` for authentication.

**Environment Variables:**
```env
VITE_ODOO_CLIENT_ID=your_client_id_here
```

## Method 2: API Key Authentication (Self-Hosted Odoo) ⭐ RECOMMENDED

This is the easiest method for self-hosted Odoo instances.

### Step-by-Step Instructions

#### 1. Create a VoiceLink Account

1. Go to [Test Signup Page](/test-signup)
2. Fill in your information:
   - First Name
   - Last Name
   - Email
   - Phone (with WhatsApp)
   - Select "Odoo" as CRM Platform
3. Check your email for the confirmation link
4. Click the confirmation link to activate your account

#### 2. Get Your Odoo API Key

1. Log into your Odoo instance (e.g., https://odoo.afc-collection.co)
2. Go to **Settings** → **Users & Companies** → **Users**
3. Select your user account
4. Click the **"Preferences"** tab
5. Scroll to **"Account Security"** section
6. Click **"New API Key"**
7. Enter a description: "VoiceLink Integration"
8. ⚠️ **IMPORTANT**: Select **"Permanent key"** as duration
9. Copy the generated API key

#### 3. Configure VoiceLink

1. Log into VoiceLink with your email and password
2. Go to **Dashboard**
3. Find the **"Odoo API Key"** section
4. Enter your **Database Name** (e.g., "afc-collection" from https://odoo.afc-collection.co)
5. Paste your **API Key**
6. Click **"Save Configuration"**

#### 4. Test the Integration

1. Send a test voice message to VoiceLink on WhatsApp
2. Check your Odoo instance to verify data was synced
3. View activity logs in the VoiceLink dashboard

### Troubleshooting API Key Authentication

**"Invalid API Key" error:**
- Verify you copied the complete API key
- Check that the API key is set to "Permanent"
- Ensure your Odoo user has appropriate permissions

**"Database not found" error:**
- Verify the database name matches your Odoo URL
- Example: For https://odoo.company.com, use "company" or check your Odoo database settings

**"Connection failed" error:**
- Check your Odoo instance is accessible from the internet
- Verify firewall settings allow API access
- Ensure Odoo API is enabled

---

## Method 3: Custom OAuth (Self-Hosted Odoo with OAuth)

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

## Comparison: Which Method Should I Use?

| Feature | Standard OAuth | API Key | Custom OAuth |
|---------|---------------|---------|-------------|
| **For Odoo.com** | ✅ Yes | ❌ No | ❌ No |
| **For Self-Hosted** | ❌ No | ✅ Yes | ✅ Yes (if configured) |
| **Ease of Setup** | Easy | Easy | Complex |
| **Requires IT Support** | No | No | Yes |
| **Security** | High | High | High |
| **User Experience** | One-click login | Manual setup | One-click login |

### Recommendation:

- **Odoo.com users**: Use Standard OAuth (automatic)
- **Self-hosted Odoo users**: Use API Key Authentication (easiest)
- **Enterprise with OAuth server**: Use Custom OAuth (requires IT setup)

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
