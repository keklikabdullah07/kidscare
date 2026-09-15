import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';

const COST = 10;

@Injectable()
export class PasswordService {
  async hash(plain: string): Promise<string> {
    return bcrypt.hash(plain, COST);
  }

  async verify(plain: string, hash: string): Promise<boolean> {
    return bcrypt.compare(plain, hash);
  }
}
