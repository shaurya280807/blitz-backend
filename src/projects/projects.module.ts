import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ProjectsController } from './projects.controller';
import { ProjectsService } from './projects.service';
import { Project, ProjectSchema } from './schemas/project.schema';
import { TeamMember, TeamMemberSchema } from '../team/schemas/team-member.schema';
import { Tag, TagSchema } from '../tags/schemas/tag.schema';
import { UploadsModule } from '../uploads/uploads.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Project.name, schema: ProjectSchema },
      { name: TeamMember.name, schema: TeamMemberSchema },
      { name: Tag.name, schema: TagSchema },
    ]),
    UploadsModule,
  ],
  controllers: [ProjectsController],
  providers: [ProjectsService],
  exports: [ProjectsService],
})
export class ProjectsModule {}
