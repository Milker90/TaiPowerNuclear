'use strict';
$(function () {
    $('#user').text(Cookies.get('tpnuser'))
    $('#logout-button').on('click', function () {
        $.get('/api/auth/logout')
            .then(data => {
                window.location.replace('/login')
            })
    })
    const powerPlantData = [
        {
            name: '第一核能發電廠',
            alias: 'powerPlant1',
            coordinates: [25.282105, 121.585714],
            shelter: {
                name: '新北市石門區乾華國小',
                coordinates: [25.269127, 121.592107],
                maxStorage: '3023'
            },
            displayColor: 'red'
        },
        {
            name: '第二核能發電廠',
            alias: 'powerPlant2',
            coordinates: [25.206386, 121.659515],
            shelter: {
                name: '新北市萬里區大鵬國民小學',
                coordinates: [25.208360, 121.651930],
                maxStorage: '2695'
            },
            displayColor: 'orange'
        },
        {
            name: '第三核能發電廠',
            alias: 'powerPlant3',
            coordinates: [21.958089, 120.751742],
            shelter: {
                name: '恆春國小南灣分校',
                coordinates: [21.96864753410715, 120.75819951179804],
                maxStorage: '1156'
            },
            displayColor: 'purple'
        }
    ]
    const mapTileData = [
        {
            name: '開放街圖',
            alias: 'openstreetmap',
            url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
            attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>',
            maxZoom: 19
        },
        {
            name: '測繪中心衛星影像',
            alias: 'nlscphoto',
            url: 'https://maps.nlsc.gov.tw/S_Maps/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=PHOTO2&STYLE=_null&TILEMATRIXSET=EPSG:3857&TILEMATRIX=EPSG:3857:{z}&TILEROW={y}&TILECOL={x}&FORMAT=image/png',
            attribution: '&copy; <a href="https://maps.nlsc.gov.tw/">國土測繪中心</a>',
            maxZoom: 19
        },
        {
            name: '測繪中心電子地圖',
            alias: 'nlscemap',
            url: 'https://maps.nlsc.gov.tw/S_Maps/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=EMAP5&STYLE=_null&TILEMATRIXSET=EPSG:3857&TILEMATRIX=EPSG:3857:{z}&TILEROW={y}&TILECOL={x}&FORMAT=image/png',
            attribution: '&copy; <a href="https://maps.nlsc.gov.tw/">國土測繪中心</a>',
            maxZoom: 19
        },

    ]
    /** define control ui */
    const measureControl = L.Control.extend({
        options: {
            position: 'topleft'
        },
        onAdd: function (map) {
            let measureIsOn = false
            let measurePoints = []
            let measureLayers = []
            let button = L.DomUtil.create('button');
            button.dataset.bsToggle = 'tooltip'
            button.dataset.bsPlacement = 'bottom'
            button.title = "單擊地圖新增量測點，雙擊地圖選取量測面積。"
            button.innerText = "量測"
            button.style.backgroundColor = 'white'
            button.style.fontSize = '12px'
            button.style.color = 'black'
            button.style.width = '50px'
            button.style.height = '50px'
            button.style.borderRadius = '0.5em'
            button.style.borderColor = 'light-gray'
            var tooltip = new bootstrap.Tooltip(button)
            tooltip.show()
            button.onclick = function (e) {
                // 關閉測量功能
                if (measureIsOn) {
                    for (let i in measureLayers) {
                        map.removeLayer(measureLayers[i])
                    }
                    button.innerText = "量測"
                    button.style.backgroundColor = 'white'
                    measureIsOn = false
                    measureLayers = []
                    measurePoints = []
                    map._events.click.pop()
                    map._events.dblclick.pop()
                } else {
                    // 開啟測量功能
                    button.innerText = "清除"
                    button.style.backgroundColor = 'gray'
                    button.style.borderColor = 'gray'
                    measureIsOn = true

                    map.on('click', function (e) {
                        // 攔截預設縮放event
                        map.doubleClickZoom.disable();
                        setTimeout(function () { map.doubleClickZoom.enable(); }, 1000);

                        if (e.originalEvent.target.className == 'leaflet-control') {
                            return
                        }
                        let marker = L.marker(e.latlng, {
                            icon: new L.Icon({
                                iconUrl: '/assets/red-flag.png',
                                iconSize: [30, 30],
                                iconAnchor: [5, 30]
                            })
                        })
                        marker.bindPopup(e.latlng).addTo(map)
                        measurePoints.push(e.latlng)
                        measureLayers.push(marker)

                        if (measurePoints.length >= 2) {
                            let polyline = L.polyline(measurePoints, {
                                showMeasurements: true,
                                measurementOptions: { imperial: false }
                            })
                            measureLayers.push(polyline)
                            polyline.addTo(map)
                        }
                    })

                    map.on('dblclick', function (e) {
                        if (e.originalEvent.target.className == 'leaflet-control') {
                            return
                        }
                        map.doubleClickZoom.enable()
                        let polygon = L.polygon(measurePoints, {
                            showMeasurements: true,
                            measurementOptions: {
                                imperial: false
                            }
                        })
                        polygon.addTo(map)
                        measureLayers.push(polygon)
                    })
                }
            }

            return button;
        }
    })
    const locateControl = L.Control.extend({
        options: {
            position: 'topright'
        },
        onAdd: function (map) {
            let select = L.DomUtil.create('select')
            select.className = 'form-select'
            let option = document.createElement('option')
            option.innerHTML = '快速定位至'
            select.appendChild(option)
            for (let item of powerPlantData) {
                let { name, alias, displayColor } = item
                let option = document.createElement('option')
                option.style.color = displayColor
                option.value = alias
                option.innerHTML = name
                select.appendChild(option)
            }
            select.onchange = function (e) {
                let targetAlias = e.target.value
                let target = powerPlantData.find(item => item.alias == targetAlias)
                if (!target) return
                map.setView(target.coordinates, 10)
            }
            return select
        }
    })
    /** define control ui */
    var map = initMap()
    $.map = map
    drawPowerPlant(map, powerPlantData)
    initShelterLayer(map)

    function initMap() {
        let baseLayer = {}
        let Layers = []

        for (let tileData of mapTileData) {
            let { name, url, maxZoom, attribution } = tileData
            let layer = L.tileLayer(url, {
                attribution: attribution,
                maxZoom: maxZoom
            })
            Layers.push(layer)
            baseLayer[name] = layer
        }

        let map = L.map('map', {
            center: [23.97565, 120.9738819],
            zoom: 7,
            layers: Layers[2],
        })

        L.control.layers(baseLayer).addTo(map)
        map.addControl(new measureControl())
        map.addControl(new locateControl())

        return map
    }

    function drawPowerPlant(map, data) {
        for (let item of data) {
            let { name, coordinates, displayColor } = item
            L.marker(coordinates, {
                icon: new L.Icon({
                    iconUrl: '/assets/nuclear.png',
                    iconSize: [30, 30],
                    iconAnchor: [15, 15]
                })
            })
                .bindTooltip(name)
                .addTo(map)
            L.circle(coordinates, {
                radius: 6000,
                color: displayColor
            }).addTo(map);
        }
    }

    function initShelterLayer(map) {
        fetch('/geometry/shelter.kml')
            .then(res => res.text())
            .then(kmltext => {
                let parser = new DOMParser();
                let kmlData = parser.parseFromString(kmltext, 'text/xml');
                let kmlLayer = new L.KML(kmlData);
                map.addLayer(kmlLayer);
            })
    }
});
