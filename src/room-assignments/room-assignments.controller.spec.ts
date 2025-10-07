import { Test, TestingModule } from '@nestjs/testing';
import { RoomAssignmentsController } from './room-assignments.controller';
import { RoomAssignmentsService } from './room-assignments.service';

describe('RoomAssignmentsController', () => {
  let controller: RoomAssignmentsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RoomAssignmentsController],
      providers: [RoomAssignmentsService],
    }).compile();

    controller = module.get<RoomAssignmentsController>(
      RoomAssignmentsController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
