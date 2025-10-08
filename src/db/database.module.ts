import { Module, Global } from '@nestjs/common';
import { DatabaseService } from './database.service';
import { Logger } from '@nestjs/common';

@Global()
@Module({
  providers: [DatabaseService, Logger],
  exports: [DatabaseService],
})
export class DatabaseModule {}
