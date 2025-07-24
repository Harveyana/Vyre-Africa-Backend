interface Auth0JwtPayload {
    sub: string;               // "auth0|123456" or "google|123456"
    email?: string;
    email_verified?: boolean;
    name?: string;
    given_name?: string;
    family_name?: string;
    picture?: string;
    // Add other claims you expect
    [key: string]: any;        // For custom claims
  }
  
  interface VerificationResult {
    success: boolean;
    data?: Auth0JwtPayload;
    error?: any;
  }