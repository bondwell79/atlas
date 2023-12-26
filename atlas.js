// Programa para NODEJS :   geocodificacion con Google APIS
// requiere:
// nodejs/fast-csv
// nodejs/fs
// nodejs/@google/maps
//   
// -------------------------------------------------------
// Wasx Alpha Software 1984, 2019
// Programado por Rubén Pastor Villarrubia
// -------------------------------------------------------
//
// Fichero entrada csv separado por tabulaciones.
// Columnas: referencia,direccion,cp,latitud,longitud,df
// Actualizado: 17/09/2019

var buffer = [];
var tdatos = [];
var tlineas = 0;
var b1 = 0;
var t1 = 0;
var fallos = 0;

console.log ('=======================================');
console.log ('Projecto Atlas - version 1000');
console.log ('Wasx alpha Software 1984, 2019');
console.log ('Programado por Rubén Pastor Villarrubia');
console.log ('=======================================');
console.log ('');

const fastcsv = require('fast-csv');
const fs = require('fs');


const gMC = require('@google/maps').createClient({
    key: 'XXX AQUI HAY QUE INDICAR LA KEY DE GOOGLE XXX'
  });




function procesar(datos,lineas)
{
// guardamos en global cuantas lineas son
tlineas = lineas-1;

// Geocodificar
b1 = 0;
while (b1<lineas)
    {
    if (datos[b1][4] == '0')
        {    
        gMC.geocode({ 'address': datos[b1][1],'components':
        { 'postalCode': datos[b1][2],'country': "ES" }}, function(err, response)  //'postalCode': datos[b1][2]
                                                { 
                                                // lo primero es mantener el orden de proceso y detectar fallos
                                                t1 = t1 + 1; 
                                                if (response.json.status!='OK') { fallos = fallos+1; }
                                                
                                                
                                                // extraemos datos geodesicos
                                                lat = response.json.results[0].geometry.location.lat;
                                                lon = response.json.results[0].geometry.location.lng;
                                                df  = response.json.results[0].formatted_address;
                                                
                                                //buscamos en array para guardar resultado
                                                referencia = response.query.address; 
                                                
                                                b2 = 0;
                                                while (b2<lineas)
                                                    {
                                                    if (datos[b2][1]==referencia)
                                                        
                                                        {
                                                            datos[b2][3] = lat;
                                                            datos[b2][4] = lon;
                                                            datos[b2][5] = df;
                                                        }
                                                    b2=b2+1;
                                                    }

                                                tdatos= datos;
                                                });
        }
    b1 = b1 + 1;
    }
}

function finalizar()
{
console.log ('Procesando '+t1+' de '+tlineas+" fallos "+fallos);

    if (t1>=tlineas) 
    {
    // finalizado 
    console.log('Proceso finalizado.');  
    fastcsv.writeToPath('salida.csv',tdatos,{ delimiter: '\t'}); 
    clearInterval(repetir); 
    }
    
}

repetir = setInterval(finalizar,1000);

fastcsv.parseFile('entrada.csv',{ delimiter: '\t'})
.on('error', error => console.log(error))
.on('data', row =>  buffer.push(row))
.on('end', rowCount => procesar(buffer,rowCount) );


