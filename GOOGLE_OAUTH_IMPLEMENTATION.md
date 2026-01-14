# Google OAuth Implementation Guide

## Overview

This document describes the Google OAuth authentication implementation for the Whispr platform. The implementation supports both **Organizers** and **Attendees** with seamless "Sign in with Google" functionality.

## Features

- ✅ Google OAuth Sign-In for Organizers
- ✅ Google OAuth Sign-In for Attendees
- ✅ Automatic account creation for new users
- ✅ Seamless login for existing users
- ✅ Full integration with existing email/password authentication
- ✅ Google branding compliance
- ✅ Responsive design with loading states
- ✅ Error handling with user-friendly messages

## Architecture

### Components

#### 1. GoogleOAuthButton Component
**Location:** `/components/auth/GoogleOAuthButton.tsx`

A reusable button component that follows Google's branding guidelines.

**Props:**
- `userType`: `"organizer" | "attendee"` - Determines which OAuth endpoint to use
- `mode`: `"signin" | "signup"` - Changes button text (optional, defaults to "signin")
- `className`: Additional CSS classes (optional)

**Usage:**
```tsx
<GoogleOAuthButton userType="organizer" mode="signin" />
<GoogleOAuthButton userType="attendee" mode="signup" />
```

#### 2. OAuth Utility Functions
**Location:** `/lib/oauth.ts`

Helper functions for OAuth flow management:
- `persistOAuthSession()` - Stores token and user data in localStorage
- `initiateOrganizerOAuth()` - Starts OAuth flow for organizers
- `initiateAttendeeOAuth()` - Starts OAuth flow for attendees
- `handleOAuthCallback()` - Processes callback response
- `getPostAuthRedirect()` - Determines post-auth redirect URL

#### 3. Callback Pages

**Organizer Callback:** `/app/auth/google/organizer/callback/page.tsx`
**Attendee Callback:** `/app/auth/google/attendee/callback/page.tsx`

These pages handle the OAuth callback from the backend and:
1. Extract token and user data from query parameters or URL hash
2. Store authentication data in localStorage
3. Redirect to appropriate dashboard
4. Handle errors gracefully

### Integration Points

#### Main Auth Page
**Location:** `/app/auth/AuthContent.tsx`

The unified authentication page includes:
- Google OAuth button for both organizers and attendees
- "OR" divider separating OAuth from email/password form
- Existing email/password authentication (unchanged)

#### Legacy Organizer Page
**Location:** `/app/organizers/page.tsx`

Also includes Google OAuth button for backward compatibility.

## Authentication Flow

### User Journey

1. **User clicks "Sign in with Google"**
   - Button triggers redirect to backend OAuth endpoint
   - Shows loading state during redirect

2. **Backend handles OAuth**
   - Redirects to Google OAuth consent screen
   - User authenticates with Google
   - Google redirects back to backend callback endpoint

3. **Backend processes OAuth**
   - Creates new account if user doesn't exist
   - Logs in existing user
   - Generates JWT token
   - Redirects to frontend callback page

4. **Frontend callback page**
   - Extracts token and user data from URL
   - Stores in localStorage:
     - `whispr_token` - JWT token
     - `token` - Legacy token key
     - `whispr_role` - User role ("organizer" or "attendee")
     - `user` - User data object

5. **Final redirect**
   - Organizers → `/organizers/dashboard`
   - Attendees (onboarded) → `/attendees/dashboard`
   - Attendees (not onboarded) → `/attendees/onboarding`

## Backend Integration

### Required Backend Endpoints

The backend must implement the following endpoints:

#### OAuth Initiation
- `GET /auth/google/organizer` - Starts OAuth for organizers
- `GET /auth/google/attendee` - Starts OAuth for attendees

#### OAuth Callbacks
- `GET /auth/google/organizer/callback` - Handles Google callback for organizers
- `GET /auth/google/attendee/callback` - Handles Google callback for attendees

### Backend Redirect Configuration

The backend must redirect to the frontend callback URLs after processing OAuth:

**Organizer Callback URL:**
```
http://localhost:3000/auth/google/organizer/callback?token=<JWT>&user_id=<ID>&user_name=<NAME>&user_email=<EMAIL>
```

**Attendee Callback URL:**
```
http://localhost:3000/auth/google/attendee/callback?token=<JWT>&user_id=<ID>&user_name=<NAME>&user_email=<EMAIL>&is_onboarded=<BOOLEAN>
```

**Alternative: URL Hash (Fragment)**

