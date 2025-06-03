import { User } from "@/domain/entities/User";
import { IPasswordHasher } from "@/application/interface/IPasswordHasher";
import { AuthToken, JWTpayload } from "@/domain/entities/AuthToken";
import { IUserRepository } from "@/domain/repositories/IUserRepository";
import { IAuthRepository } from "@/domain/repositories/IAuthRepository";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: Omit<User, 'password'>;
  authToken: AuthToken;
}

export class LoginUseCase {
  constructor(
    private userRepository: IUserRepository,
    private authRepository: IAuthRepository,
    private passwordHasher: IPasswordHasher
  ) {}

  async execute(request: LoginRequest): Promise<LoginResponse> {
    // Find user by email
    const user = await this.userRepository.findByEmail(request.email);

    if (!user) {
      throw new Error("Invalid credentials");
    }

    if (!user.isActive) {
      throw new Error("Account is deactivated");
    }

    // Check password
    const isPasswordValid = await this.passwordHasher.compare(request.password, user.password);
    if (!isPasswordValid) {
      throw new Error('Invalid credentials');
    }

    // Generate Token
    const jwtPayload: JWTpayload = {
      userId: user.id!,
      userType: user.userType,
      email: user.email // Changed from mobileNumber to email
    };

    const authToken = await this.authRepository.generateToken(jwtPayload);
    
    // Remove password from response
    const { password, ...userWithoutPassword } = user;
    
    return {
      user: userWithoutPassword,
      authToken
    };
  }
}