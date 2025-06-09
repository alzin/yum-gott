export interface AuthToken {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface JWTpayload {
  userId: string;
  userType: 'customer' | 'restaurant_owner';
  email: string;
}