If using URL hash for security (token won't be sent to server in logs):
```
http://localhost:3000/auth/google/organizer/callback#token=<JWT>&user_id=<ID>&...
```

The frontend handles both query parameters and hash fragments.

### Expected Response Format

When the backend processes OAuth, it should generate data in this format (used for redirect parameters):

**Organizer:**
```json
{
  "message": "Login successful",
  "organizer": {
    "id": "recXXXXXXXXXX",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "organizer"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Attendee:**
```json
{
  "message": "Account created and login successful",
  "attendee": {
    "id": "recXXXXXXXXXX",
    "name": "Jane Doe",
    "email": "jane@example.com",
    "role": "attendee",
    "is_onboarded": false
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

## Configuration

### Environment Variables

**Required:**
```env
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000/api
```

The OAuth flow automatically derives the base URL by removing `/api` from this value.

**For production:**
```env
NEXT_PUBLIC_API_URL=https://api.yourdomain.com/api
```

### Backend Configuration

The backend needs to configure:
1. **Google OAuth Client ID and Secret**
2. **Redirect URIs** (must match callback endpoints)
3. **Frontend Callback URLs** (where to redirect after OAuth)

## Error Handling

The implementation includes comprehensive error handling:

### User-Facing Errors

1. **OAuth Cancellation** - User cancels Google login
   - Shows error message
   - Redirects back to login page after 3 seconds

2. **Missing Token** - Backend doesn't provide token
   - Shows "Authentication failed" message
   - Redirects back to login page

3. **Invalid Response** - Malformed callback data
   - Shows error message
   - Redirects back to login page

### Loading States

- Button shows loading spinner during redirect
- Callback page shows animated loader with message
- Error states show clear error icons and messages

## Testing Checklist

### Organizer Flow

- [ ] Click "Sign in with Google" on organizer login
- [ ] Complete Google authentication
- [ ] New user: account created, redirected to dashboard
- [ ] Existing user: logged in, redirected to dashboard
- [ ] Cancel OAuth: gracefully returns to login
- [ ] Email/password login still works

### Attendee Flow

- [ ] Click "Sign in with Google" on attendee login
- [ ] Complete Google authentication
- [ ] New user: account created, redirected to onboarding
- [ ] Existing user (onboarded): logged in, redirected to dashboard
- [ ] Existing user (not onboarded): redirected to onboarding
- [ ] Cancel OAuth: gracefully returns to login
- [ ] Email/password login still works

### Edge Cases

- [ ] User with existing email/password account signs in with Google
- [ ] Multiple accounts with same email (if supported)
- [ ] Network errors during OAuth flow
- [ ] Backend errors (500, 503, etc.)
- [ ] Invalid/expired tokens

## Security Considerations

1. **Token Storage**
   - Tokens stored in localStorage (client-side only)
   - Tokens auto-attached to API requests via Axios interceptor
   - Consider using httpOnly cookies for production

2. **CSRF Protection**
   - Backend should implement state parameter validation
   - Frontend callback validates redirect source

3. **HTTPS**
   - Production must use HTTPS for OAuth
   - Google requires HTTPS for redirect URIs in production

4. **Token Expiration**
   - Backend should implement token expiration
   - Frontend should handle token refresh

## Future Enhancements

Potential improvements for future iterations:

1. **Popup Flow** - Open OAuth in popup instead of redirect
2. **Account Linking** - Link Google account to existing email/password account
3. **Token Refresh** - Automatic token refresh handling
4. **Remember Me** - Persistent login option
5. **Multiple OAuth Providers** - Facebook, Apple, etc.
6. **Error Analytics** - Track OAuth errors for debugging

## Troubleshooting

### Common Issues

**Issue: "Authentication failed: No token received"**
- Check backend redirect URL configuration
- Verify callback URLs match frontend routes
- Check browser console for redirect errors

**Issue: Infinite redirect loop**
- Check for conflicts in route handlers
- Verify token storage is working
- Clear localStorage and try again

**Issue: "Failed to authenticate with Google"**
- Check Google OAuth credentials in backend
- Verify redirect URIs in Google Console
- Check CORS configuration

**Issue: Button doesn't redirect**
- Verify NEXT_PUBLIC_API_URL is set
- Check browser console for errors
- Verify backend endpoints are accessible

### Debug Mode

To debug OAuth flow:
1. Open browser DevTools → Network tab
2. Click "Sign in with Google"
3. Follow redirect chain
4. Check final callback URL parameters
5. Verify token storage in Application → Local Storage

## Support

For issues or questions:
1. Check this documentation
2. Review error messages in browser console
3. Verify backend configuration
4. Check backend logs for OAuth errors

## Version History

- **v1.0.0** (2026-01-13) - Initial implementation
  - Google OAuth for organizers and attendees
  - Callback page handlers
  - Error handling and loading states
  - Integration with existing auth flows
