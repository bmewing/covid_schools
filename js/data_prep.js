const yellow_thresh = 6;
const red_thresh = 11;

function days_since_max(s,d){
    let max = 0;
    let days = 0;
    let output = [];
    for(let i=0; i < s.length; i++){
        let this_date = make_date(d[i])
        if(s[i] > max && days < 0){
            output.push({x: this_date, y: days, max: s[i]});
            max = s[i];
            days = 0;
        }
        if(s[i] > 0){
            days--;
        }
    }
    if(days < 0){
        output.push({x: make_date(d[d.length-1]), y: days, max: max})
    }
    return output;
}

function mean(x){
    return x.reduce(function(x,y){return x+y;}) / x.length;
}

function sd(x){
    let mx = mean(x);
    let ss = x.map(function(a){return Math.pow(a-mx, 2)}).reduce(function(a, b){return a+b});
    return Math.pow(ss/(x.length - 1), 0.5);
}

function child_cor(c, p){
    let mc = mean(c);
    p = p.slice(-c.length);
    let mp = mean(p);
    let sc = sd(c);
    let sp = sd(p);
    let sum = 0;
    for(let i=0; i<c.length; i++){
        sum = sum + (c[i] - mc)*(p[i] - mp);
    }
    let r = Math.pow(sum/(sc*sp)/(c.length-1), 2)*100;
    document.getElementById("child_corr").innerText = r.toFixed(1)
}

function days_till_school() {
    let school_start = new Date('2020-08-10 00:00:00');
    let today = new Date();
    return Math.ceil((school_start - today) / (60 * 60 * 24 * 1000)).toString();
}

scenario_calc = function(cases, val){
    let days_left = 7;
    let to_keep = 14-days_left;
    let avg = cases.slice(cases.length - to_keep, cases.length);
    while(avg.length < 14){
        avg.push(val);
    }
    let avg14 = avg.reduce(function(x,y){return x+y;}) / 14;
    let color = ' (Green)';
    if(avg14 >= red_thresh){
        color = ' (Red)';
    } else if(avg14 >= yellow_thresh){
        color = ' (Yellow)';
    }
    return {"avg14": avg14, "color": color};
}

function all_fixed(cases, val, idname) {
    let tmp = scenario_calc(cases, val);
    document.getElementById(idname).innerText = tmp.avg14.toFixed(2) + tmp.color
}

function all_fixed_no_senior(cases, val, idname) {
    let tmp = scenario_calc(cases, val);
    document.getElementById(idname).innerText = 'ignoring seniors, '+tmp.avg14.toFixed(2) + tmp.color
}

function make_date(d)
{
    return new Date(d + ' 00:00:00');
}

let covid_data;

function loadCOVIDData()
{
    let textfile;
    if (window.XMLHttpRequest)
    {
        textfile = new XMLHttpRequest();
    }
    textfile.onreadystatechange = function ()
    {
        if (textfile.readyState == 4 && textfile.status == 200)
        {
            covid_data = JSON.parse(textfile.responseText);
        }
    }
    textfile.open("GET", "data/covid_data.json", false);
    textfile.send();
}
loadCOVIDData();

function calc_rate(series, pop){
    return series.map(function(x) { return x/pop * 100000 });
}

const dates = covid_data.dates;
const kid_dates = covid_data.kid_dates;
const population = 158348;
const kid_population = 22643;

const new_cases = covid_data.cases;
const conf_cases = covid_data.conf_cases;
const adj_conf_cases = covid_data.adj_conf_cases;
const kid_cases = covid_data.kid_cases;

let case_rate = calc_rate(new_cases, population);
let conf_rate = calc_rate(conf_cases, population);
let adj_rate = calc_rate(adj_conf_cases, population);
let kid_rate = calc_rate(kid_cases, kid_population);

// child_cor(kid_rate, conf_rate);

function calc_averages(series){
    let avg = [];
    let tmp = [];
    for(let i=0; i<series.length; i++){
        if(i>series.length-13){avg.push(0);continue;}
        tmp = series.slice(i,i+14);
        avg.push(tmp.reduce(function(x,y){return x+y;}) / 14);
    }
    return avg;
}

function category_label(val){
    let lab = 'ERROR';
    if(val < yellow_thresh){
        lab = 'Green'
    } else if(val < red_thresh){
        lab = 'Yellow'
    } else {
        lab ='Red'
    }
    return lab;
}

let average = calc_averages(case_rate);
let conf_avg = calc_averages(conf_rate);
let adj_avg = calc_averages(adj_rate);
let kid_avg = calc_averages(kid_rate);

all_fixed(conf_rate, 0, "all_zero");
all_fixed(conf_rate, 7.5, "seven_point_five");
all_fixed(conf_rate, 4.5, "four_point_five");

all_fixed_no_senior(adj_rate, 0, "all_zero_no_senior");
all_fixed_no_senior(adj_rate, 7.5, "seven_no_senior");
all_fixed_no_senior(adj_rate, 4.5, "four_no_senior");

