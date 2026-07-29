# HMI DCE — instalación manual

Este paquete publica una pantalla informativa estática en GitHub Pages y toma
anuncios y cumpleaños desde un Google Sheets editable.

## Archivos

- `index.html`: interfaz completa, con CSS, JavaScript, logo y QR incorporados.
- `Base_Datos_HMI_DCE.xlsx`: plantilla que se importa a Google Sheets.
- `Code.gs`: API para leer la hoja.

## 1. Crear la base en Google Sheets

1. Sube `Base_Datos_HMI_DCE.xlsx` a Google Drive.
2. Ábrelo con Hojas de cálculo de Google.
3. En `Anuncios`, edita o agrega registros. Usa `SI` en `Activo`.
4. En `Cumpleanos`, captura día y mes como números y selecciona `Personal` o
   `Alumno` en la columna `Tipo`.
5. No cambies los nombres de las pestañas ni de los encabezados.

## 2. Publicar la API

1. En el Google Sheets abre `Extensiones > Apps Script`.
2. Sustituye el contenido de `Code.gs` por el archivo `Code.gs` de este paquete.
3. Guarda y selecciona `Implementar > Nueva implementación`.
4. Tipo: `Aplicación web`.
5. Ejecutar como: `Yo`.
6. Acceso: `Cualquier persona`.
7. Autoriza y copia la URL que termina en `/exec`.

Si cambias el código posteriormente, usa `Implementar > Administrar
implementaciones > Editar > Nueva versión`.

## 3. Conectar el HTML

Abre `index.html` con un editor de texto y localiza:

```js
apiUrl: "PEGA_AQUI_LA_URL_DE_APPS_SCRIPT"
```

Sustituye únicamente el texto entre comillas por la URL `/exec`.

## 4. Publicar en GitHub Pages

1. Crea un repositorio público, por ejemplo `hmi-dce`.
2. Sube `index.html` a la raíz del repositorio.
3. Abre `Settings > Pages`.
4. En `Build and deployment`, selecciona `Deploy from a branch`.
5. Selecciona la rama `main`, carpeta `/root`, y guarda.
6. GitHub mostrará una dirección similar a:
   `https://TU-USUARIO.github.io/hmi-dce/`.

## Actualización diaria

No necesitas volver a subir el HTML cuando cambien los datos. Edita el Google
Sheets y la HMI consultará la información nuevamente cada cinco minutos.

## Campos principales

### Anuncios

- `FechaInicio` y `FechaFin`: controlan la vigencia automática.
- `FechaTexto`: texto visible en la HMI; puede quedar vacío.
- `Prioridad`: los números menores aparecen primero.
- `Color`: color hexadecimal, por ejemplo `#171717`.
- `Activo`: usa `SI` o `NO`.

### Cumpleanos

- `Tipo`: identifica si se trata de `Personal` o `Alumno`.
- `Dia`: número del 1 al 31.
- `Mes`: número del 1 al 12.
- `Foto`: opcional; se conserva para una ampliación futura.
- `Activo`: usa `SI` o `NO`.

Cuando el día y mes coinciden con la fecha actual, el panel cambia
automáticamente a `¡Felicidades, Nombre!`, indica si es personal o alumno y
resalta la tarjeta. Si coinciden varias personas, muestra todos los nombres.

El QR permanece enlazado a:
https://reportesdce-devs.github.io/registro-atencion-alumnos/
