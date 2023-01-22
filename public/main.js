

Date.prototype.subTime = function(d,h,m){
    this.setDate(this.getDate() -d)
    this.setHours(this.getHours() -h)
    this.setMinutes(this.getMinutes() -m)
    return this
}

let date = new Date()
const timestamp = date.toISOString()
console.log(timestamp)
const counter = document.querySelector('.chart__dollar')
const reducer = (accu, currentValue) => accu + currentValue
const clock = Intl.DateTimeFormat("en", {
    timeStyle: 'medium',
    dateStyle: 'medium'
})


//// Fucntion API to get Watt load from database ////
const getEnergy = async (startDateday, endDateday, chart) => {
    let watt = await fetch(`http://192.168.40.113:1880/totalload?startDateDay=${startDateday}&endDateDay=${endDateday}&command=${chart}`)
    let response = await watt.json()
    // console.log(watt)
    return response
}

/// Function to increment dollar amount after calculating kWh total //////
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

/// Function get Watt load and re format for dashboard charts ////

let dateFormat = Intl.DateTimeFormat("en", {
    month: 'short',
    day: '2-digit'
})
function getPowerNumber(value) {
        
    if(value === 'alldata') {
        const getFirstEntry = new Date('2020, 6, 28')
        const everyMonth = getFirstEntry.setMonth(5)
        let setMonth = new Date(everyMonth)
        let startdata = setMonth.toISOString()
        let chartType = 'linechart'
        console.log("Get this"+startdata)
        getEnergy(timestamp, startdata, chartType).then((alldata) => {
            let setLineLabels = []
            let getDates = []
            
            alldata.forEach((data) => {
                let newDate = new Date(data.time)
                setLineLabels.push(dateFormat.format(newDate))
                getDates.push(data.sum)
            })
            let setData = getDates.map(i=> {
                let resetData = (i / 3600 * 10 / 1000).toFixed(2)
                return Number(resetData)
            })
            lineChart.data.labels = setLineLabels
            lineChart.data.datasets[0].data = setData
            lineChart.update()
        })
    }

    if(value === 'range'){
        const setMonth = new Date('2021, 1, 12')
        const month = setMonth.setMonth(0)
        let newMonth = new Date(month)
        let startMonth = newMonth.toISOString()
        let chartType = 'barchart'
        getEnergy(timestamp, startMonth, chartType).then((watthour) => {
            let setBarLabels = []
            let getData = []
            
            watthour.forEach((data) => {
                setBarLabels.push(Date.parse(data.time))
                getData.push(data.sum)
            })
            let displayWatt = ((getData.reduce(reducer,0)/3600 * 10) / 1000).toFixed(2)
            let value1 = (displayWatt * .12).toFixed(2)
            const setValue = counter.setAttribute('data-count', value1)

            /// Function step update dollar amount ///
            updateCount()
            
            document.querySelector(`[data-value=${value}]`).textContent = `${displayWatt}\r\nkWh`
            let lineData = getData.map(i=> {
                let resetData = (i / 3600 * 10 / 1000).toFixed(2)
                return Number(resetData)
             })

            barChart.data.labels = setBarLabels
            barChart.data.datasets[0].data = lineData
            barChart.update()
            myChart.data.datasets[0].data = [displayWatt, 100 - displayWatt]
            myChart.update()
        })
    } 
    if(value === 'current') {
        const hours = date.setHours(0,0,0,0)
        const midnight = new Date(hours)
        const startDay = midnight.toISOString()
        const chartType = 'current'
        getEnergy(timestamp, startDay, chartType).then((watthour) => {
            let watts = (watthour[0].sum / 1000).toFixed(2)
            console.log(watts)
            document.querySelector(`[data-value=${value}]`).textContent = `${watts}\r\nkWh`
            chartCurrent.data.datasets[0].data = [watts, .100 - watts]
            //console.log(chartCurrent)
            chartCurrent.update()
            
        })
    }
    if(value === 'hourly') {
        let setHour = new Date().subTime(0,1,0)
        let hours = new Date(setHour.getTime())
        let hour = hours.toISOString()
        const chartType = 'hourly'
        //console.log(hour)
        getEnergy(timestamp, hour, chartType).then((watthour) => {
            //console.log('watt hour'+watthour)
            let watts = (watthour[0].sum / 3600).toFixed(2)
            console.log(watthour[0].sum)
            document.querySelector(`[data-value=${value}]`).textContent = `${watts}\r\nWh`
            chartHourly.data.datasets[0].data = [watts, .100 - watts]
            chartHourly.update()
        })
    }
    if(value === 'daily') {
        let setDay = new Date(date)
        console.log(`set day:${setDay}`)
        setDay.setDate(setDay.getDate()-1)
        console.log(`set Date:${setDay}`)
        let day = new Date(setDay.getTime() - (1000*60*60)).toISOString()
        console.log(`new Day:${day}`)
        const chartType = 'daily'
        getEnergy(timestamp, day, chartType).then((watthour) => {
            let watts = (watthour[0].sum / 1000).toFixed(2)
            // console.log(watts)
            document.querySelector(`[data-value=${value}]`).textContent = `${watts}\r\nkWh`
            chartDaily.data.datasets[0].data = [watts, .100 - watts]
            chartDaily.update()
        })
    }   
}
let convertDate = new Date(date)
class Dates {
    constructor(baseURL = 'http://192.168.40.113:1880/totalload?'){
        this.baseURL = baseURL
    }
    current(){
        let formatCurrent = date.setHours(0,0,0,0)
        let morningdate = new Date(formatCurrent)
        let current = morningdate.toISOString()
        return getEnergy(timestamp, current)
    }
    hourly(){
        let formatHour = new Date().subTime(0,1,0)
        let hour = new Date(formatHour).toISOString()
        return getEnergy(timestamp, hour)
    }
    daily(){
        let formatday = new Date().subTime(1,0,0) - (1000*60*60)
        let day = new Date(formatday).toISOString()
        return getEnergy(timestamp, day)
    }
}

