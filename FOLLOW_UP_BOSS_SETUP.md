# Follow Up Boss CRM Integration Setup

## Overview

Your platform now automatically sends new client leads to Follow Up Boss CRM when they register on your website!

**What happens automatically:**
1. ✅ New client registers on website
2. ✅ Welcome email sent to client
3. ✅ **Admin notification email sent to you** (josh@capitalcitygroup.ca)
4. ✅ **Lead created in Follow Up Boss CRM** with full details

---

## ✅ Admin Notification (Already Working!)

Every time a new client registers, you'll receive an email with:

**Subject:** 🎉 New Client Registration: [Client Name]

**Email includes:**
- Client's full contact details (name, email, phone)
- Portal username and credentials
- Registration date
- Portal expiry date (90 days)
- Link to admin dashboard
- Next steps for follow-up

**Sent to:** josh@capitalcitygroup.ca

**Status:** ✅ Already configured and working!

---

## 🔧 Follow Up Boss Setup (5 minutes)

### Step 1: Get Your Follow Up Boss API Key

1. **Log into Follow Up Boss**: https://app.followupboss.com

2. **Go to Settings**:
   - Click your name (top right)
   - Select "Account Settings"

3. **Navigate to API**:
   - Click "Integrations" in left menu
   - Click "API"

4. **Generate API Key**:
   - Click "Create New API Key"
   - Name: "PREC Website Integration"
   - **Copy the API key** (looks like: `fub_xxxxxxxxxxxx`)

### Step 2: Add API Key to Platform

Once you have the API key, give it to me and I'll add it to `.env.local`:

```bash
FOLLOW_UP_BOSS_API_KEY=fub_your_api_key_here
```

Then restart the dev server.

---

## 🧪 Testing

### Test Admin Notification (Works Now!)

1. Go to: http://localhost:3000/portal/register
2. Register a test client:
   - Name: Test User
   - Email: test@example.com
   - Phone: 250-555-1234
   - Accept Terms

3. **Check your email** (josh@capitalcitygroup.ca):
   - You should receive: "🎉 New Client Registration: Test User"
   - Email contains all client details
   - Includes link to admin dashboard

### Test Follow Up Boss Integration (After API Key Added)

1. Register another test client
2. Check Follow Up Boss dashboard
3. You should see new lead created with:
   - Name, email, phone
   - Source: "PREC Real Estate Website"
   - Tags: "Website Registration", "Client Portal"
   - Custom fields: portal username, expiry date
   - Notes: Registration details

---

## 📊 What Gets Sent to Follow Up Boss

When a client registers, this lead information is created:

```json
{
  "firstName": "John",
  "lastName": "Doe",
  "emails": [{ "value": "john@example.com" }],
  "phones": [{ "value": "250-555-1234" }],
  "source": "PREC Real Estate Website",
  "tags": ["Website Registration", "Client Portal"],
  "customFields": {
    "portal_username": "johndoe123",
    "portal_expiry": "2025-03-01",
    "registration_date": "2024-12-01",
    "source_detail": "Website Client Portal Registration",
    "initial_search": "Victoria Homes $500k-$800k"
  },
  "notes": "New client registered via PREC Real Estate portal..."
}
```

---

## 🔄 What Happens on Registration

**Client's Perspective:**
1. Fills out registration form
2. Clicks "Create Account"
3. Receives welcome email with login credentials
4. Can immediately access portal

**Your Perspective:**
1. Receive admin notification email instantly
2. Lead automatically created in Follow Up Boss
3. Client visible in admin dashboard
4. Ready for follow-up!

---

## 💡 Benefits

**Admin Email Notifications:**
- ✅ Instant alerts when new leads come in
- ✅ All contact details in one email
- ✅ No need to check dashboard constantly
- ✅ Can forward to team members

**Follow Up Boss Integration:**
- ✅ Automatic lead capture
- ✅ No manual data entry
- ✅ Consistent CRM data
- ✅ Trigger your follow-up workflows
- ✅ Track lead source accurately
- ✅ Integration with your existing systems

---

## ⚙️ Configuration Options

All configured in `.env.local`:

```bash
# Admin email for notifications
ADMIN_EMAIL=josh@capitalcitygroup.ca

# Follow Up Boss CRM (get from FUB dashboard)
FOLLOW_UP_BOSS_API_KEY=your-api-key-here
```

---

## 🚨 Troubleshooting

### Admin Email Not Received?

1. **Check spam folder**
2. **Verify ADMIN_EMAIL** in `.env.local`
3. **Check server logs** for email errors
4. **Test SMTP**: http://localhost:3000/api/test/email

### Follow Up Boss Lead Not Created?

1. **Verify API key** is correct in `.env.local`
2. **Check server logs** for FUB errors
3. **Verify API permissions** in Follow Up Boss
4. **Note:** If API key is not configured, it will skip gracefully (won't break registration)

---

## 📝 Notes

- **Admin notifications work immediately** - no setup required!
- **Follow Up Boss is optional** - registration works without it
- **Graceful fallback** - if FUB fails, registration still completes
- **Privacy compliant** - client has accepted Terms of Use
- **Duplicate handling** - Follow Up Boss merges by email

---

## 🎯 Next Steps

1. ✅ **Admin notifications** - Already working!
2. ⏳ **Get Follow Up Boss API key** - Follow Step 1 above
3. ⏳ **Add API key to platform** - Give it to me to configure
4. ✅ **Test registration** - Try it out!
5. ✅ **Set up workflows** in Follow Up Boss for new website leads

---

## 🔗 Resources

- **Follow Up Boss Dashboard**: https://app.followupboss.com
- **Follow Up Boss API Docs**: https://docs.followupboss.com
- **Your Admin Dashboard**: http://localhost:3000/admin

---

**Questions?** Test the admin notification now by registering a client!
