import { Module } from '@nestjs/common';
import { SalesGateway } from './sales.gateway';

@Module({
  providers: [SalesGateway],
})
export class SalesModule {}
