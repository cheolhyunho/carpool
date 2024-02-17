import { JwtAuthGuard } from './../users/jwt/jwt.guard'
import {
  Body,
  Controller,
  Get,
  Post,
  Render,
  Res,
  UseGuards,
} from '@nestjs/common'
import { UnmatchedPathsService } from './unmatched-paths.service'
import { UnmatchedPathEntity } from './unmatchedpaths.entity'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'

@UseGuards(JwtAuthGuard)
@Controller('unmatched-paths')
export class UnmatchedPathsController {
  constructor(
    private readonly unmatchedPathService: UnmatchedPathsService,
    @InjectRepository(UnmatchedPathEntity)
    private readonly unmatchedPathRepository: Repository<UnmatchedPathEntity>,
  ) {}

  @Get()
  @Render('index')
  test1() {}

  @Post()
  @Render('index')
  async test(@Body() body: any, @Res() res) {
    // 요청의 body 내용을 출력
    console.log('POST 요청 Body:', body)

    console.log(body.lat)
    console.log(body.lng)

    const unmatchedPath = await this.unmatchedPathRepository.create({
      startingPoint: body.latitude,
      destinationPoint: body.longitude,
      fare: 1,
      distance: 2,
      time: 3,
    })
    const savedUnmatchedPath = await this.unmatchedPathRepository.save(
      unmatchedPath,
    )

    return savedUnmatchedPath
  }
}
