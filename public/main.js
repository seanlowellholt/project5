
const getEnergy = async (startDateday, endDateday, chart) => {
    let watt = await fetch(`http://192.168.40.113:1880/totalload?startDateDay=${startDateday}&endDateDay=${endDateday}&command=${chart}`)
    let response = await watt.json()
    return response
    
}

let date = new Date()
const timestamp = date.toISOString()
const counter = document.querySelector('.chart__dollar')
const reducer = (accu, currentValue) => accu + currentValue

/////////// Dollar amount counter function //////////
const updateCount = () => {
    const speed = 200
    const target = +counter.getAttribute('data-count')
    const count = +counter.innerText;
    const inc = Math.round(target) / speed;
    if(count < target){
        counter.innerText = (count + inc).toFixed(2)
        setTimeout(updateCount, 1)
    } else {

        counter.innerText = target
    }
}

Date.prototype.subTime = function(h,m){
    this.setHours(this.getHours() -h)
    this.setMinutes(this.getMinutes() -m)
    return this
}

function getPowerNumber(value) {
    if(value === 'range'){
        const setMonth = new Date('2021, 1, 1')
        const month = setMonth.setMonth(0)
        let newMonth = new Date(month)
        let startMonth = newMonth.toISOString()
        let chartType = 'linechart'
        getEnergy(timestamp, startMonth, chartType).then((watthour) => {
            let getLabels = []
            let getData = []
            watthour.forEach((data) => {
                getLabels.push(data.time.split("T")[0])
                getData.push(data.sum)
            })
            let displayWatt = ((getData.reduce(reducer,0)/3600 * 10) / 1000).toFixed(2)
            
            //let wattRange = (watts.totalDayload / 1000).toFixed(2)
            let value1 = (displayWatt * .12).toFixed(2)
            
            //let watts = (watthour.totalDayload / 1000).toFixed(2)
            //let value1 = (watts * .12).toFixed(2)
            const setValue = counter.setAttribute('data-count', value1)
            document.querySelector(`[data-value=${value}]`).textContent = `${displayWatt}\r\nkWh`
            let lineData = getData.map(i=> {
                let resetData = (i / 3600 * 10 / 1000).toFixed(2)
                return Number(resetData)
             })
 
            lineChart.data.labels = getLabels
            lineChart.data.datasets[0].data = lineData
            lineChart.update()
            myChart.data.datasets[0].data = [displayWatt, .100 - displayWatt]
            myChart.update()
            updateCount()
        })
       
    } 
    if(value === 'current') {
        const hours = date.setHours(0,0,0,0)
        const midnight = new Date(hours)
        const startDay = midnight.toISOString()
        getEnergy(timestamp, startDay).then((watthour) => {
            let watts = (watthour.totalDayload / 1000).toFixed(2)
            document.querySelector(`[data-value=${value}]`).textContent = `${watts}\r\nkWh`
            chartCurrent.data.datasets[0].data = [watts, .100 - watts]
            chartCurrent.update()
        })
    }
    if(value === 'hourly') {
        let setHour = new Date().subTime(1,0)
        let hours = new Date(setHour.getTime())
        let hour = hours.toISOString()
        getEnergy(timestamp, hour).then((watthour) => {
            
            let watts = (watthour.totalDayload)
            document.querySelector(`[data-value=${value}]`).textContent = `${watts}\r\nWh`
            chartHourly.data.datasets[0].data = [watts, .100 - watts]
            chartHourly.update()
        })
    }
    if(value === 'daily') {
        let setDay = new Date(date)
        setDay.setDate(setDay.getDate()-1)
        let hour1 = new Date(setDay.getTime() - (1000*60*60)).toISOString()
        getEnergy(timestamp, hour1).then((watthour) => {
            let watts = (watthour.totalDayload / 1000).toFixed(2)
            document.querySelector(`[data-value=${value}]`).textContent = `${watts}\r\nkWh`
            chartDaily.data.datasets[0].data = [watts, .100 - watts]
            chartDaily.update()
        })
    }   
}

async function getDeviceInfo(){
    let deviceInfo = await fetch('/netio');
    let response = await deviceInfo.json()
    let getDeviceInfo = response
    let name = getDeviceInfo.Agent.DeviceName
    document.querySelector('.select__title').textContent = `Host Name: ${name}`
}

const dataSetArray = ['current', 'range', 'hourly', 'daily']
//getWatt('2021-01-21', '2021-01-20')
//getPowerNumber(dataSetArray)
getDeviceInfo()
//updateCount()

//////////////  DATE Picker ///////////

const dateRangePicker = document.querySelector('.btn__date-picker')
$(function() {
    $(dateRangePicker).daterangepicker({
        autoUpdateInput: false,
        showISOWeekNumbers: true,
        timePicker24Hour: true,
        timePickerSeconds: true,
        locale: {
            cancelLabel: 'Clear'
        }
    });
    
    $(dateRangePicker).on('apply.daterangepicker', function(ev, picker) {
        
        let setStartDate = `${picker.startDate.format('YYYY-MM-DD')}` 
        let setEndDate = `${picker.endDate.format('YYYY-MM-DD')}`
        let chartType = 'linechart'
        let start = new Date(setStartDate)
        let end = new Date(setEndDate)
        getEnergy(end.toISOString(), start.toISOString(), chartType).then((watts)=> {
            let getLabels = []
            let getData = []
            watts.forEach((data) => {
                getLabels.push(data.time.split("T")[0])
                getData.push(data.sum)
            })
            let displayWatt = ((getData.reduce(reducer,0)/3600 * 10) / 1000).toFixed(2)
            
            //let wattRange = (watts.totalDayload / 1000).toFixed(2)
            let value = (displayWatt * .12)
            
            counter.setAttribute('data-count', value)
            //const dollarcount = counter.getAttribute('data-count')
            updateCount()
            document.querySelector(`[data-value=range]`).textContent = `${displayWatt}\r\nkWh`
            let lineData = getData.map(i=> {
               let resetData = (i / 3600 * 10 / 1000).toFixed(2)
               return Number(resetData)
            })
            lineChart.data.labels = getLabels
            lineChart.data.datasets[0].data = lineData
            lineChart.update()
            myChart.data.datasets[0].data = [displayWatt, 100 - displayWatt]
	       myChart.update()
        })
    })
  });
