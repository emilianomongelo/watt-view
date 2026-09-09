import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { StatusService, SystemStatus } from './status.service';

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
