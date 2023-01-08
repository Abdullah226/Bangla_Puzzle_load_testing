/*
   Licensed to the Apache Software Foundation (ASF) under one or more
   contributor license agreements.  See the NOTICE file distributed with
   this work for additional information regarding copyright ownership.
   The ASF licenses this file to You under the Apache License, Version 2.0
   (the "License"); you may not use this file except in compliance with
   the License.  You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/
var showControllersOnly = false;
var seriesFilter = "";
var filtersOnlySampleSeries = true;

/*
 * Add header in statistics table to group metrics by category
 * format
 *
 */
function summaryTableHeader(header) {
    var newRow = header.insertRow(-1);
    newRow.className = "tablesorter-no-sort";
    var cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Requests";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 3;
    cell.innerHTML = "Executions";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 7;
    cell.innerHTML = "Response Times (ms)";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Throughput";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 2;
    cell.innerHTML = "Network (KB/sec)";
    newRow.appendChild(cell);
}

/*
 * Populates the table identified by id parameter with the specified data and
 * format
 *
 */
function createTable(table, info, formatter, defaultSorts, seriesIndex, headerCreator) {
    var tableRef = table[0];

    // Create header and populate it with data.titles array
    var header = tableRef.createTHead();

    // Call callback is available
    if(headerCreator) {
        headerCreator(header);
    }

    var newRow = header.insertRow(-1);
    for (var index = 0; index < info.titles.length; index++) {
        var cell = document.createElement('th');
        cell.innerHTML = info.titles[index];
        newRow.appendChild(cell);
    }

    var tBody;

    // Create overall body if defined
    if(info.overall){
        tBody = document.createElement('tbody');
        tBody.className = "tablesorter-no-sort";
        tableRef.appendChild(tBody);
        var newRow = tBody.insertRow(-1);
        var data = info.overall.data;
        for(var index=0;index < data.length; index++){
            var cell = newRow.insertCell(-1);
            cell.innerHTML = formatter ? formatter(index, data[index]): data[index];
        }
    }

    // Create regular body
    tBody = document.createElement('tbody');
    tableRef.appendChild(tBody);

    var regexp;
    if(seriesFilter) {
        regexp = new RegExp(seriesFilter, 'i');
    }
    // Populate body with data.items array
    for(var index=0; index < info.items.length; index++){
        var item = info.items[index];
        if((!regexp || filtersOnlySampleSeries && !info.supportsControllersDiscrimination || regexp.test(item.data[seriesIndex]))
                &&
                (!showControllersOnly || !info.supportsControllersDiscrimination || item.isController)){
            if(item.data.length > 0) {
                var newRow = tBody.insertRow(-1);
                for(var col=0; col < item.data.length; col++){
                    var cell = newRow.insertCell(-1);
                    cell.innerHTML = formatter ? formatter(col, item.data[col]) : item.data[col];
                }
            }
        }
    }

    // Add support of columns sort
    table.tablesorter({sortList : defaultSorts});
}

