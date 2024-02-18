import { Test, TestingModule } from '@nestjs/testing'
import { UnmatchedPathsController } from './unmatched-paths.controller'

describe('UnmatchedPathsController', () => {
  let controller: UnmatchedPathsController

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UnmatchedPathsController],
    }).compile()

    controller = module.get<UnmatchedPathsController>(UnmatchedPathsController)
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })
})
