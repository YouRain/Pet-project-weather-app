//API
let linkAPICurrent = "https://api.openweathermap.org/data/2.5/weather?units=metric&lang=en&appid=c2e9c11481f250175b9670459e567816&q=";
let linkAPIForecast = "https://api.openweathermap.org/data/2.5/forecast?units=metric&lang=en&appid=c2e9c11481f250175b9670459e567816&q=";
let linkIP = "https://api.ipify.org";
let linkAPIGeolocationIP = "https://ipwho.is/";

let inputText = document.forms[0].inputText;
let btnSearch = document.forms[0].btnsearch;
let btnHome = document.forms[0].btnhome;
let listCity = document.querySelector(".list-city");
let currentWeather = document.querySelector(".current-weather");
let forecast = document.querySelector(".forecast__weater");
let btnToday = document.querySelector("#today");
let btnWeekDay = document.querySelector("#week");
let map = document.querySelector(".map");

let arrayWeekDayFull = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
let arrayWeekDay = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
let arrayMonth = ["January", "Febriary", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
let clearIntervalClock;

class MainClass {
    constructor() {
        this.city = "";
        this.clouds = {
            all: 0,
        };
        this.main = {
            feelsLike: 0,
            humidity: 0,
            pressure: 0,
            temp: 0,
            tempMax: 0,
            tempMin: 0,
        };
        this.sys = {
            country: "RU",
            sunrise: 0,
            sunset: 0,
        };
        this.timezone = 0,
            this.visibility = 0,
            this.weather = {
                main: "Sunny",
                description: "Sunny",
            };
        this.wind = {
            speed: 0,
        };
        this.populationValue = 0;
        this.list = [];
    }
    //Поиск и установка города
    validation() {
        this.value = this.value.replace(/[^A-z \s-]/g, "");
    };
    handleSetCity() {
        let object = this;
        return function(event) {
            event.preventDefault();
            if (!inputText.value) return;
            object.city = object.modifCity(inputText.value);
            inputText.value = "";
            fetchData(object.city);
        }
    }
    modifCity(str) {
        if (str.includes("-")) {
            let city = str.split("-");
            let newStr = city.map((prop) => {
                return prop.slice(0, 1).toUpperCase() + prop.slice(1);
            });
            return newStr.join("-");
        }
        let city = str.split(" ");
        let newStr = city.map((prop) => {
            return prop.slice(0, 1).toUpperCase() + prop.slice(1);
        });
        return newStr.join(" ");
    }
    //Возврат к домашнему городу
    handleSetCityHome(event) {
        event.preventDefault();
        inputText.value = "";
        fetchData();
    }
    //Лист городов 
    findCity(event) {
        if (event.target.value == "") {
            listCity.classList.add("hidden");
            return;
        }
        let cityName = listCityName.filter((item) => item.toLowerCase().startsWith(event.target.value.toLowerCase()));
        if (cityName.length == 0) {
            listCity.classList.add("hidden");
            return;
        }
        listCity.classList.remove("hidden");
        listCity.innerHTML = renderListCity(cityName);
        function renderListCity(arr) {
            return arr.map((item) => {
                return `<span>${item}</span>`
            }).join("");
        }
    }
    setCityName() {
        let object = this;
        return function(event) {
            if (event.target.tagName !== "SPAN") {
                event.target.classList.toggle("hidden");
                return;
            }
            inputText.value = event.target.textContent;
            listCity.classList.toggle("hidden");
            object.city = object.modifCity(inputText.value);
            inputText.value = "";
            fetchData(object.city);
        }
    }
    //Текущяя погода (правая сторона)
    markupCurrentWeather() {
        return `<h1 class="city__name">${this.city} <sup> ${this.sys.country}</sup></h1>
                    <div class="img__description">
                        <img src="./image/main_weather/${this.selectWeatherImg(this.weather.main)}" alt="#">
                    </div>
                    <h1 class="temperature__title">${Math.round(this.main.temp * 10) / 10}&#176C</h1>
                    <h2 class="description__title">${this.modifCity(this.weather.description)}</h2>
                    <h2 class="population">Population: <span class="population-value">${this.populationValue}</span></h2>`
    }
    renderCurrentWeather() {
        currentWeather.innerHTML = this.markupCurrentWeather();
    }
    selectWeatherImg(description) {
        let value = description.toLowerCase();
        switch (value) {
            case "clear":
                return "sunny.png";
            case "clouds":
                return "clouds.png";
            case "rain":
                return "rain.png";
            case "thunderstorm":
                return "thunder.png";
            case "snow":
                return "snow.png";
            default:
                return "sunny.png";
        }
    }
    //Дата и время
    markupCurrentProperties() {
        let humidity = document.querySelector("#humidity-value");
        let visibility = document.querySelector("#visibility-value");
        let windSpeed = document.querySelector("#windspeed-value");
        let pressure = document.querySelector("#pressure-value");
        let clouds = document.querySelector("#clouds-value");
        let sun = document.querySelector("#sun-value");
        humidity.innerHTML = this.main.humidity + "%";
        visibility.innerHTML = Math.round(this.visibility / 1000) + " km";
        windSpeed.innerHTML = Math.round(this.wind.speed * 10) / 10 + " m/s";
        pressure.innerHTML = Math.round(this.main.pressure * 0.75) + " mm Hg";
        clouds.innerHTML = this.clouds.all + "%";
        let date = new Date();
        let sunrise = ("0" + new Date((this.sys.sunrise + this.timezone + date.getTimezoneOffset() * 60) * 1000).getHours()).slice(-2) + ":" + ("0" + new Date((this.sys.sunrise + this.timezone + date.getTimezoneOffset() * 60) * 1000).getMinutes()).slice(-2);
        let sunset = ("0" + new Date((this.sys.sunset + this.timezone + date.getTimezoneOffset() * 60) * 1000).getHours()).slice(-2) + ":" + ("0" + new Date((this.sys.sunset + this.timezone + date.getTimezoneOffset() * 60) * 1000).getMinutes()).slice(-2);
        sun.innerHTML = sunrise + "  <span>&</span>  " + sunset;
    }
    getDateCity(utc) {
        let date = new Date();
        let newDate = new Date(date.getTime() + (utc + date.getTimezoneOffset() / 60) * 3600 * 1000);
        let hour = document.getElementById("hour");
        let min = document.getElementById("min");
        let weekDay = document.getElementById("weekday");
        let numberDay = document.getElementById("numberday");
        let month = document.getElementById("month");
        let year = document.getElementById("year");
        hour.innerHTML = ("0" + newDate.getHours()).slice(-2);
        min.innerHTML = ("0" + newDate.getMinutes()).slice(-2);
        weekDay.innerHTML = arrayWeekDayFull[newDate.getDay()];
        numberDay.innerHTML = newDate.getDate();
        month.innerHTML = arrayMonth[newDate.getMonth()];
        year.innerHTML = newDate.getFullYear();
    }
    startClock(utc) {
        this.getDateCity(utc);
        clearIntervalClock = setInterval(() => this.getDateCity(utc), 1000);
    }
    //Формирование погоды на день
    renderWeatherToday() {
        let { list } = store;
        let array = [];
        for (let index = 0; array.length < 4; index++) {
            let date = new Date(list[index].dt_txt).getHours();
            if (date == 0 || date == 6 || date == 12 || date == 18) {
                array.push({
                    date,
                    temperature: list[index].main.temp,
                    main: list[index].weather[0].main,
                })
            }
        }
        return array.map((item) => {
            return `<div class="weather__item">
                            <div class="weater__title">
                                <h1>${this.selectPartToday(item.date)}</h1>
                            </div>
                            <div class="weater__img">
                                <img src="./image/main_weather/${this.selectWeatherImg(item.main)}">
                            </div>
                            <div class="weater__temperature">
                                <h1>${Math.round(item.temperature)}&#176C</h1>
                            </div>
                        </div>`
        }).join("");
    }
    selectPartToday(hour) {
        switch (hour) {
            case 0:
                return "Night";
            case 6:
                return "Morning";
            case 12:
                return "Noon";
            case 18:
                return "Evening";
            default:
                return "Today";
        }
    }
    addWeatherToday() {
        let object = this;
        return function wrapper() {
            forecast.innerHTML = object.renderWeatherToday();
            btnToday.classList.add("toggle");
            btnWeekDay.classList.remove("toggle");
        }
    }
    //Формирование погоды на неделю
    renderWeatherWeekDay(arr) {
        let { list } = store;
        let array = [];
        for (let index = 0; array.length < 5; index++) {
            let date = new Date(list[index].dt_txt);
            let hour = date.getHours()
            if (hour == 12) {
                array.push({
                    date,
                    temperature: list[index].main.temp,
                    main: list[index].weather[0].main,
                })
            }
        }
        return array.map((item) => {
            return `<div class="weather__item">
                            <div class="weater__title">
                                <h1>${arrayWeekDay[item.date.getDay()]}</h1>
                            </div>
                            <div class="weater__img">
                                <img src="./image/main_weather/${this.selectWeatherImg(item.main)}">
                            </div>
                            <div class="weater__temperature">
                                <h1>${Math.round(item.temperature)}&#176C</h1>
                            </div>
                        </div>`
        }).join("");
    }
    addWeatherWeekDay() {
        let object = this;
        let index = (new Date()).getDay();
        let newArr = arrayWeekDay.slice(index);
        for (let i = 0; i < index; i++) {
            newArr.push(arrayWeekDay[i]);
        }
        return function () {
            forecast.innerHTML = object.renderWeatherWeekDay(newArr);
            btnToday.classList.remove("toggle");
            btnWeekDay.classList.add("toggle");
        }
    }
    //Скрывать блок списка городов при потере фокуса
    sightListCity(event) {
        if (!event.target.hasAttribute("unique-attr") && event.target.tagName !== "INPUT") {
            listCity.classList.add("hidden");
        }
        if (event.target.tagName == "INPUT" && event.target.value !== "") {
            listCity.classList.remove("hidden");
        }
    }
    //Карта Yandex
    initMap() {
        MainClass.prototype.reenderMap();
        let myMap = new ymaps.Map("basicMap", {
            center: [store.coord.lat, store.coord.lon],
            zoom: 10,
        });
    }
    //Функция пересоздаёт контейнер для карты, иначе не обновляет карту при смене города
    reenderMap() {
        map.innerHTML = `<div id="basicMap"></div>`
    }
}
let store = new MainClass();

btnSearch.addEventListener("click", store.handleSetCity());
inputText.addEventListener("input", store.validation);
btnHome.addEventListener("click", store.handleSetCityHome)
inputText.addEventListener("input", store.findCity);
listCity.addEventListener("click", store.setCityName());
btnToday.addEventListener("click", store.addWeatherToday());
btnWeekDay.addEventListener("click", store.addWeatherWeekDay());
document.body.addEventListener("click", store.sightListCity);

let fetchData = async function (city) {
    try {
        let resultIP,
            resultGeo;
        if (!city) {
            try {
                resultIP = await fetch(linkIP);
            } catch {
                throw new TypeError('Error in IP API!');
            }
            let dataIP = await resultIP.text();
            try {
                resultGeo = await fetch(linkAPIGeolocationIP + dataIP);
            } catch {
                throw new TypeError('Error in Geolocation API!');
            }
            let dataGeo = await resultGeo.json();
            city = dataGeo.city;
        }
        let resultCurrent,
            resultForecast;
        try {
            resultCurrent = await fetch(linkAPICurrent + city);
        } catch {
            throw new TypeError('Error in Current API!');
        }
        try {
            resultForecast = await fetch(linkAPIForecast + city);
        } catch {
            throw new TypeError('Error in Forecast API!');
        }
        let dataCurrent = await resultCurrent.json();
        let dataForecast = await resultForecast.json();

        if (dataCurrent.cod == "404") {
            throw new Error(dataCurrent.message);
        }
        //Деструктуризация
        let {
            clouds: { all },
            coord: { lat, lon },
            main: { feels_like: feelsLike, humidity, pressure, temp, temp_max: tempMax, temp_min: tempMin },
            sys: { country, sunrise, sunset },
            timezone,
            visibility,
            weather,
            wind: { speed },
        } = dataCurrent;

        let { city: { population: populationValue }, list } = dataForecast;

        if (populationValue == 1000000) {
            populationValue = "Heaven knows";
        }

        store = {
            ...store,

            city,
            clouds: {
                all,
            },
            coord: {
                lat,
                lon,
            },
            main: {
                feelsLike,
                humidity,
                pressure,
                temp,
                tempMax,
                tempMin,
            },
            sys: {
                country,
                sunrise,
                sunset,
            },
            timezone,
            visibility,
            weather: {
                main: weather[0].main,
                description: weather[0].description,
            },
            wind: {
                speed,
            },
            populationValue,
            list,
        }

        Object.setPrototypeOf(store, MainClass.prototype)
        store.renderCurrentWeather();
        store.markupCurrentProperties();
        clearInterval(clearIntervalClock);
        store.startClock(timezone / 3600);
        store.addWeatherToday()();
        ymaps.ready(store.initMap);
    } catch (error) {
        console.log(error.name + ': ' + error.message);
        inputText.classList.toggle("placeholder");
        inputText.placeholder = error.message.split(" ")
            .map( item => {
                return item.slice(0,1).toUpperCase() + item.slice(1);
            })
            .join(" ");
        setTimeout(() => {
            inputText.classList.toggle("placeholder");
            inputText.placeholder = "Any City";
        }, 1000);
    }
}
fetchData();