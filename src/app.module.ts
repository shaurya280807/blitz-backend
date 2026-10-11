import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { ServeStaticModule } from '@nestjs/serve-static';
import * as path from 'path';

import configuration from './config/configuration';
import { configValidationSchema } from './config/config.schema';
import { DatabaseModule } from './database/database.module';
import { AdminModule } from './admin/admin.module';
import { AuthModule } from './auth/auth.module';
import { EventsModule } from './events/events.module';
import { TeamMembersModule } from './team-members/team-members.module';
import { TagsModule } from './tags/tags.module';
import { ProjectsModule } from './projects/projects.module';
import { AchievementsModule } from './achievements/achievements.module';
import { GalleryModule } from './gallery/gallery.module';
import { UploadsModule } from './uploads/uploads.module';
import { HealthModule } from './health/health.module';

@Module({
  imports: [
    // 1. Central Configuration with Joi Schema Validation
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      validationSchema: configValidationSchema,
      validationOptions: {
        abortEarly: false,
      },
    }),

    // 2. Persistent Database Connection
    DatabaseModule,

    // 3. Central Rate Limiting
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // 60 seconds
        limit: 30, // 30 requests per minute by default
      },
    ]),

    // 4. Static File Serving for WebP Uploads
    ServeStaticModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const uploadDir = configService.get<string>('uploads.dir') || 'uploads';
        return [
          {
            rootPath: path.resolve(process.cwd(), uploadDir),
            serveRoot: '/uploads',
            serveStaticOptions: {
              index: false,
              maxAge: '7d',
            },
          },
        ];
      },
    }),

    // 5. Application Domain Modules
    AdminModule,
    AuthModule,
    EventsModule,
    TeamMembersModule,
    TagsModule,
    ProjectsModule,
    AchievementsModule,
    GalleryModule,
    UploadsModule,
    HealthModule,
  ],
})
export class AppModule {}
