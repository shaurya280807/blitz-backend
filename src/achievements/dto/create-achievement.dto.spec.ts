import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { CreateAchievementDto } from './create-achievement.dto';

describe('CreateAchievementDto', () => {
  it('should accept valid achievement with string team and year number', async () => {
    const dto = plainToInstance(CreateAchievementDto, {
      year: 2026,
      title: 'Smart India Hackathon',
      team: 'Team Blitz Alpha', // string, not uuid
      event: 'SIH 2026',
      result: 'Finalists',
    });
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should reject year outside sensible range', async () => {
    const dto = plainToInstance(CreateAchievementDto, {
      year: 1980,
      title: 'Legacy Award',
      team: 'Team Old',
      event: 'Old Event',
      result: 'Winner',
    });
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('year');
  });
});
