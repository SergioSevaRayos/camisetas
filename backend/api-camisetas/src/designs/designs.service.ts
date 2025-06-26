// src/designs/designs.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { CreateDesignDto } from './dto/create-design.dto';

@Injectable()
export class DesignsService {
    private readonly logger = new Logger(DesignsService.name); // Logger para el servicio

    // Este método simula la creación y guardado del diseño.
    // Más tarde, aquí iría la lógica para guardar en la BD y procesar la imagen.
    async createDesign(createDesignDto: CreateDesignDto) {
        this.logger.log('Procesando datos del diseño...');
        // console.log('Detalles del diseño:', JSON.stringify(createDesignDto, null, 2)); // Descomenta para ver el payload completo

        // Simula la asignación de un ID y una fecha de creación
        const newDesign = {
            id: `design_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
            createdAt: new Date().toISOString(),
            ...createDesignDto, // Incluye todos los datos del DTO
        };

        this.logger.log(`Diseño ${newDesign.id} guardado (simulado).`);

        // Aquí es donde, en el futuro, guardarías `newDesign` en tu base de datos
        // y/o iniciarías el proceso de generación de la imagen para impresión.

        return {
            id: newDesign.id,
            message: 'Diseño recibido y procesado con éxito (simulado).',
            previewUrl: `http://localhost:3000/api/designs/${newDesign.id}/preview` // URL de ejemplo para una futura previsualización
        };
    }
}
