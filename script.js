let chart, map;

function getClass(v){
  if(v<40) return "good";
  if(v<70) return "moderate";
  return "poor";
}

function initMap(){
  map = L.map('map').setView([20,78],4);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
}

async function fetchCities(){
  let cities = ["delhi","mumbai","chennai","bangalore","hyderabad"];

  cities.forEach(c=>{
    city1.innerHTML += `<option>${c}</option>`;
    city2.innerHTML += `<option>${c}</option>`;
  });

  initMap();
}

async function loadLive(city, prefix){
  let res = await fetch(`/live-data?city=${city}`);
  let d = await res.json();

  document.getElementById(`no2_${prefix}`).innerHTML =
    `<span class="${getClass(d.no2)}">${d.no2}</span>`;

  document.getElementById(`o3_${prefix}`).innerHTML =
    `<span class="${getClass(d.o3)}">${d.o3}</span>`;

  document.getElementById(`temp_${prefix}`).innerText = d.temp + "°C";
  document.getElementById(`wind_${prefix}`).innerText = d.wind + " m/s";

  return d;
}

async function loadData(){
  let c1 = city1.value;
  let c2 = city2.value;

  city1Name.innerText = c1;
  city2Name.innerText = c2;

  let d1 = await loadLive(c1, "1");
  let d2 = await loadLive(c2, "2");

  drawChart(d1,d2);
  updateStatus(d1);
  insightAI(c1,c2);
}

function drawChart(d1,d2){
  if(chart) chart.destroy();

  chart = new Chart(document.getElementById("chart"), {
    type:"line",
    data:{
      labels:["Now","Forecast"],
      datasets:[
        {label:"City1", data:[d1.no2,d1.no2*1.05], borderColor:"blue"},
        {label:"City2", data:[d2.no2,d2.no2*1.05], borderColor:"red"}
      ]
    }
  });
}

function updateStatus(d){
  let avg = (d.no2 + d.o3)/2;
  let status = "Good";

  if(avg > 50) status = "Moderate";
  if(avg > 70) status = "Poor";

  document.getElementById("status").innerText = status;
}

async function insightAI(c1,c2){
  document.getElementById("insight").innerText = "🤖 Generating...";

  let res = await fetch(`/ai-insight?c1=${c1}&c2=${c2}`);
  let data = await res.json();

  document.getElementById("insight").innerText = data.insight;
}

fetchCities();