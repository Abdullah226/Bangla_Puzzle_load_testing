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

    var data = {"OkPercent": 99.0, "KoPercent": 1.0};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.06833333333333333, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.07, 500, 1500, "news"], "isController": false}, {"data": [0.11666666666666667, 500, 1500, "women-accommodation"], "isController": false}, {"data": [0.04666666666666667, 500, 1500, "Products"], "isController": false}, {"data": [0.0033333333333333335, 500, 1500, "career"], "isController": false}, {"data": [0.09333333333333334, 500, 1500, "quiz-puzzle-make"], "isController": false}, {"data": [0.03, 500, 1500, "contact"], "isController": false}, {"data": [0.006666666666666667, 500, 1500, "about"], "isController": false}, {"data": [0.12333333333333334, 500, 1500, "website-design-and-development"], "isController": false}, {"data": [0.08333333333333333, 500, 1500, "education-training"], "isController": false}, {"data": [0.15666666666666668, 500, 1500, "softwareites"], "isController": false}, {"data": [0.0, 500, 1500, "banglapuzzle"], "isController": false}, {"data": [0.09, 500, 1500, "healthcare"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 1800, 18, 1.0, 3879.0350000000044, 1, 68759, 2902.0, 7400.6, 9660.749999999975, 19530.83, 12.877839384725451, 522.5479705106421, 1.7049583035235198], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["news", 150, 1, 0.6666666666666666, 3554.853333333332, 1, 35350, 2693.0, 5686.700000000002, 7620.399999999999, 30895.15000000008, 1.227475818726371, 44.66505605217181, 0.15003014987479746], "isController": false}, {"data": ["women-accommodation", 150, 0, 0.0, 3267.813333333332, 545, 20214, 2532.0, 6044.8, 8013.549999999995, 19228.170000000016, 1.3145095564844755, 45.599617642032754, 0.19127141007440124], "isController": false}, {"data": ["Products", 150, 1, 0.6666666666666666, 4145.693333333333, 2, 43231, 2839.0, 7376.900000000003, 11728.149999999998, 38996.980000000076, 1.6184896254815007, 56.853705059938065, 0.20410250029672308], "isController": false}, {"data": ["career", 150, 1, 0.6666666666666666, 5421.660000000001, 1293, 23256, 4914.0, 8211.2, 10389.949999999995, 21865.740000000023, 1.181986525353611, 74.02950133712226, 0.13988379594972616], "isController": false}, {"data": ["quiz-puzzle-make", 150, 3, 2.0, 3282.7599999999993, 1, 21251, 2468.0, 5728.1, 7802.749999999995, 20659.91000000001, 1.2544742916401834, 42.48208584576657, 0.1752833805155053], "isController": false}, {"data": ["contact", 150, 3, 2.0, 3468.2266666666665, 1, 12190, 2785.5, 6555.9000000000015, 7808.999999999996, 11713.660000000009, 1.1765074982744557, 44.23300534918743, 0.1452481229803288], "isController": false}, {"data": ["about", 150, 3, 2.0, 5638.379999999999, 1, 68759, 4453.5, 8996.8, 13140.749999999995, 45606.53000000041, 1.1684335979186304, 60.32490304435373, 0.14201488827827413], "isController": false}, {"data": ["website-design-and-development", 150, 1, 0.6666666666666666, 2817.5399999999986, 2, 12555, 2197.5, 5037.500000000001, 6408.949999999989, 12059.28000000001, 1.3388673182487616, 51.18990089592538, 0.20780336501985988], "isController": false}, {"data": ["education-training", 150, 1, 0.6666666666666666, 3110.186666666666, 1, 13284, 2634.5, 6404.3, 7491.649999999999, 12083.460000000021, 1.2872332209149655, 45.313601187794454, 0.18480512361729698], "isController": false}, {"data": ["softwareites", 150, 1, 0.6666666666666666, 2381.079999999999, 1, 18757, 1846.5, 4157.1, 6291.899999999999, 15528.700000000057, 1.3227513227513228, 37.38435398754409, 0.18348868772045854], "isController": false}, {"data": ["banglapuzzle", 150, 2, 1.3333333333333333, 6543.133333333335, 1580, 28895, 5025.0, 12249.2, 14425.549999999987, 27405.800000000025, 1.592086269848009, 99.05966990081303, 0.18715305786702896], "isController": false}, {"data": ["healthcare", 150, 1, 0.6666666666666666, 2917.0933333333332, 1, 19531, 2339.5, 4993.1, 6808.099999999989, 15571.870000000072, 1.2083910675732286, 37.559831092103565, 0.16528052043389294], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["Non HTTP response code: org.apache.http.ConnectionClosedException/Non HTTP response message: Premature end of Content-Length delimited message body (expected: 63,380; received: 47,952)", 3, 16.666666666666668, 0.16666666666666666], "isController": false}, {"data": ["Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: www.banglapuzzle.com:443 failed to respond", 15, 83.33333333333333, 0.8333333333333334], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 1800, 18, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: www.banglapuzzle.com:443 failed to respond", 15, "Non HTTP response code: org.apache.http.ConnectionClosedException/Non HTTP response message: Premature end of Content-Length delimited message body (expected: 63,380; received: 47,952)", 3, "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": ["news", 150, 1, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: www.banglapuzzle.com:443 failed to respond", 1, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": ["Products", 150, 1, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: www.banglapuzzle.com:443 failed to respond", 1, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["career", 150, 1, "Non HTTP response code: org.apache.http.ConnectionClosedException/Non HTTP response message: Premature end of Content-Length delimited message body (expected: 63,380; received: 47,952)", 1, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["quiz-puzzle-make", 150, 3, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: www.banglapuzzle.com:443 failed to respond", 3, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["contact", 150, 3, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: www.banglapuzzle.com:443 failed to respond", 3, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["about", 150, 3, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: www.banglapuzzle.com:443 failed to respond", 3, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["website-design-and-development", 150, 1, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: www.banglapuzzle.com:443 failed to respond", 1, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["education-training", 150, 1, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: www.banglapuzzle.com:443 failed to respond", 1, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["softwareites", 150, 1, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: www.banglapuzzle.com:443 failed to respond", 1, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["banglapuzzle", 150, 2, "Non HTTP response code: org.apache.http.ConnectionClosedException/Non HTTP response message: Premature end of Content-Length delimited message body (expected: 63,380; received: 47,952)", 2, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["healthcare", 150, 1, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: www.banglapuzzle.com:443 failed to respond", 1, "", "", "", "", "", "", "", ""], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
