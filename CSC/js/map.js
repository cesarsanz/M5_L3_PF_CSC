var map;
var tb;
    require(["esri/map",
        "dojo/on",
        "dojo/dom",
        "esri/geometry/Extent",
        "esri/layers/ArcGISDynamicMapServiceLayer",
        "esri/layers/FeatureLayer",
        "esri/dijit/BasemapGallery",
        "esri/dijit/Scalebar",
        "esri/dijit/Legend",
        "esri/dijit/PopupMobile",
        "esri/dijit/Search",
        "esri/dijit/OverviewMap",
        "dojo/parser",
        "esri/toolbars/draw",
        "esri/graphic",
        "esri/symbols/SimpleFillSymbol",
        "esri/symbols/SimpleLineSymbol",
        "esri/symbols/SimpleMarkerSymbol",
        "esri/tasks/IdentifyTask",
        "esri/tasks/IdentifyParameters",
        "esri/dijit/Popup",
        "esri/InfoTemplate",

        "dojo/store/Memory",
        "dojo/date/locale",

        "dojo/_base/Color",
        "dojo/_base/declare",
        "dojo/_base/array",
        "dgrid/OnDemandGrid",
        "dgrid/Selection",

        "dijit/layout/TabContainer",
        "dijit/layout/ContentPane",
        "dijit/layout/BorderContainer", "dijit/form/Button",
        "esri/Color",
        "dojo/dom-construct",
        "dojo/domReady!"],
        function(
          Map, on,  dom, Extent, ArcGISDynamicMapServiceLayer, FeatureLayer, BasemapGallery,
          Scalebar, Legend, PopupMobile, Search, OverviewMap, parser, Draw, Graphic,
          SimpleFillSymbol, SimpleLineSymbol, SimpleMarkerSymbol, IdentifyTask, IdentifyParameters, Popup, InfoTemplate, 
          Memory, locale,
          Color, declare, array, Grid, Selection,
          TabContainer, ContentPane, BorderContainer, Button, 
          Color, domConstruct,
          Ready,
        ) {


        on(dojo.byId("pintaYQuery"),"click",fPintaYQuery);
        on(dojo.byId("progButtonNode"),"click",fQueryEstados);

        function fPintaYQuery(){
          alert("Evento del botón Ir a estado");
        }
        function fQueryEstados(){
         alert("Evento del botón Seleccionar ciudades");
        }

        var extensionnueva = new Extent({
            "xmin" : -12714756.540968746,
            "ymin" :8377372.4848876516,
            "xmax" : -1189275.795070842,
            "ymax" : 11353973.87191362,
            "spatialReference" : {
              "wkid" : 102100
            }
          });
        // Create the map
        var map = new Map("map", {
        basemap: "topo",
        extent : extensionnueva
        });

        // Construct the USA layer
        var USAdatos = new ArcGISDynamicMapServiceLayer("http://sampleserver6.arcgisonline.com/arcgis/rest/services/USA/MapServer/", {
            opacity : 0.5,
        });
        var CiudadesUSA = new FeatureLayer("http://sampleserver6.arcgisonline.com/arcgis/rest/services/USA/MapServer/0");
        
        // Añadir datos al Mapa
        map.addLayer (USAdatos);
        map.addLayer(CiudadesUSA);

        // Añadir BasemapGallery
        var SelectorMapas = new BasemapGallery({
            showArcGISBasemaps: true,
            map: map
          }, "basemapgalleryContenedor");
          SelectorMapas.startup();

        // Añadir Escala
        var Scala = new Scalebar({
            map: map,
            scalebarUnit: "dual",
            attachTo: "bottom-left"
        });

        // Añadir Leyenda
        map.on("load", function(evt) {
            var legendDijit = new Legend({
              map: map,
              arrangement : Legend.ALIGN_RIGHT,
              layerInfos: [{layer: USAdatos}]
            }, "legendDiv");
            legendDijit.startup();                                                                                                                                                                                
        });
        /*
        map.on("load",function(evt){
          map.resize();
          map.reposition();

        });
        */
       // Añadir Buscador
       var  dijitSearch = new Search({
            map: map,
            autoComplete: true
        }, "dtb1");
        dijitSearch.startup();

        // Añadir Visor general
        var VisionGeneral = new OverviewMap ({
            map: map,
            visible: true
        }, "VGeneral");
        VisionGeneral.startup();

        // Añadir herramientas de selección y dibujo
        map.on("pintaYQuery",initDrawTool);

        function initDrawTool() {
                /*
                 * Step: Implement the Draw toolbar
                 */
          var tbDraw = new Draw (map);
          tbDraw.on("draw-end", displayPolygon);
          tbDraw.activate(Draw.POLYGON);
        }

        function displayPolygon(evt) {
        // Get the geometry from the event object
          var geometryInput = evt.geometry;

        // Define symbol for finished polygon
          var tbDrawSymbol = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID, new SimpleLineSymbol(SimpleLineSymbol.STYLE_DASHDOT, new Color([255, 255, 0]), 2), new Color([255, 255, 0, 0.2]));

        // Clear the map's graphics layer
          map.graphics.clear();

        /*
        * Step: Construct and add the polygon graphic
        */
          var graphicPolygon = new Graphic(geometryInput,tbDrawSymbol);
          map.graphics.add(graphicPolygon);

        // Call the next function
        selectCiudad(geometryInput);
        }

        function selectCiudad(geometryInput) {
        // Define symbol for selected features
          var symbolSelected = new SimpleMarkerSymbol({
            "type": "esriSMS",
            "style": "esriSMSCircle",
            "color": [255, 115, 0, 128],
            "size": 6,
            "outline": {
                "color": [255, 0, 0, 214],
                "width": 1
            }
          });
        }
        // Añadir Tarea Identify
        var identifyTask, identifyParams;
        var IDpop = new Popup ({
          fillSymbol: new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID,
            new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID,
              new Color([255, 0, 0]), 2), new Color([255, 255, 0, 0.25]))
        }, domConstruct.create("div"));

    
        
        function mapReady () {
          map.on("click", executeIdentifyTask);
          //create identify tasks and setup parameters
          identifyTask = new IdentifyTask(USAdatos);
          identifyParams = new IdentifyParameters();
          identifyParams.tolerance = 3;
          identifyParams.returnGeometry = true;
          identifyParams.layerIds = [2];
          identifyParams.layerOption = IdentifyParameters.LAYER_OPTION_ALL;
          identifyParams.width = map.width;
          identifyParams.height = map.height;
        }
        function executeIdentifyTask (event) {
          identifyParams.geometry = event.mapPoint;
          identifyParams.mapExtent = map.extent;

          var deferred = identifyTask
            .execute(identifyParams)
            .addCallback(function (response) {
              // response is an array of identify result objects
              // Let's return an array of features.
              return arrayUtils.map(response, function (result) {
                var feature = result.feature;
                var layerName = result.layerName;

                feature.attributes.layerName = layerName;
                if (layerName === 'States') {
                  var Estados = new InfoTemplate("STATE_NAME","POP2000", "POP00_SQMI", "st_area");
                  feature.setInfoTemplate(Estados);
                }
                return feature;
              });
            });   
          }; 
      });