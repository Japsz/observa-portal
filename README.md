# Observa Ciudadanía

Benjamín Meneses - Diseño de BDD y principal programador de interfaz

# Instalación
-Instalar Nodejs y mysql server.

- Clonar repositorio e ir a este a través de la consola de comandos.

-Ejecutar la línea de comando 'npm install' en la carpeta principal del sw donde está el archivo "package.json".

-Importar 'database.sql' en la base de datos mysql

-Ejectuar la línea de comando 'node hello.js' para iniciar la aplicación


# Manejo del host.
-ip servidor: 45.55.240.175
-usuario: proyecta
-contraseña: proyecta17

-usuario mysql: root
-contraseña mysql: observaproyecta

# Como actualizar el host a la última versión en el Git.

- Primero hacer una conexión SSH al HOST através de putty u otro sw.
- Luego ir a la carpeta "observa-portal" y ejecutar el comando "git pull".
- Ejecutar la línea "pm2 restart 1". pm2 reiniciará el servicio con id "1", el cual es la aplicación dentro de /home/proyecta/observa-portal
- Listo!

#Observaciones
- El código de la plataforma está versionado en Git con una licencia gratuita (por tanto es Open Source)
- El host usa Ubuntu como SO por lo que en una conexión SSH cualquier comando de linux es admisible.

# WARNING
This project is stil in development. Any trouble or error, please notify.
