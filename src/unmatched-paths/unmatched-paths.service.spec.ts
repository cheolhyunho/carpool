import { Test, TestingModule } from '@nestjs/testing'
import { UnmatchedPathsService } from './unmatched-paths.service'

describe('UnmatchedPathsService', () => {
  let service: UnmatchedPathsService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UnmatchedPathsService],
    }).compile()

    service = module.get<UnmatchedPathsService>(UnmatchedPathsService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })
})
