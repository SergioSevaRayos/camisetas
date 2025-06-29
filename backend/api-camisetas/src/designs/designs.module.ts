import { Module } from '@nestjs/common';
import { DesignsController } from './designs.controller';
import { DesignsService } from './designs.service';

@Module({
  controllers: [DesignsController],
  providers: [DesignsService]
})
export class DesignsModule {}