async function getDeviceInfo(){
    let deviceInfo = await fetch('http://192.168.40.113/devicename');
    let response = await deviceInfo.json()
    let getDeviceInfo = response
    let name = getDeviceInfo.Agent.DeviceName
    createOptionsList(name)
}

// getDeviceInfo()

/// dateRangePicker Library to select a date range for Watt load////////
const dateRangePicker = document.querySelector('.btn__date-picker')
$(function() {
    $(dateRangePicker).daterangepicker({
        autoUpdateInput: false,
        showISOWeekNumbers: true,
        timePicker24Hour: true,
        timePickerSeconds: true,
        opens: 'left',
        locale: {
            cancelLabel: 'Clear'
        }
    });
    
    $(dateRangePicker).on('apply.daterangepicker', function(ev, picker) {
        
        let setStartDate = `${picker.startDate.format('YYYY-MM-DD')}` 
        let setEndDate = `${picker.endDate.format('YYYY-MM-DD')}`
        let chartType = 'barchart'
        let start = new Date(setStartDate)
        let end = new Date(setEndDate)
        
        getEnergy(end.toISOString(), start.toISOString(), chartType).then((watts)=> {
            let getLabels = []
            let getData = []
            watts.forEach((data) => {
                getLabels.push(data.time.split("T")[0])
                getData.push(data.sum)
            })
            let displayWatt = ((getData.reduce(reducer,0)/3600 * 10) / 1000).toFixed(3)
            let value = (displayWatt * .12).toFixed(2)
            
            counter.setAttribute('data-count', value)
            updateCount()
            document.querySelector(`[data-value=range]`).textContent = `${displayWatt}\r\nkWh`
            let lineData = getData.map(i=> {
               let resetData = (i / 3600 * 10 / 1000).toFixed(2)
               return Number(resetData)
            })
            barChart.data.labels = getLabels
            barChart.data.datasets[0].data = lineData
            barChart.update()
            myChart.data.datasets[0].data = [displayWatt, 100 - displayWatt]
	        myChart.update()
        })
    })
  });
//////////////////////////////////

const animationTime = '2000'; 
const rangeContainer = document.querySelector('.card__doughnut-range') 
const divElement = document.createElement('div')
const domString = '<div class="chart__value"><span class="range__kwh" data-value="range"></p></div>'; 

