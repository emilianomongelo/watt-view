import { IsString, IsNumber, IsOptional, validateSync } from 'class-validator';
import { plainToInstance, Transform } from 'class-transformer';

export class Environment {
  @IsString()
  GROWATT_USERNAME = '';

  @IsString()
  GROWATT_PASSWORD = '';

  @IsString()
  @IsOptional()
  GROWATT_PLANT_ID = '';

  @Transform(({ value }) => parseFloat(value))
  @IsNumber()
  SOLAR_LAT = -34.556960;

  @Transform(({ value }) => parseFloat(value))
  @IsNumber()
  SOLAR_LON = -68.307736;

  @IsString()
  @IsOptional()
  SOLAR_TIMEZONE = 'America/Argentina/Mendoza';

  @IsString()
  DATABASE_URL = 'postgresql://postgres:postgres@localhost:5432/growatt_plus';

  @IsString()
  @IsOptional()
  OPENAI_BASE_URL = '';

  @IsString()
  @IsOptional()
  OPENAI_API_KEY = '';

  @IsString()
  @IsOptional()
  OPENAI_MODEL = '';

  @Transform(({ value }) => parseInt(value, 10))
  @IsNumber()
  PORT = 3000;
}

export function validate(config: Record<string, unknown>): Environment {
  const validated = plainToInstance(Environment, config, {
    enableImplicitConversion: true,
  });
  const errors = validateSync(validated, { skipMissingProperties: false });
  if (errors.length > 0) {
    throw new Error(`Environment validation failed: ${errors.toString()}`);
  }
  return validated;
}
