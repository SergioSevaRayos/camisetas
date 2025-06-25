# Usa una imagen base de Node.js
FROM node:20-alpine

# Instala dependencias del sistema necesarias para Sharp/libvips
# Alpine usa 'apk add' en lugar de 'apt-get install'
# Estas son las librerías que permiten a Sharp procesar imágenes a nivel de SO
RUN apk add --no-cache vips-dev gcc g++ make

# Crea el directorio de la aplicación dentro del contenedor
WORKDIR /app

# Copia los archivos de definición de dependencias (package.json y lockfile)
# Esto optimiza el caching de Docker: si los package.json/lockfile no cambian,
# no reinstala las dependencias.
COPY package.json package-lock.json ./

# Instala las dependencias de Node.js
# --frozen-lockfile asegura que se usen las versiones exactas del package-lock.json
RUN npm install --frozen-lockfile

# Copia el resto del código de la aplicación
COPY . .

RUN chmod +x /app/node_modules/.bin/nest
# Compila la aplicación NestJS para producción
# Esto ejecutará 'npm run build' que generará la carpeta 'dist/'
RUN /app/node_modules/.bin/nest build

# Expone el puerto que usa tu aplicación NestJS
# Render lo usará, aunque la aplicación NestJS escuchará en process.env.PORT
EXPOSE 3000

# Comando para iniciar la aplicación cuando el contenedor se inicie
# 'dist/main.js' es el punto de entrada compilado de NestJS
CMD [ "node", "dist/main" ]