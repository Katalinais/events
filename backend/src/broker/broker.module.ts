import { Module } from '@nestjs/common';
import { PurchaseProducer } from './purchase.producer';

@Module({
  providers: [PurchaseProducer],
  exports: [PurchaseProducer],
})
export class BrokerModule {}
