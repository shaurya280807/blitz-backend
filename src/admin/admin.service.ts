import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { Admin, AdminDocument } from './schemas/admin.schema';

@Injectable()
export class AdminService {
  private readonly logger = new Logger(AdminService.name);

  constructor(@InjectModel(Admin.name) private readonly adminModel: Model<AdminDocument>) {}

  async findByUsername(username: string): Promise<AdminDocument | null> {
    return this.adminModel.findOne({ username }).exec();
  }

  async validatePassword(admin: Admin | AdminDocument, password: string): Promise<boolean> {
    return bcrypt.compare(password, admin.passwordHash);
  }

  async createAdmin(username: string, password: string): Promise<AdminDocument> {
    const passwordHash = await bcrypt.hash(password, 12);
    const admin = new this.adminModel({ username, passwordHash });
    return admin.save();
  }

  async seedAdminIfNone(username: string, password: string): Promise<void> {
    const count = await this.adminModel.countDocuments().exec();
    if (count > 0) {
      this.logger.log('Admin already exists — skipping seed.');
      return;
    }
    await this.createAdmin(username, password);
    this.logger.log(`Admin "${username}" created successfully.`);
  }
}
