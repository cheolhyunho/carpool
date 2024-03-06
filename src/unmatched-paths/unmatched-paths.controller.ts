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
import { InjectRepository } from '@nestjs/typeorm'
import { UnmatchedPathEntity } from './unmatchedpaths.entity'
import { Repository } from 'typeorm'
import { UnmatchedPathDto } from './dto/unmatchedPath.dto'
import { JwtAuthGuard } from 'src/users/jwt/jwt.guard'
import axios from 'axios'
import { CurrentUser } from 'src/common/decorators/current-user.decorator'

@UseGuards(JwtAuthGuard)
@Controller('unmatchedPath')
export class UnmatchedPathsController {
  constructor(
    private readonly unmatchedPathService: UnmatchedPathsService,
    @InjectRepository(UnmatchedPathEntity)
    private readonly unmatchedPathRepository: Repository<UnmatchedPathEntity>,
  ) {}

  @Get('test')
  async test() {
    const REST_API_KEY = process.env.REST_API_KEY
    const url = `https://apis-navi.kakaomobility.com/v1/directions?origin=126.9754707,37.2138937&destination=127.128742990837,37.4113736407028&priority=RECOMMEND&car_fuel=GASOLINE&car_hipass=false&alternatives=false&road_details=false&summary=true`
    console.log(url)

    return await axios.get(url, {
      headers: { Authorization: `KakaoAK ${REST_API_KEY}` },
      responseType: 'arraybuffer',
    })
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @Render('map')
  map() {
    return
  }

  @Post()
  async createUnmatchedPath(
    @Body() unmatchedPathDto: UnmatchedPathDto,
    @CurrentUser() user,
  ) {
    const userId = user.id
    return await this.unmatchedPathService.createUnmatchedPath(
      unmatchedPathDto,
      userId,
    )
  }

  @Post('setDes')
  async updateUnmatchedPath(@Body() body: string[], @CurrentUser() user) {
    const userId = user.id
    return await this.unmatchedPathService.updateUnmatchedPath(body, userId)
  }

  @Post('setMatching')
  async setMatching(@CurrentUser() user) {
    return await this.unmatchedPathService.setMatching(user)
  }
}
