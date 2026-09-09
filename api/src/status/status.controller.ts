import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { StatusService, SystemStatus } from './status.service';

@ApiBearerAuth()
@ApiTags('status')
@Controller('api/status')
export class StatusController {
  constructor(private readonly statusService: StatusService) {}

  @Get()
  @ApiOperation({ summary: 'Get system status' })
  async getStatus(): Promise<SystemStatus> {
    return this.statusService.getStatus();
  }
}
