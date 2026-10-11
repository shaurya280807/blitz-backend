import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { LoginDto } from './login.dto';

describe('LoginDto', () => {
  it('should pass with valid username and password', async () => {
    const dto = plainToInstance(LoginDto, {
      username: 'president',
      password: 'super-secure-password',
    });
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should fail with password shorter than 6 characters', async () => {
    const dto = plainToInstance(LoginDto, {
      username: 'president',
      password: '123',
    });
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('password');
  });

  it('should fail with empty username', async () => {
    const dto = plainToInstance(LoginDto, {
      username: '',
      password: 'validpassword',
    });
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('username');
  });
});