let ctx = document.querySelector('.chart__date-range').getContext('2d')
let myChart = new Chart(ctx, {
    type: 'doughnut', 
    data: {
        datasets: [
            {
                data: [], 
                backgroundColor: ['#73FAC9'],
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
rangeContainer.prepend(divElement.firstChild);

let ctx1 = document.querySelector('.chart__timeseries').getContext('2d')
let barChart = new Chart(ctx1, {
    type: 'horizontalBar', 
    data: {
        labels: [],
        datasets: [{
            label: '# kWh(kilo Watt hour)',
            barThickness: 'flex',
            maxBarThickness: 50,
            fill: false,
            backgroundColor: 'rgba(255,255,255,0.5)',
            borderColor: 'rgb(123, 145, 188)',
            borderWidth: 4,
            data: []
            }
        ]
    },
    options: {
        responsive:true,
        maintainAspectRation: false,
        scales: {
            yAxes: [{
                gridLines: {
                    display: false
                },
                ticks: {
                    fontSize:20
                },
                type: 'time',
                display: true,
                time: {
                    unit: 'day',
                    displayFormats: {
                        hour: 'HH:mm'
                    }
                },
                
            }],
            xAxes: [{
                gridLines: {
                    display: false
                },
                ticks: {
                    suggestedMin: 0,
                    suggestedMax: 1,
                    beginAtZero: true,
                    fontSize: 24
                }
                
            }],
        },
        legend: {
            labels: {
                fontSize: 24
            }
        },
        animation: {
            easing: "easeInOutBack"
          }
    }
});

const hourlyContainer = document.querySelector('.chart__figure1') 
const hourlyDiv = document.createElement('div')
const addStringHourly = '<span class="chart__value-hourly" data-value="hourly"></span>'; 
let ctx2 = document.querySelector('.chart__hourly').getContext('2d')
let chartHourly = new Chart(ctx2, {
    type: 'doughnut', 
    data: {
        datasets: [
            {
                data: [], 
                backgroundColor: ['#73FAC9'],
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


const currentContainer = document.querySelector('.chart__figure2') 
const currentDiv = document.createElement('div')
const addStringCurrent = '<span class="chart__value-current" data-value="current"></span>'; 
let ctx3 = document.querySelector('.chart__current').getContext('2d')
let chartCurrent = new Chart(ctx3, {
    type: 'doughnut', 
    data: {
        datasets: [
            {
                data: [], 
                backgroundColor: ['#73FAC9'],
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
                backgroundColor: ['#73FAC9'],
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



let gradientFill = ctx.createLinearGradient(500, 0, 100, 0);
// gradientFill.addColorStop(0, "rgba(128, 182, 244, 0.6)");
// gradientFill.addColorStop(1, "rgba(244, 144, 128, 0.6)");

gradientFill.addColorStop(1, 'rgba(2,0,36, 0.6)') 
gradientFill.addColorStop(0, 'rgba(188,68,104, 0.6)');

let ctx5 = document.querySelector('.chart__line-days').getContext('2d')
let lineChart = new Chart(ctx5, {
      
    type: 'bar', 
    data: {
        labels: [],
        datasets: [{
            label: '# kWh(kilo Watt hour)',
            barThickness: 'flex',
            maxBarThickness: 50,
            barPercentage: 0.2,
            barThickness: 25,
            minBarLength: 2,
            fill: false,
            backgroundColor: 'rgba(255,255,255,0.5)',
            borderColor: 'rgb(188, 68, 104)',
            borderWidth: 2,
            data: [],
            }
        ]
    },
    options: {
        
        responsive:true,
        maintainAspectRation: false,
        scales: {
            offset: true,
            yAxes: [{
                gridLines: {
                    display: true
                },
                ticks: {
                    suggestedMin: 0,
                    suggestedMax: 1,
                    fontSize:20
                },
                
                
            }],
            xAxes: [{
                gridLines: {
                    display: false
                },
                ticks: {
                    beginAtZero: true,
                    fontSize: 24
                },
                // type: 'time',
                // distribution: 'linear'
                // time: {
                //     unit: 'week',
                //     stepSize: 1
                // },
               
                
            }],
        },
        legend: {
            labels: {
                fontSize: 24
            }
        },
        animation: {
            easing: "easeInOutBack"
          },
    }
});

let start = 60000 - ((date.getMinutes() * 60 + date.getSeconds()) * 1000 + date.getMilliseconds());
setTimeout(function doSomething() {
    let hour = new Date(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), (date.getMinutes() - (date.getMinutes() % 60)) + 60, 0, 0)
    let diff = hour - date
    if(diff > 100) {
        window.setTimeout(doSomething, diff);
    }
    getPowerNumber('hourly')
   let d = new Date()
}, start);

// setTimeout(function getCurrent() {
//     setTimeout(getCurrent, 10000)
//     getPowerNumber('current')
// }, start)

let timeID = setTimeout(getPowerNumber,start,'daily')
setTimeout(()=>{
    clearTimeout(timeID)
}, 2000)

setTimeout(function getTime() {
    setTimeout(getTime,1000)
    navbarClock.textContent = clock.format(Date.now())
}, start)

getPowerNumber('range')
getPowerNumber('alldata')
console.log('shit')
let navbarClock = document.querySelector('.navbar__date')
let navbar = document.querySelector('.navbar')
let toggleMenuClass = document.querySelector('.hamburger')
let overlay = document.querySelector('.overlay')
let sidebarToggle = document.getElementById('sidebar')

toggleMenuClass.addEventListener('click', () => {
    if(navbar.classList.contains('open')) {
        navbar.classList.remove('open')
        overlay.classList.remove('fade-in')
        overlay.classList.add('fade-out')
        sidebarToggle.classList.add('fade-out')
    } else {
        navbar.classList.add('open')
        overlay.classList.remove('fade-out')
        sidebarToggle.classList.remove('fade-out')
        overlay.classList.add('fade-in')
        sidebarToggle.classList.add('fade-in')
        
        
    }
     
})

// var docWidth = document.documentElement.offsetHeight;

// [].forEach.call(
//   document.querySelectorAll('*'),
//   function(el) {
//     if (el.offsetHeight > docWidth) {
//       console.log(el);
//     }
//   }
// );