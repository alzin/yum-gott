export interface AuthToken {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface JWTpayload {
  userId: string;
  userType: string;
  mobileNumber: string;
}
