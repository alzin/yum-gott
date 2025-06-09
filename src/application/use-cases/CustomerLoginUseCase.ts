import { ICustomerRepository } from "@/domain/repositories/ICustomerRepository";
import { IAuthRepository } from "@/domain/repositories/IAuthRepository";
import { IPasswordHasher } from "../interface/IPasswordHasher";
import { LoginRequest , LoginResponse} from "./auth/LoginUseCase";
import { JWTpayload } from "@/domain/entities/AuthToken";
export class CustomerLoginUseCase {
  constructor(
    private customerRepository: ICustomerRepository,
    private authRepository: IAuthRepository,
    private passwordHasher: IPasswordHasher
  ) {}

  async execute(request: LoginRequest): Promise<LoginResponse> {
    const customer = await this.customerRepository.findByEmail(request.email);
    
    if (!customer) {
      throw new Error('Invalid credentials');
    }

    if (!customer.isActive) {
      throw new Error('Account is deactivated');
    }

    const isPasswordValid = await this.passwordHasher.compare(request.password, customer.password);
    if (!isPasswordValid) {
      throw new Error('Invalid credentials');
    }

    const jwtPayload: JWTpayload = {
      userId: customer.id!,
      userType: 'customer',
      email: request.email
    };

    const authToken = await this.authRepository.generateToken(jwtPayload);
    
    const { password, ...userWithoutPassword } = customer;
    
    return {
      user: userWithoutPassword,
      authToken
    };
  }
}