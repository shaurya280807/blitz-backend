import { BadRequestException } from '@nestjs/common';
import { ParseUUIDPipe } from './parse-uuid.pipe';

describe('ParseUUIDPipe', () => {
  let pipe: ParseUUIDPipe;

  beforeEach(() => {
    pipe = new ParseUUIDPipe();
  });

  it('should allow valid UUID v4', () => {
    const validUuid = '123e4567-e89b-12d3-a456-426614174000';
    expect(pipe.transform(validUuid)).toBe(validUuid);
  });

  it('should throw BadRequestException for invalid UUID string', () => {
    expect(() => pipe.transform('invalid-uuid-string')).toThrow(BadRequestException);
  });

  it('should throw BadRequestException for empty string', () => {
    expect(() => pipe.transform('')).toThrow(BadRequestException);
  });

  it('should throw BadRequestException for numeric string', () => {
    expect(() => pipe.transform('123456')).toThrow(BadRequestException);
  });
});
