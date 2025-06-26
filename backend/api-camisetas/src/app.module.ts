// src/app.module.ts
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DesignsModule } from './designs/designs.module'; // Importa el nuevo módulo de diseños

@Module({
  imports: [DesignsModule], // Añade DesignsModule a la lista de imports
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
