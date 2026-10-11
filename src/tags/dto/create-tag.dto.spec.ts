import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { CreateTagDto } from './create-tag.dto';

describe('CreateTagDto', () => {
  it('should pass validation with valid name', async () => {
    const dto = plainToInstance(CreateTagDto, { name: 'Full-Stack' });
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should fail when name is empty', async () => {
    const dto = plainToInstance(CreateTagDto, { name: '' });
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });

  it('should fail when name is missing', async () => {
    const dto = plainToInstance(CreateTagDto, {});
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });
});
