import { ICustomerRepository, IAuthRepository } from "@/domain/repositories/index";
import { IPasswordHasher } from "@/application/interface/IPasswordHasher";
import { LoginRequest, LoginResponse } from "@/application/use-cases/auth";
import { JWTpayload } from "@/domain/entities/AuthToken";
export class CustomerLoginUseCase {
  constructor(
    private customerRepository: ICustomerRepository,
    private authRepository: IAuthRepository,
    private passwordHasher: IPasswordHasher
  ) { }

  async execute(request: LoginRequest): Promise<LoginResponse> {
    const customer = await this.customerRepository.findByEmail(request.email);

    if (!customer) {
      throw new Error('البريد الإلكتروني أو كلمة المرور غير صحيحة');
    }

    if (!customer.isActive) {
      throw new Error('تم تعطيل الحساب');
    }

    // if (!customer.isEmailVerified) {
    //   throw new Error('Please verify your email before logging in. Check your email for the verification link.');
    // }

    if (!customer.isEmailVerified) {
      throw new Error('يرجى تأكيد بريدك الإلكتروني قبل تسجيل الدخول. تحقق من بريدك الإلكتروني للحصول على رابط التحقق');
    }

    const isPasswordValid = await this.passwordHasher.compare(request.password, customer.password);
    if (!isPasswordValid) {
      throw new Error('البريد الإلكتروني أو كلمة المرور غير صحيحة');
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