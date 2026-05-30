import { Module } from '@nestjs/common';
import { PurchaseProducer } from './purchase.producer';
import { PurchaseConsumer } from './purchase.consumer';
import { SalesModule } from '../sales/sales.module';

@Module({
  imports: [SalesModule],
  providers: [PurchaseProducer, PurchaseConsumer],
  exports: [PurchaseProducer],
})
export class BrokerModule {}
