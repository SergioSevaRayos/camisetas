// src/designs/designs.controller.ts
import { Controller, Post, Body, HttpCode, HttpStatus, Logger } from '@nestjs/common';
import { DesignsService } from './designs.service';
import { CreateDesignDto } from './dto/create-design.dto'; // Importa el DTO que acabamos de crear

@Controller('designs') // Define la ruta base para este controlador (ej. /designs)
export class DesignsController {
    private readonly logger = new Logger(DesignsController.name); // Logger para el controlador

    constructor(private readonly designsService: DesignsService) { }

    @Post() // Maneja solicitudes POST a /designs
    @HttpCode(HttpStatus.CREATED) // Devuelve un código de estado 201 Created si es exitoso
    async create(@Body() createDesignDto: CreateDesignDto) {
        this.logger.log(`Recibida nueva solicitud de diseño: Tipo=${createDesignDto.type}, Género=${createDesignDto.gender}, Vista=${createDesignDto.view}`);

        // Llama al servicio para procesar el diseño
        const design = await this.designsService.createDesign(createDesignDto);

        this.logger.log(`Diseño creado con éxito (ID simulado: ${design.id})`);
        return design; // Devuelve la respuesta del servicio
    }
}
