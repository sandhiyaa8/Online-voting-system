# OTP Verification Implementation - VotMan Voting System

## Overview
OTP (One-Time Password) verification has been successfully integrated into the Tamil Nadu Voting System for enhanced security during user login. Users now receive a 6-digit OTP on their registered mobile number after entering their credentials.

## Features Added

### 1. **Backend Changes**

#### Updated User Model (`backend/models/user.js`)
- Added `otp` field: Stores the generated OTP
- Added `otpExpiry` field: Stores the OTP expiration timestamp (5 minutes)
- Added `otpVerified` field: Boolean flag to track OTP verification status

#### New OTP Helper Module (`backend/utils/otpHelper.js`)
Contains utility functions:
- `generateOTP()`: Generates a random 6-digit OTP
- `getOTPExpiry()`: Returns expiry timestamp (5 minutes from now)
- `sendOTPViaSMS()`: Sends OTP to user's mobile (currently logs to console for demo)
- `verifyOTP()`: Validates OTP correctness and expiration

#### Updated Server Endpoints (`backend/server.js`)

**Modified `/login` Endpoint**
- Now generates an OTP and sends it to the user's mobile
- Returns a temporary JWT token valid for 5 minutes
- Returns masked mobile number (last 4 digits) for display
- Response: `{ message, tempToken, userId, mobile }`

**New `/verify-otp` Endpoint** (POST)
- Request: `{ userId, otp }`
- Validates OTP correctness and expiration
- Clears OTP data after successful verification
- Returns final authentication token for accessing voting features
- Response: `{ message, token, user: { id, username, fullname, taluk } }`

**New `/resend-otp` Endpoint** (POST)
- Request: `{ userId }`
- Generates and sends a new OTP
- Updates OTP expiry time
- Response: `{ message, mobile }`

### 2. **Frontend Changes**

#### New OTP Verification Page (`frontend/otp.html`)
- Professional UI with 6-digit OTP input fields
- Real-time input validation (numbers only)
- Auto-focus navigation between fields
- Paste support for OTP codes
- Resend OTP button with 30-second cooldown timer
- Displays masked mobile number where OTP was sent
- Back to login option
- Responsive design matching existing styling

#### Updated Login Handler (`frontend/script.js`)
- Modified login form to trigger OTP flow instead of direct authentication
- Stores temporary credentials for OTP verification:
  - `tempToken`: Temporary JWT for OTP verification
  - `userId`: User ID for OTP verification
  - `userMobile`: Masked mobile number for display

#### New OTP Handler (`frontend/script.js`)
Features:
- OTP input validation (6 digits)
- Automatic form submission when all 6 digits are entered
- Clear error messages
- Resend OTP functionality with 30-second cooldown
- Handles clipboard paste of full 6-digit OTP
- Backspace navigation between fields
- Auto-focus on first input field

### 3. **Security Enhancements**
- 6-digit OTP with 5-minute expiration
- OTP is verified server-side before granting access
- Temporary tokens are short-lived (5 minutes)
- OTP is cleared after verification
- Password authentication remains in place (2-factor security)

## Login Flow

```
User → Login Page
↓
Username + Password
↓
/login endpoint (verify credentials)
↓
Generate OTP & Send to Mobile
↓
Return tempToken + userId
↓
Redirect to OTP Verification Page
↓
User enters 6-digit OTP
↓
/verify-otp endpoint (validate OTP)
↓
Generate final authentication token
↓
Clear temporary data
↓
Redirect to Home/Voting Page
```

## How to Use

### For Users:
1. Go to login page
2. Enter username and password
3. Click "Next"
4. Receive OTP on registered mobile number
5. Enter the 6-digit OTP on the verification page
6. OTP is validated and you're logged in
7. Access voting dashboard

### For Developers:

**SMS Integration (Production)**
Replace the `sendOTPViaSMS()` function in `backend/utils/otpHelper.js` with your preferred SMS service:

**Example with Twilio:**
```javascript
const twilio = require('twilio');
const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

async function sendOTPViaSMS(mobile, otp) {
  await client.messages.create({
    body: `Your OTP for Tamil Nadu Voting System is: ${otp}. Valid for 5 minutes.`,
    from: process.env.TWILIO_PHONE_NUMBER,
    to: mobile
  });
}
```

**Add to `.env`:**
```
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=+1234567890
```

**Example with AWS SNS:**
```javascript
const AWS = require('aws-sdk');
const sns = new AWS.SNS();

async function sendOTPViaSMS(mobile, otp) {
  const params = {
    Message: `Your OTP for Tamil Nadu Voting System is: ${otp}. Valid for 5 minutes.`,
    PhoneNumber: mobile
  };
  await sns.publish(params).promise();
}
```

## Files Modified/Created

### Modified Files:
- `backend/models/user.js` - Added OTP fields
- `backend/server.js` - Added OTP endpoints and modified login
- `frontend/script.js` - Added OTP handling logic

### New Files:
- `backend/utils/otpHelper.js` - OTP utility functions
- `frontend/otp.html` - OTP verification page

## Testing the OTP Feature

1. **Start Backend:**
   ```bash
   cd backend
   npm install
   npm run dev
   ```

2. **Open Frontend:**
   - Open `frontend/login.html` in browser or serve through a web server
   - Or navigate to your deployed frontend

3. **Test Login with OTP:**
   - Enter valid username and password
   - Check browser console for OTP (logged by sendOTPViaSMS function)
   - Enter the OTP in the verification page
   - Should successfully redirect to home page

## OTP Configuration

- **Length:** 6 digits
- **Expiry:** 5 minutes
- **Resend Cooldown:** 30 seconds
- **Max Attempts:** Unlimited (can be configured in production)

## Future Enhancements

1. Add rate limiting to prevent OTP brute force
2. Implement max OTP attempt limits
3. Add SMS service integration (Twilio/AWS SNS)
4. Add email OTP as backup option
5. Implement OTP resend limits
6. Add user notification preferences
7. Implement device fingerprinting for trusted devices

## Support & Notes

- OTP verification is mandatory for all logins
- Temporary token is valid only for 5 minutes for OTP verification
- Each new login request generates a new OTP
- Users can resend OTP after 30 seconds
- Mobile number is masked for privacy (displays last 4 digits)
