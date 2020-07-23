function days_till_school() {
    let school_start = new Date('2020-08-03 00:00:00');
    let today = new Date();
    return Math.ceil((school_start - today) / (60 * 60 * 24 * 1000)).toString();
}

function all_fixed(cases, val, idname) {
    let days_left = days_till_school();
    let to_keep = 14-days_left;
    let avg = cases.slice(cases.length - to_keep, cases.length);
    while(avg.length < 14){
        avg.push(val);
    }
    let avg14 = avg.reduce(function(x,y){return x+y;}) / 14;
    let color = ' (Green)';
    if(avg14 > 10){
        color = ' (Red)'
    } else if(avg14 > 5){
        color = ' (Yellow)'
    }
    document.getElementById(idname).innerText = avg14.toFixed(2) + color
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
    textfile.open("GET", "http://sullivan-covid.s3-website-us-east-1.amazonaws.com/data/covid_data.json", false);
    textfile.send();
}
loadCOVIDData();

const dates = covid_data.dates;
const population = 158348;
const new_cases = covid_data.cases;
let case_rate = new_cases.map(function(x) { return x/population * 100000 });
let average = [];
let tmp = [];
for(let i=0; i<new_cases.length; i++){
    if(i<13){average.push(0);continue;}
    tmp = case_rate.slice(i-13,i+1);
    average.push(tmp.reduce(function(x,y){return x+y;}) / 14);
}

all_fixed(case_rate, 0, "all_zero");
all_fixed(case_rate, 7.5, "seven_point_five");
all_fixed(case_rate, 4.5, "four_point_five");

let chart_rate = [];
let chart_avg  = [];
let green = [];
let yellow = [];
let red = [];
let max_rate = case_rate.reduce(function(x,y){if(x > y){return x;}else{return y;}})
for(let i=0; i<new_cases.length; i++){
    let lab='ERROR'
    if(average[i] < 5){
        lab = 'Green'
    } else if(average[i] < 10){
        lab = 'Yellow'
    } else {
        lab ='Red'
    }
    let this_date = make_date(dates[i])
    chart_rate.push({x: this_date, y:case_rate[i]})
    chart_avg.push({x: this_date, y:average[i], category:lab})
    green.push({x: this_date, y:5});
    yellow.push({x: this_date, y:5});
    red.push({x: this_date, y:(max_rate-10)})
}

window.onload = function () {
    let chart = new CanvasJS.Chart("chartContainer",
    {
        zoomEnabled: true,
        axisX:{
            title: "Daily Case Rate per 100,000 Residents"
        },
        title:{
            text: "Sullivan County COVID Rate"
        },
        data: [
            {
                type: "stackedArea",
                color: "rgba(9,255,0,0.25)",
                toolTipContent: "Green Zone",
                dataPoints: green
            },
            {
                type: "stackedArea",
                color: "rgba(223,235,99,0.25)",
                toolTipContent: "Yellow Zone",
                dataPoints: yellow
            },
            {
                type: "stackedArea",
                color: "rgba(255,0,0,0.25)",
                toolTipContent: "Red Zone",
                dataPoints: red
            },
            {
                type: "column",
                color: "rgba(97,0,145,0.75)",
                showInLegend:true,
                legendText: "Daily Case Rate",
                dataPoints: chart_rate
            },
            {
                type: "line",
                color: "rgba(0,0,0,1)",
                lineThickness:4,
                showInLegend:true,
                legendText: "14 Day Average Case Rate",
                toolTipContent: "Date: {x}<hr/>Category: <strong>{category}</strong><br/>14 Day Average New Case Rate: {y}",
                dataPoints: chart_avg
            }
            ]
    });
    chart.render();
}

document.getElementById('days_till_school').innerText = days_till_school();
