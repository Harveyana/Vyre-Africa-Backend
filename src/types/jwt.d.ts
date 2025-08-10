interface Auth0JwtPayload {
  email: string;
  userId: string;
  lastName: string;
  photoUrl?: string;
  firstName: string;
  phoneNumber?: string;
  lastSignedIn?: string;
  emailVerified: boolean;
  userCreatedAt: string;
  // Standard JWT claims
  iss?: string;
  sub?: string;
  aud?: string | string[];
  iat?: number;
  exp?: number;
  nbf?: number;
  // For any additional custom claims
  [key: string]: any;
}

interface VerificationResult {
  success: boolean;
  data?: Auth0JwtPayload;
  error?: {
    message: string;
    code?: string;
    details?: any;
  };
}