import { Test, TestingModule } from '@nestjs/testing';
import { RoomAssignmentsService } from './room-assignments.service';

describe('RoomAssignmentsService', () => {
  let service: RoomAssignmentsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RoomAssignmentsService],
    }).compile();

    service = module.get<RoomAssignmentsService>(RoomAssignmentsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
