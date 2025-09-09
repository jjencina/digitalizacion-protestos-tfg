$(document).ready(function() {
    console.log('Inicialización formulario');

    // Inicializar autocompletados
    GestorBusquedas.iniciarTodas();
  

    // Crear la primera letra y su primer endoso
    addLetra();
    setTimeout(() => addEndoso(0), 300);

    // Orden de tabulación y validación de fechas
    configurarOrdenTabulacion();
    
    initValidacionFechas();

});