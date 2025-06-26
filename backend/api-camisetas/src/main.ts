    // backend/api-camisetas/src/main.ts
    import { NestFactory } from '@nestjs/core';
    import { AppModule } from './app.module';
    import { Logger, ValidationPipe } from '@nestjs/common'; // Asegúrate de importar ValidationPipe

    async function bootstrap() {
      const app = await NestFactory.create(AppModule, {
        // Opciones de NestFactory (si las necesitas)
      });

      // Aumentar el límite del tamaño del cuerpo de la solicitud
      // Por defecto suele ser '100kb'. Lo aumentamos a un valor más grande, por ejemplo, '50mb'.
      app.use(require('body-parser').json({ limit: '50mb' })); // Para JSON
      app.use(require('body-parser').urlencoded({ limit: '50mb', extended: true })); // Para URL-encoded

      // Configuración de CORS
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:4321'; 
      app.enableCors({
        origin: frontendUrl, 
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
        credentials: true, 
      });

      // Opcional: Para usar DTOs con validación (si lo añades en el futuro)
      app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));


      const port = process.env.PORT || 3000; 
      await app.listen(port, async () => { 
        Logger.log(`Backend API está escuchando en el puerto ${port}`, 'NestApplication');
        Logger.log(`Accede a la API en: ${await app.getUrl()}`, 'NestApplication'); 
        Logger.log(`CORS habilitado para: ${frontendUrl}`, 'NestApplication');
        Logger.log(`Límite de payload configurado a 50MB.`, 'NestApplication'); // Nuevo log
      });
    }
    bootstrap();
    