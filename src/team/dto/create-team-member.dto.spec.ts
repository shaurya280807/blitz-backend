import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { CreateTeamMemberDto } from './create-team-member.dto';
import { TeamMemberTier } from '../schemas/team-member.schema';

describe('CreateTeamMemberDto', () => {
  it('should pass with valid tier and required properties', async () => {
    const dto = plainToInstance(CreateTeamMemberDto, {
      name: 'Rohan Verma',
      position: 'President',
      tier: TeamMemberTier.CORE,
      bio: 'Lead developer and organizer',
      linkedin: 'https://linkedin.com/in/rohanverma',
    });
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should reject invalid membership tier', async () => {
    const dto = plainToInstance(CreateTeamMemberDto, {
      name: 'Rohan Verma',
      position: 'President',
      tier: 'executive' as any,
    });
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('tier');
  });
});
