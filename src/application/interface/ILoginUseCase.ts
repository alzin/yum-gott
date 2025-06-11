import { AuthToken } from "@/domain/entities/AuthToken";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: any; // Will be typed to Customer or RestaurantOwner without password
  authToken: AuthToken;
}