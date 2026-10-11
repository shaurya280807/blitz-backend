import { ConflictException, NotFoundException } from '@nestjs/common';
import { TagsService } from './tags.service';

describe('TagsService', () => {
  let tagsService: TagsService;
  let mockTagModel: any;

  beforeEach(() => {
    mockTagModel = jest.fn().mockImplementation((dto) => ({
      ...dto,
      _id: 'tag-uuid-1',
      save: jest.fn().mockResolvedValue({ _id: 'tag-uuid-1', name: dto.name }),
    }));
    mockTagModel.find = jest.fn();
    mockTagModel.findOne = jest.fn();
    mockTagModel.findById = jest.fn();
    mockTagModel.findByIdAndDelete = jest.fn();
    mockTagModel.db = {
      collection: jest.fn().mockReturnValue({
        updateMany: jest.fn().mockResolvedValue({ modifiedCount: 2 }),
      }),
    };

    tagsService = new TagsService(mockTagModel);
  });

  it('should normalize tag name to lowercase trimmed upon creation', async () => {
    mockTagModel.findOne.mockReturnValue({
      exec: jest.fn().mockResolvedValue(null),
    });

    const result = await tagsService.create({ name: '  TypeScript  ' });
    expect(mockTagModel).toHaveBeenCalledWith({ name: 'typescript' });
    expect(result).toHaveProperty('name', 'typescript');
  });

  it('should throw ConflictException if tag name already exists', async () => {
    mockTagModel.findOne.mockReturnValue({
      exec: jest.fn().mockResolvedValue({ _id: 'existing-id', name: 'react' }),
    });

    await expect(tagsService.create({ name: 'React' })).rejects.toThrow(ConflictException);
  });

  it('should throw NotFoundException when looking up non-existent tag', async () => {
    mockTagModel.findById.mockReturnValue({
      exec: jest.fn().mockResolvedValue(null),
    });

    await expect(tagsService.findById('missing-uuid')).rejects.toThrow(NotFoundException);
  });
});
