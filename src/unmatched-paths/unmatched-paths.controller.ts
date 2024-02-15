import { JwtAuthGuard } from './../users/jwt/jwt.guard'
import {
  Body,
  Controller,
  Get,
  Post,
  Render,
  Req,
  UseGuards,
} from '@nestjs/common'
import { UnmatchedPathsService } from './unmatched-paths.service'
import { UnmatchedPathDto } from './dto/unmatchedPath.dto'

@UseGuards(JwtAuthGuard)
@Controller('unmatchedPath')
export class UnmatchedPathsController {
  constructor(private readonly unmatchedPathService: UnmatchedPathsService) {}

  @Get()
  @Render('map')
  test() {
    return { message: '' }
  }

  @Post()
  async createUnmatchedPath(@Body() unmatchedPathDto: UnmatchedPathDto) {
    return await this.unmatchedPathService.createUnmatchedPath(unmatchedPathDto)
  }
}
