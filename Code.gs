/*
 * API de la HMI de la División de Ciencias Exactas.
 * Este archivo se pega en Extensiones > Apps Script dentro del Google Sheets.
 */

const HOJAS = {
  ANUNCIOS: "Anuncios",
  CUMPLEANOS: "Cumpleanos",
  CONFIGURACION: "Configuracion"
};

function doGet(e) {
  const datos = obtenerDatos_();
  const requestedCallback = e && e.parameter && e.parameter.callback;
  const callback = /^[A-Za-z_$][0-9A-Za-z_$]*$/.test(requestedCallback || "")
    ? requestedCallback
    : "";
  const contenido = callback
    ? callback + "(" + JSON.stringify(datos) + ");"
    : JSON.stringify(datos);

  return ContentService
    .createTextOutput(contenido)
    .setMimeType(
      callback
        ? ContentService.MimeType.JAVASCRIPT
        : ContentService.MimeType.JSON
    );
}

function obtenerDatos_() {
  const libro = SpreadsheetApp.getActiveSpreadsheet();
  const ahora = new Date();

  const anuncios = leerObjetos_(libro.getSheetByName(HOJAS.ANUNCIOS))
    .filter(fila => esActivo_(fila.Activo))
    .filter(fila => estaVigente_(fila.FechaInicio, fila.FechaFin, ahora))
    .map(fila => ({
      id: texto_(fila.ID),
      category: texto_(fila.Categoria) || "Aviso",
      title: texto_(fila.Titulo),
      description: texto_(fila.Descripcion),
      date: texto_(fila.FechaTexto) || rangoFechas_(fila.FechaInicio, fila.FechaFin),
      location: texto_(fila.Ubicacion),
      accent: texto_(fila.Color) || "#171717",
      priority: numero_(fila.Prioridad, 99),
      active: true
    }))
    .filter(anuncio => anuncio.title)
    .sort((a, b) => a.priority - b.priority);

  const mesActual = ahora.getMonth() + 1;
  const cumpleanos = leerObjetos_(libro.getSheetByName(HOJAS.CUMPLEANOS))
    .filter(fila => esActivo_(fila.Activo))
    .filter(fila => numero_(fila.Mes, 0) === mesActual)
    .map(fila => ({
      id: texto_(fila.ID),
      name: texto_(fila.Nombre),
      role: texto_(fila.Puesto),
      type: texto_(fila.Tipo) || "Personal",
      day: numero_(fila.Dia, 0),
      month: numero_(fila.Mes, 0),
      photo: texto_(fila.Foto),
      active: true
    }))
    .filter(persona => persona.name && persona.day >= 1 && persona.day <= 31)
    .sort((a, b) => a.day - b.day);

  const configuracion = leerConfiguracion_(
    libro.getSheetByName(HOJAS.CONFIGURACION)
  );

  return {
    ok: true,
    updatedAt: ahora.toISOString(),
    announcements: anuncios,
    birthdays: cumpleanos,
    config: configuracion
  };
}

function leerObjetos_(hoja) {
  if (!hoja || hoja.getLastRow() < 2) return [];
  const valores = hoja.getDataRange().getValues();
  const encabezados = valores.shift().map(texto_);

  return valores.map(fila =>
    encabezados.reduce((objeto, encabezado, indice) => {
      objeto[encabezado] = fila[indice];
      return objeto;
    }, {})
  );
}

function leerConfiguracion_(hoja) {
  return leerObjetos_(hoja).reduce((resultado, fila) => {
    const clave = texto_(fila.Clave);
    if (clave) resultado[clave] = texto_(fila.Valor);
    return resultado;
  }, {});
}

function esActivo_(valor) {
  const normalizado = texto_(valor).toUpperCase();
  return !["NO", "FALSE", "FALSO", "0", "INACTIVO"].includes(normalizado);
}

function estaVigente_(inicio, fin, ahora) {
  const fechaInicio = fecha_(inicio, false);
  const fechaFin = fecha_(fin, true);
  return (!fechaInicio || ahora >= fechaInicio) && (!fechaFin || ahora <= fechaFin);
}

function fecha_(valor, finDelDia) {
  if (!valor) return null;
  const fecha = valor instanceof Date ? new Date(valor) : new Date(valor);
  if (isNaN(fecha.getTime())) return null;
  fecha.setHours(finDelDia ? 23 : 0, finDelDia ? 59 : 0, finDelDia ? 59 : 0, 0);
  return fecha;
}

function rangoFechas_(inicio, fin) {
  const zona = Session.getScriptTimeZone() || "America/Monterrey";
  const formato = fecha => fecha
    ? Utilities.formatDate(new Date(fecha), zona, "d MMM")
    : "";
  const desde = formato(inicio);
  const hasta = formato(fin);
  return desde && hasta ? desde + " – " + hasta : desde || hasta || "Vigente";
}

function texto_(valor) {
  return valor === null || valor === undefined ? "" : String(valor).trim();
}

function numero_(valor, respaldo) {
  const numero = Number(valor);
  return Number.isFinite(numero) ? numero : respaldo;
}

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu("HMI DCE")
    .addItem("Probar lectura de datos", "probarLectura")
    .addToUi();
}

function probarLectura() {
  const datos = obtenerDatos_();
  SpreadsheetApp.getUi().alert(
    "HMI DCE",
    "Anuncios vigentes: " + datos.announcements.length +
      "\nCumpleaños del mes: " + datos.birthdays.length,
    SpreadsheetApp.getUi().ButtonSet.OK
  );
}
