import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EventModule } from './events/event.module';
import { CategoryModule } from './categories/category.module';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    EventModule,
    CategoryModule,
  ],
  providers: [PrismaService],
  exports: [PrismaService],
})
export class AppModule {}
