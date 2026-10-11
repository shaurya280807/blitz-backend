import { IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ description: 'Administrator username', example: 'blitz_admin' })
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty({ description: 'Administrator password', example: 'your-secure-password' })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;
}
