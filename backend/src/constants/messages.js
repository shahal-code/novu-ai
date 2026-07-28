export const MESSAGES = {
  AUTH: {
    INVALID_CREDS: 'Enter a valid email and password.',
    PASSWORD_LENGTH: 'Password must be at least 8 characters.',
    EMAIL_PWD_REQUIRED: 'Email and password are required.',
    LOGIN_FAILED: 'Invalid email or password.',
    INVALID_EMAIL: 'Enter a valid email address.',
    OTP_SENT: 'Verification code sent.',
    OTP_SEND_ERROR: 'Unable to send the verification email. Try again shortly.',
    OTP_VERIFY_ERROR: 'Unable to verify the code. Try again.',
    GOOGLE_NOT_CONFIGURED: 'Google sign-in is not configured.',
    GOOGLE_INVALID_RESPONSE: 'Invalid OAuth response',
    GOOGLE_TOKEN_FAILED: 'Google token exchange failed',
    GOOGLE_NO_EMAIL: 'Google did not provide a verified email',
    GOOGLE_OAUTH_ERROR: 'Google sign-in could not be completed.',
  },
  USER: {
    NOT_FOUND: 'User not found',
  },
  CHAT: {
    MESSAGES_REQUIRED: 'messages array required',
  },
  CONVERSATION: {
    TITLE_REQUIRED: 'Title is required',
    NOT_FOUND: 'Conversation not found',
    ROLE_CONTENT_REQUIRED: 'role and content required',
  },
  GLOBAL: {
    SERVER_ERROR: 'Server error',
    UNSUPPORTED_FILE: 'Unsupported file type',
    NO_FILE: 'No file uploaded',
  }
};
