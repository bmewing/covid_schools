Date.prototype.addDays = function(days) {
    var date = new Date(this.valueOf());
    date.setDate(date.getDate() + days);
    return date;
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

console.log(covid_data)

const start_date = new Date(2020, 2, 23);
const population = 159332;
const new_cases = [1,0,0,2,2,0,2,3,2,4,0,1,0,3,4,1,1,7,1,2,0,5,1,0,2,0,0,0,0,0,2,0,0,1,0,0,0,1,1,0,0,2,2,1,0,0,2,0,0,0,
                   0,0,2,1,0,0,0,0,1,2,1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,2,0,0,4,1,0,3,0,1,0,0,1,0,1,0,0,1,2,2,0,2,4,0,4,2,
                   2,10,7,8,1,4,20,18,19,11,21,11,27,29,13];
let case_rate = new_cases.map(function(x) { return x/population * 100000 });
let average = [];
let tmp = [];
for(let i=0; i<new_cases.length; i++){
    if(i<13){average.push(0);continue;}
    tmp = case_rate.slice(i-13,i+1);
    average.push(tmp.reduce(function(x,y){return x+y;}) / 14);
}

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
    let this_date = start_date.addDays(i)
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
