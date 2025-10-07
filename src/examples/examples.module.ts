import { Module } from '@nestjs/common';
import { JsonApiExampleController } from './jsonapi-example.controller';

@Module({
  controllers: [JsonApiExampleController],
})
export class ExamplesModule {}
