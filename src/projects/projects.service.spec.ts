import { BadRequestException } from '@nestjs/common';
import { ProjectsService } from './projects.service';

describe('ProjectsService', () => {
  let projectsService: ProjectsService;
  let mockProjectModel: any;
  let mockMemberModel: any;
  let mockTagModel: any;
  let mockUploadsService: any;

  beforeEach(() => {
    mockProjectModel = jest.fn().mockImplementation((data) => ({
      ...data,
      _id: 'proj-1',
      save: jest.fn().mockResolvedValue({ _id: 'proj-1', ...data }),
    }));
    mockProjectModel.find = jest.fn();
    mockProjectModel.findById = jest.fn();

    mockMemberModel = {
      find: jest.fn(),
    };

    mockTagModel = {
      find: jest.fn(),
    };

    mockUploadsService = {
      deleteImage: jest.fn(),
    };

    projectsService = new ProjectsService(
      mockProjectModel,
      mockMemberModel,
      mockTagModel,
      mockUploadsService,
    );
  });

  it('should throw BadRequestException if any referenced team members do not exist', async () => {
    // Member lookup returns only member-1, but payload specifies member-1 and member-missing
    mockMemberModel.find.mockReturnValue({
      select: jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue([{ _id: 'member-1' }]),
      }),
    });

    await expect(
      projectsService.create({
        name: 'Website',
        description: 'Frontend website',
        team: ['member-1', 'member-missing'],
        tags: [],
      }),
    ).rejects.toThrow(BadRequestException);
  });

  it('should throw BadRequestException if any referenced tags do not exist', async () => {
    mockMemberModel.find.mockReturnValue({
      select: jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue([]),
      }),
    });
    mockTagModel.find.mockReturnValue({
      select: jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue([{ _id: 'tag-1' }]),
      }),
    });

    await expect(
      projectsService.create({
        name: 'Website',
        description: 'Frontend website',
        team: [],
        tags: ['tag-1', 'tag-missing'],
      }),
    ).rejects.toThrow(BadRequestException);
  });
});
