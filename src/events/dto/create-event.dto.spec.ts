import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { CreateEventDto } from './create-event.dto';

describe('CreateEventDto', () => {
  it('should pass validation with valid ISO date and fields', async () => {
    const dto = plainToInstance(CreateEventDto, {
      title: 'Coding Marathon',
      description: 'Annual overnight hackathon event',
      date: '2026-11-20T10:00:00.000Z',
      location: 'KMV Auditorium',
      additionalInfo: 'Registration is free',
    });
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should fail validation with invalid date string', async () => {
    const dto = plainToInstance(CreateEventDto, {
      title: 'Coding Marathon',
      description: 'Annual overnight hackathon event',
      date: 'not-a-date',
      location: 'KMV Auditorium',
    });
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('date');
  });

  it('should fail validation when title is missing', async () => {
    const dto = plainToInstance(CreateEventDto, {
      description: 'Description without title',
      date: '2026-11-20T10:00:00.000Z',
      location: 'Online',
    });
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });
});