$(document).ready(function() {

    // Customize table sorter default options
    $.extend( $.tablesorter.defaults, {
        theme: 'blue',
        cssInfoBlock: "tablesorter-no-sort",
        widthFixed: true,
        widgets: ['zebra']
    });

    var data = {"OkPercent": 99.83333333333333, "KoPercent": 0.16666666666666666};
    var dataset = [
        {
            "label" : "FAIL",
            "data" : data.KoPercent,
            "color" : "#FF6347"
        },
        {
            "label" : "PASS",
            "data" : data.OkPercent,
            "color" : "#9ACD32"
        }];
    $.plot($("#flot-requests-summary"), dataset, {
        series : {
            pie : {
                show : true,
                radius : 1,
                label : {
                    show : true,
                    radius : 3 / 4,
                    formatter : function(label, series) {
                        return '<div style="font-size:8pt;text-align:center;padding:2px;color:white;">'
                            + label
                            + '<br/>'
                            + Math.round10(series.percent, -2)
                            + '%</div>';
                    },
                    background : {
                        opacity : 0.5,
                        color : '#000'
                    }
                }
            }
        },
        legend : {
            show : true
        }
    });

    // Creates APDEX table
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.14208333333333334, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.155, 500, 1500, "news"], "isController": false}, {"data": [0.185, 500, 1500, "women-accommodation"], "isController": false}, {"data": [0.165, 500, 1500, "Products"], "isController": false}, {"data": [0.03, 500, 1500, "career"], "isController": false}, {"data": [0.17, 500, 1500, "quiz-puzzle-make"], "isController": false}, {"data": [0.125, 500, 1500, "contact"], "isController": false}, {"data": [0.085, 500, 1500, "about"], "isController": false}, {"data": [0.165, 500, 1500, "website-design-and-development"], "isController": false}, {"data": [0.185, 500, 1500, "education-training"], "isController": false}, {"data": [0.245, 500, 1500, "softwareites"], "isController": false}, {"data": [0.005, 500, 1500, "banglapuzzle"], "isController": false}, {"data": [0.19, 500, 1500, "healthcare"], "isController": false}]}, function(index, item){
        switch(index){
            case 0:
                item = item.toFixed(3);
                break;
            case 1:
            case 2:
                item = formatDuration(item);
                break;
        }
        return item;
    }, [[0, 0]], 3);

    // Create statistics table
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 1200, 2, 0.16666666666666666, 2453.3316666666665, 1, 18198, 2054.0, 4454.300000000003, 5478.050000000002, 9068.120000000006, 16.51959637119533, 674.398298438554, 2.2047503949216005], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["news", 100, 0, 0.0, 2260.2699999999995, 601, 7211, 1900.5, 4451.700000000003, 5202.649999999996, 7207.339999999998, 1.5874023747539525, 58.12776059194234, 0.19532490158105276], "isController": false}, {"data": ["women-accommodation", 100, 0, 0.0, 2023.6999999999996, 556, 5608, 1815.5, 3860.1000000000004, 4416.0999999999985, 5600.989999999996, 1.6605227325562086, 57.60262549400551, 0.24161903042077645], "isController": false}, {"data": ["Products", 100, 0, 0.0, 2235.4700000000003, 549, 6947, 1874.0, 4416.700000000003, 5149.099999999999, 6942.039999999997, 1.6927920912753496, 59.839539179672954, 0.21490524596269087], "isController": false}, {"data": ["career", 100, 0, 0.0, 3697.6700000000005, 873, 18198, 3074.0, 6019.800000000001, 6828.049999999999, 18152.999999999978, 1.6161877363674564, 101.88968331811422, 0.192553617028154], "isController": false}, {"data": ["quiz-puzzle-make", 100, 0, 0.0, 2127.0899999999992, 608, 7178, 1863.5, 3393.7000000000003, 4685.249999999995, 7162.969999999992, 1.5766902119071644, 54.417368622288095, 0.22480153411957618], "isController": false}, {"data": ["contact", 100, 0, 0.0, 2423.6100000000015, 430, 8075, 2113.0, 4163.1, 5466.799999999996, 8066.799999999996, 1.6475007413753335, 63.13596102836996, 0.20754648011466606], "isController": false}, {"data": ["about", 100, 0, 0.0, 2984.1099999999997, 596, 12896, 2632.0, 5347.200000000001, 6282.399999999998, 12858.57999999998, 1.659475605708596, 85.21342412047794, 0.20581386906737473], "isController": false}, {"data": ["website-design-and-development", 100, 1, 1.0, 2093.34, 1, 7010, 1801.0, 3903.400000000001, 4636.749999999996, 7004.709999999997, 1.6799381782750396, 64.02634851787454, 0.25986543695192016], "isController": false}, {"data": ["education-training", 100, 0, 0.0, 1976.9099999999999, 600, 5504, 1866.5, 3125.6, 3600.4499999999994, 5501.859999999999, 1.6483154216390847, 58.39125187495879, 0.23823308828377399], "isController": false}, {"data": ["softwareites", 100, 0, 0.0, 1771.879999999999, 543, 16140, 1516.0, 2870.8000000000006, 3227.699999999999, 16035.829999999947, 1.6787255115915996, 47.74039611626853, 0.23443139468515503], "isController": false}, {"data": ["banglapuzzle", 100, 0, 0.0, 3822.5099999999998, 1343, 13090, 3077.0, 6247.700000000002, 9582.299999999994, 13068.10999999999, 1.6724086028698533, 105.43360328795532, 0.1992518062012911], "isController": false}, {"data": ["healthcare", 100, 1, 1.0, 2023.419999999999, 3, 7531, 1645.0, 3670.100000000001, 4609.299999999996, 7513.179999999991, 1.6012553842212294, 49.615054452690906, 0.21828050691742326], "isController": false}]}, function(index, item){
        switch(index){
            // Errors pct
            case 3:
                item = item.toFixed(2) + '%';
                break;
            // Mean
            case 4:
            // Mean
            case 7:
            // Median
            case 8:
            // Percentile 1
            case 9:
            // Percentile 2
            case 10:
            // Percentile 3
            case 11:
            // Throughput
            case 12:
            // Kbytes/s
            case 13:
            // Sent Kbytes/s
                item = item.toFixed(2);
                break;
        }
        return item;
    }, [[0, 0]], 0, summaryTableHeader);

    // Create error table
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: www.banglapuzzle.com:443 failed to respond", 2, 100.0, 0.16666666666666666], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 1200, 2, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: www.banglapuzzle.com:443 failed to respond", 2, "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["website-design-and-development", 100, 1, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: www.banglapuzzle.com:443 failed to respond", 1, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["healthcare", 100, 1, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: www.banglapuzzle.com:443 failed to respond", 1, "", "", "", "", "", "", "", ""], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
