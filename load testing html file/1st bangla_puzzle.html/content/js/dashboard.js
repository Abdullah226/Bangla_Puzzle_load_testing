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

    var data = {"OkPercent": 100.0, "KoPercent": 0.0};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.16064814814814815, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.17777777777777778, 500, 1500, "news"], "isController": false}, {"data": [0.22777777777777777, 500, 1500, "women-accommodation"], "isController": false}, {"data": [0.19444444444444445, 500, 1500, "Products"], "isController": false}, {"data": [0.03333333333333333, 500, 1500, "career"], "isController": false}, {"data": [0.23333333333333334, 500, 1500, "quiz-puzzle-make"], "isController": false}, {"data": [0.13333333333333333, 500, 1500, "contact"], "isController": false}, {"data": [0.06111111111111111, 500, 1500, "about"], "isController": false}, {"data": [0.18888888888888888, 500, 1500, "website-design-and-development"], "isController": false}, {"data": [0.2222222222222222, 500, 1500, "education-training"], "isController": false}, {"data": [0.2611111111111111, 500, 1500, "softwareites"], "isController": false}, {"data": [0.0, 500, 1500, "banglapuzzle"], "isController": false}, {"data": [0.19444444444444445, 500, 1500, "healthcare"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 1080, 0, 0.0, 2325.2740740740787, 533, 11993, 1890.5, 4193.699999999999, 5077.800000000001, 8416.85, 14.88279796601761, 609.9924520184795, 1.9899444220513458], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["news", 90, 0, 0.0, 2244.366666666667, 653, 7780, 1814.5, 4550.8, 5383.050000000002, 7780.0, 1.516530178950561, 55.53255089854414, 0.18660429936305734], "isController": false}, {"data": ["women-accommodation", 90, 0, 0.0, 1941.4888888888884, 583, 6868, 1551.5, 3810.8000000000006, 4486.4, 6868.0, 1.567671137432503, 54.38165443738025, 0.2281083979271904], "isController": false}, {"data": ["Products", 90, 0, 0.0, 2037.8333333333335, 796, 8104, 1575.5, 3676.300000000001, 4733.5, 8104.0, 1.52565645606957, 53.93135976250615, 0.19368685477445713], "isController": false}, {"data": ["career", 90, 0, 0.0, 3411.3222222222194, 1241, 11102, 2781.0, 5836.200000000001, 7772.7000000000035, 11102.0, 1.478245158747105, 93.19296334773253, 0.1761190521163543], "isController": false}, {"data": ["quiz-puzzle-make", 90, 0, 0.0, 1909.2555555555548, 579, 4848, 1540.0, 3631.4, 4055.100000000001, 4848.0, 1.542760169360783, 53.24631826713749, 0.21996385227214288], "isController": false}, {"data": ["contact", 90, 0, 0.0, 2277.6666666666665, 602, 11993, 1981.0, 3720.5000000000005, 4129.250000000001, 11993.0, 1.5020277374455515, 57.56110593050619, 0.18922029114304312], "isController": false}, {"data": ["about", 90, 0, 0.0, 2797.188888888889, 808, 11915, 2524.5, 4679.700000000003, 5348.100000000001, 11915.0, 1.5065030715923737, 79.3032632530423, 0.1868416895431948], "isController": false}, {"data": ["website-design-and-development", 90, 0, 0.0, 2156.688888888889, 569, 7298, 1807.5, 4507.4000000000015, 4919.9, 7298.0, 1.7045131720990134, 65.58380759834094, 0.2663301831404708], "isController": false}, {"data": ["education-training", 90, 0, 0.0, 1820.6333333333332, 594, 4660, 1545.0, 3397.7000000000003, 3799.1000000000004, 4660.0, 1.5690103031676574, 55.581883542389434, 0.2267710203797005], "isController": false}, {"data": ["softwareites", 90, 0, 0.0, 1684.7555555555562, 533, 6595, 1354.5, 3000.8, 3576.100000000001, 6595.0, 1.6235816210560496, 46.172187877708225, 0.22673063653419442], "isController": false}, {"data": ["banglapuzzle", 90, 0, 0.0, 3637.866666666666, 1611, 10813, 2841.5, 6375.200000000001, 8528.900000000001, 10813.0, 1.49902563333833, 94.5030261579973, 0.17859485084694948], "isController": false}, {"data": ["healthcare", 90, 0, 0.0, 1984.2222222222226, 585, 6675, 1590.0, 3720.3000000000006, 4090.5, 6675.0, 1.4855407368282054, 46.46376828040407, 0.20455199598904], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": []}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 1080, 0, "", "", "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
