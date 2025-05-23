import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { User } from '../user/entities/user.entity';
import { Repository } from 'typeorm';
import { EmailService } from '../Mailing/email.service';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly usersService: UserService,
    private readonly mailerService: EmailService,
  ) {}


  async login(email: string, password: string): Promise<{ token: string }> {
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' },
    );

    return { token };
  }

  
  async requestPasswordReset(email: string) {
    const user = await this.usersService.findOneByEmail(email);
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    const payload = { sub: user.id, email: user.email };
    const resetToken = this.jwtService.sign(payload, { expiresIn: '1h' });

    await this.mailerService.sendPasswordResetEmail(user.email, resetToken);

    return { message: 'Correo de recuperación enviado' };
  }

  async resetPassword(token: string, newPassword: string) {
    try {
      const decoded = this.jwtService.verify(token);
      if (!decoded || !decoded.sub) {
        throw new BadRequestException('Token inválido o expirado');
      }

      const user = await this.usersService.findOne(decoded.sub);
      if (!user) {
        throw new NotFoundException('Usuario no encontrado');
      }

      await this.usersService.updatePassword(user.id, newPassword);

      return { message: 'Contraseña actualizada con éxito' };
    } catch (error) {
      throw new BadRequestException(
        error.message.includes('invalid signature')
          ? 'Token inválido'
          : 'Token expirado o incorrecto',
      );
    }
  }

}
