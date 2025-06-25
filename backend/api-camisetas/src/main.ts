    // backend/api-camisetas/src/main.ts
    import { NestFactory } from '@nestjs/core';
    import { AppModule } from './app.module';
    import { Logger } from '@nestjs/common';

    async function bootstrap() {
      const app = await NestFactory.create(AppModule);

      // Configuración de CORS
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:4321'; 
      app.enableCors({
        origin: frontendUrl, 
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
        credentials: true, 
      });

      const port = process.env.PORT || 3000; 
      // Marcar el callback de app.listen como 'async'
      await app.listen(port, async () => { // <-- ¡CAMBIO CLAVE AQUÍ! Añadir 'async'
        Logger.log(`Backend API está escuchando en el puerto ${port}`, 'NestApplication');
        Logger.log(`Accede a la API en: ${await app.getUrl()}`, 'NestApplication'); // Ahora 'await' es válido
        Logger.log(`CORS habilitado para: ${frontendUrl}`, 'NestApplication');
      });
    }
    bootstrap();
    