let chart_rate = [];
let chart_new_avg  = [];
let chart_conf_avg = [];
let chart_adj_avg = [];
let chart_kid_rate = [];
let chart_kid_avg = [];
let green = [];
let yellow = [];
let red = [];
let max_rate = conf_rate.reduce(function(x,y){if(x > y){return x;}else{return y;}});
let chart2_days_since_max = days_since_max(conf_avg, dates)
for(let i=0; i<new_cases.length; i++){
    let this_date = make_date(dates[i]);
    if(conf_avg[i] === 0){continue;}
    chart_rate.push({x: this_date, y:conf_rate[i], new_rate:case_rate[i]});
    chart_conf_avg.push({x: this_date, y: conf_avg[i], category: category_label(conf_avg[i])});
    chart_new_avg.push({x: this_date, y: average[i], category: category_label(average[i])});
    chart_adj_avg.push({x: this_date, y: adj_avg[i], category: category_label(adj_avg[i])});
    green.push({x: this_date, y:yellow_thresh});
    yellow.push({x: this_date, y:red_thresh-yellow_thresh});
    red.push({x: this_date, y:(max_rate-red_thresh)})
}
for(let i=0; i<kid_cases.length; i++){
    let this_date = make_date(kid_dates[i]);
    if(kid_avg[i] === 0){continue;}
    chart_kid_rate.push({x: this_date, y: kid_rate[i]});
    chart_kid_avg.push({x: this_date, y: kid_avg[i], category: category_label(kid_avg[i])});
}

window.onload = function () {
    // let chart2 = new CanvasJS.Chart("flatContainer",
    //     {
    //         axisX:{
    //         title: "Date"
    //     },
    //     title:{
    //         text: "Days Since New Maximum Rate Observed"
    //     },
    //     data: [
    //         {
    //             type: "line",
    //             color: "rgba(0,0,0,1)",
    //             lineThickness:3,
    //             toolTipContent: "Date: {x}<hr/><br/>Days Since New Maximum Rate Observed: {y}<br/>Maximum Rate: {max}.",
    //             dataPoints: chart2_days_since_max
    //         }
    //         ]
    //     });
    let chart = new CanvasJS.Chart("chartContainer",
    {
        zoomEnabled: true,
        axisX:{
            title: "Daily Case Rate per 100,000 Residents"
        },
        title:{
            text: "Sullivan County Confirmed COVID Rate"
        },
        data: [
            {
                type: "stackedArea",
                color: "rgba(9,255,0,0.15)",
                markerType:"none",
                toolTipContent: "Green Zone",
                dataPoints: green
            },
            {
                type: "stackedArea",
                color: "rgba(223,235,99,0.15)",
                markerType:"none",
                toolTipContent: "Yellow Zone",
                dataPoints: yellow
            },
            {
                type: "stackedArea",
                color: "rgba(255,0,0,0.15)",
                markerType:"none",
                toolTipContent: "Red Zone",
                dataPoints: red
            },
            {
                type: "column",
                color: "rgba(97,0,145,0.75)",
                showInLegend:true,
                legendText: "Daily Confirmed Case Rate",
                toolTipContent: "Date: {x}<hr/><br/>Confirmed Rate: {y}<br/>Total Rate: {new_rate}.",
                dataPoints: chart_rate
            },
            {
                type: "column",
                color: "rgba(29,143,0,0.75)",
                showInLegend:true,
                legendText: "School Aged Children Rate",
                toolTipContent: "Date: {x}<hr/>Category: <strong>{category}</strong><br/>School Aged Children Rate (5-18yo): {y}",
                dataPoints: chart_kid_rate
            },
            {
                type: "line",
                color: "rgba(0,0,0,1)",
                lineThickness:4,
                markerType:"none",
                showInLegend:true,
                legendText: "14DA School Aged Children",
                toolTipContent: "Date: {x}<hr/>Category: <strong>{category}</strong><br/>14 Day Average School Aged Children Rate (5-18yo): {y}",
                dataPoints: chart_kid_avg
            },
            {
                type: "line",
                color: "rgba(255,0,0,1)",
                lineThickness:3,
                markerType:"none",
                showInLegend:true,
                legendText: "14DA New",
                toolTipContent: "Date: {x}<hr/>Category: <strong>{category}</strong><br/>14 Day Average New Case Rate: {y}" +
                    "<br/>*NOTE* This includes Probable Cases.",
                dataPoints: chart_new_avg
            },
            {
                type: "line",
                color: "rgba(0,0,255,1)",
                lineThickness:3,
                markerType:"none",
                showInLegend:true,
                legendText: "14DA Less Nursing Home Residents",
                toolTipContent: "Date: {x}<hr/>Category: <strong>{category}</strong><br/>14 Day Average Confirmed Case Rate Less Nursing Home Residents: {y}" +
                    "<br/>*NOTE* This is a naive adjustment of confirmed cases assuming all active nursing home cases occurred in the last 14 days and does " +
                    "*not* include an adjustment to the total population to account for all nursing home residents.",
                dataPoints: chart_adj_avg
            },
            {
                type: "line",
                color: "rgba(255,145,0,1)",
                lineThickness:4,
                markerType:"none",
                showInLegend:true,
                legendText: "14DA Confirmed",
                toolTipContent: "Date: {x}<hr/>Category: <strong>{category}</strong><br/>14 Day Average Confirmed Case Rate: {y}",
                dataPoints: chart_conf_avg
            }
            ]
    });
    chart.render();
    chart2.render();
}

function makeTable(D){
  var a = '';
  cols = Object.keys(D[0]);
  a += '<table border=1><thead><tr>';
  for(j=0;j<cols.length;j++) {
    a+= `<th>${cols[j]}</th>`;
  }
  a += '</tr></thead><tbody>';

  for(i=0;i<D.length; i++) {
    a += '<tr>';
    for(j=0;j<cols.length;j++) {
      a += `<td>${D[i][cols[j]]}</td>`;
    }
    a += '</tr>';
  }
  a += '</tbody></table>';
  return a;
}

table = makeTable(covid_data.full_senior)
document.getElementById('senior_table').innerHTML = table;
