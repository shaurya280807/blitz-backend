import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { CreateProjectDto } from './create-project.dto';

describe('CreateProjectDto', () => {
  it('should accept valid UUID arrays for team and tags', async () => {
    const dto = plainToInstance(CreateProjectDto, {
      name: 'BLITZ CMS',
      description: 'Department Content Management System',
      team: ['abacf6a1-9b24-4fa4-a4b4-fc387093eb4c'],
      tags: ['7989fcaf-4322-4734-82fd-fc8ea747618f'],
    });
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should reject non-UUID strings in team array', async () => {
    const dto = plainToInstance(CreateProjectDto, {
      name: 'BLITZ CMS',
      description: 'Department Content Management System',
      team: ['not-a-uuid'],
    });
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('team');
  });

  it('should reject non-UUID strings in tags array', async () => {
    const dto = plainToInstance(CreateProjectDto, {
      name: 'BLITZ CMS',
      description: 'Department Content Management System',
      tags: ['not-a-uuid'],
    });
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('tags');
  });
});
