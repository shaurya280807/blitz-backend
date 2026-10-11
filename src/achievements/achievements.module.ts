import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Achievement, AchievementSchema } from './schemas/achievement.schema';
import { AchievementsService } from './achievements.service';
import { AchievementsController } from './achievements.controller';
import { UploadsModule } from '../uploads/uploads.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Achievement.name, schema: AchievementSchema }]),
    UploadsModule,
  ],
  controllers: [AchievementsController],
  providers: [AchievementsService],
  exports: [AchievementsService, MongooseModule],
})
export class AchievementsModule {}