//////////////////////////////////

const animationTime = '2000'; 
const rangeContainer = document.querySelector('.chart__range-container') 
const divElement = document.createElement('div')
const domString = '<div class="chart__value"><span class="range__kwh" data-value="range"></p></div>'; 

let ctx = document.querySelector('.chart__date-range').getContext('2d')
let myChart = new Chart(ctx, {
    type: 'doughnut', 
    data: {
        datasets: [
            {
                data: [], 
                backgroundColor: ['#265F5B'],
                borderWidth: 0 
            }
        ]
    },
    options: {
        cutoutPercentage: 84, 
        responsive: false,
        tooltips: {
            enabled: false 
        }
    }
});

Chart.defaults.global.animation.duration = animationTime;
divElement.innerHTML = domString;
rangeContainer.appendChild(divElement.firstChild); 

var gradientFill = ctx.createLinearGradient(500, 0, 100, 0);
gradientFill.addColorStop(0, "rgba(128, 182, 244, 0.6)");
gradientFill.addColorStop(1, "rgba(244, 144, 128, 0.6)");
let ctx1 = document.querySelector('.chart__multi-line').getContext('2d')
let lineChart = new Chart(ctx1, {
    type: 'line', 
    data: {
        labels: [],
        datasets: [{
            label: '# of Votes',
            fillColor: "rgba(151,187,205,0.2)",
            strokeColor: "rgba(151,187,205,1)",
            pointColor: "rgba(151,187,205,1)",
            pointStrokeColor: "#fff",
            pointHighlightFill: "#fff",
            pointHighlightStroke: "rgba(151,187,205,1)",
            backgroundColor: gradientFill,
            data: []
        }]
    },
    options: {
        responsive:true,
        maintainAspectRation: false,
        scales: {
            yAxes: [{
                ticks: {
                    beginAtZero: true
                }
            }]
        },
        animation: {
            easing: "easeInOutBack"
          }
    }
});

//Chart.defaults.global.animation.duration = animationTime;

const currentContainer = document.querySelector('.chart__figure1') 
const currentDiv = document.createElement('div')
const addStringCurrent = '<span class="chart__value-current" data-value="current"></span>'; 
let ctx2 = document.querySelector('.chart__current').getContext('2d')
let chartCurrent = new Chart(ctx2, {
    type: 'doughnut', 
    data: {
        datasets: [
            {
                data: [], 
                backgroundColor: ['#265F5B'],
                borderWidth: 0 
            }
        ]
    },
    options: {
        cutoutPercentage: 84, 
        responsive: false,
        tooltips: {
            enabled: false 
        }
    }
});
currentDiv.innerHTML = addStringCurrent;
currentContainer.prepend(currentDiv.firstChild);

const hourlyContainer = document.querySelector('.chart__figure2') 
const hourlyDiv = document.createElement('div')
const addStringHourly = '<span class="chart__value-hourly" data-value="hourly"></span>'; 
let ctx3 = document.querySelector('.chart__hourly').getContext('2d')
let chartHourly = new Chart(ctx3, {
    type: 'doughnut', 
    data: {
        datasets: [
            {
                data: [], 
                backgroundColor: ['#265F5B'],
                borderWidth: 0 
            }
        ]
    },
    options: {
        cutoutPercentage: 84, 
        responsive: false,
        tooltips: {
            enabled: false 
        }
    }
});
hourlyDiv.innerHTML = addStringHourly;
hourlyContainer.prepend(hourlyDiv.firstChild);

const dailyContainer = document.querySelector('.chart__figure3') 
const dailyDiv = document.createElement('div')
const addStringDaily = '<span class="chart__value-daily" data-value="daily"></span>'; 
let ctx4 = document.querySelector('.chart__daily').getContext('2d')

let chartDaily = new Chart(ctx4, {
    type: 'doughnut', 
    data: {
        datasets: [
            {
                data: [], 
                backgroundColor: ['#265F5B'],
                borderWidth: 0 
            }
        ]
    },
    options: {
        cutoutPercentage: 84, 
        responsive: false,
        tooltips: {
            enabled: false 
        }
    }
});
dailyDiv.innerHTML = addStringDaily;
dailyContainer.prepend(dailyDiv.firstChild);

let start = 60000 - ((date.getMinutes() * 60 + date.getSeconds()) * 1000 + date.getMilliseconds());
setTimeout(function doSomething() {
    let now = new Date();
    let hour = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), (now.getMinutes() - (now.getMinutes() % 60)) + 60, 0, 0)
    let diff = hour - now
    if(diff > 100) {
        window.setTimeout(doSomething, diff);
    }
    getPowerNumber('hourly')
   let d = new Date()
}, start);

setTimeout(function getCurrent() {
    setTimeout(getCurrent, 10000)
    getPowerNumber('current')
}, start)

let timeID = setTimeout(getPowerNumber,start,'daily')
setTimeout(()=>{
    clearTimeout(timeID)
}, 2000)

getPowerNumber('range')