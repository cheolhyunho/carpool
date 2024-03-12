import { Test, TestingModule } from '@nestjs/testing'
import { UnmathchedPathGateway } from './unmathched-path.gateway'

describe('UnmathchedPathGateway', () => {
  let gateway: UnmathchedPathGateway

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UnmathchedPathGateway],
    }).compile()

    gateway = module.get<UnmathchedPathGateway>(UnmathchedPathGateway)
  })

  it('should be defined', () => {
    expect(gateway).toBeDefined()
  })
})
