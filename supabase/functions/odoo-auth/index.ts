@@ .. @@
     }

-    // Exchange code for tokens
-    const tokenResponse = await fetch('https://accounts.odoo.com/oauth/token', {
+    // Exchange code for tokens  
+    const tokenResponse = await fetch('https://accounts.odoo.com/oauth2/tokeninfo', {
       method: 'POST',