// backend/api-camisetas/src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common'; // Importa Logger para logs de inicio

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Configuración de CORS: Permite que tu frontend acceda a este backend
  // ¡MUY IMPORTANTE! Reemplaza 'https://camisetas-personalizadas-frontend.onrender.com'
  // con la URL real de tu frontend desplegado en Render.
  // Si la de tu frontend es: https://mi-editor-camisetas-xyz.onrender.com, usa esa.
  app.enableCors({
    origin: 'https://camisetas-personalizadas-frontend.onrender.com', 
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true, // Necesario si vas a usar cookies o sesiones
  });

  const port = process.env.PORT || 3000; // Usa el puerto de entorno de Render, o 3000 localmente

  await app.listen(port, () => {
    Logger.log(`Backend API está escuchando en el puerto ${port}`, 'NestApplication');
    Logger.log(`Accede a la API en: ${await app.getUrl()}`, 'NestApplication');
  });
}
bootstrap();