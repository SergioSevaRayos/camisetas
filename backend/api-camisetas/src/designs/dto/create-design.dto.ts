// src/designs/dto/create-design.dto.ts

// Define la estructura para un objeto de texto en el diseño
class DesignTextDto {
    text: string; // Contenido del texto
    fontFamily: string; // Familia de la fuente (ej. Arial)
    fontSize: number; // Tamaño de la fuente
    fill: string; // Color del texto (ej. #000000)
    left: number; // Posición X en el lienzo
    top: number; // Posición Y en el lienzo
    scaleX?: number; // Factor de escala en X
    scaleY?: number; // Factor de escala en Y
    angle?: number; // Ángulo de rotación
    // Puedes añadir más propiedades de Fabric.js.IText si las usas en el frontend
}

// Define la estructura para un objeto de imagen en el diseño
class DesignImageDto {
    dataUrl: string; // La Data URL (Base64) de la imagen
    left: number; // Posición X en el lienzo
    top: number; // Posición Y en el lienzo
    scaleX?: number; // Factor de escala en X
    scaleY?: number; // Factor de escala en Y
    angle?: number; // Ángulo de rotación
    // Puedes añadir más propiedades de Fabric.js.Image si las usas
}

// Define la estructura principal para crear un diseño de camiseta
export class CreateDesignDto {
    // Datos de la camiseta base
    type: string; // Tipo de camiseta (ej. 'basica', 'sudadera')
    gender: string; // Género (ej. 'hombre', 'mujer')
    size: string; // Talla (ej. 'M', 'L')
    view: string; // Vista (ej. 'front', 'back')

    // Datos de los elementos personalizados en el lienzo
    designElements: {
        images: DesignImageDto[];
        texts: DesignTextDto[];
        // Puedes añadir otros tipos de elementos aquí si los implementas (ej. formas)
    };

    // Aquí podrías añadir un campo para el ID del cliente si estuviera logueado,
    // o un campo para un ID de sesión temporal.
    sessionId?: string; // Opcional, para identificar la sesión antes de un login

    // Si queremos enviar el lienzo completo de Fabric.js en JSON:
    fabricCanvasJson?: string; // El JSON completo del lienzo de Fabric.js

    // Opcional: una imagen pre-renderizada del diseño si el frontend la genera (menos común)
    // previewDataUrl?: string;
}
