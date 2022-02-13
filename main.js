let statusChart = null
let responseTimeChart = null
let i = 0

const lang = {
    ru: {
        statusCodes: "Коды состояния",
        responseTime: "Время ответа (мс)",
        time: "Время",
        name: "Русский"
    },
    en: {
        statusCodes: "Status Codes",
        responseTime: "Response Time (ms)",
        time: "Time",
        name: "English"
    }
}

let currentLang = 'en'

function changeLanguage(){
    if(currentLang === 'ru')
        currentLang = 'en'
    else
        currentLang = 'ru'
    Cookies.set('lang', currentLang)
    document.getElementById('language').textContent = lang[currentLang].name
}

async function check() {
    statusChart?.destroy()
    responseTimeChart?.destroy()
    let requests_count = parseInt(document.getElementById('requestsCount').value)
    let url = document.getElementById('url').value
    let completed_requests = 0
    let colors = []
    let requestsCodes = {}
    let requestsTimes = {}

    for (let i = 0; i < requests_count; i++) {
        let now = Date.now()
        const result = await fetch(url).then(a => {
            if (requestsCodes[a.status] === undefined)
                requestsCodes[a.status.toString()] = 1
            else
                requestsCodes[a.status.toString()] += 1
            requestsTimes[i] = Date.now() - now
            completed_requests++
        }).catch(a => console.error(a))
    }

    i = setInterval(() => {
        if(completed_requests !== requests_count)
            return
        console.log(requestsTimes)
        const ctx = document.getElementById('statusChart').getContext('2d');
        const ctx2 = document.getElementById('responseTimeChart').getContext('2d');
        let count = []
        for (const a of Object.keys(requestsCodes)) {
            colors.push(statusCodeColor(parseInt(a)))
        }
        for (let time of Object.keys(requestsTimes)) {
            count.push(time.toString())
        }

        statusChart = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: Object.keys(requestsCodes),
                datasets: [{
                    data: Object.values(requestsCodes),
                    backgroundColor: colors
                }]
            },
            options: {
                responsive: true,
                aspectRatio: 5,
                plugins: {
                    legend: {
                        position: 'top',
                    },
                    title: {
                        display: true,
                        text: lang[currentLang].statusCodes
                    }
                }
            },
        });

        responseTimeChart = new Chart(ctx2, {
            type: 'line',
            data: {
                labels: count,
                datasets: [{
                    label: lang[currentLang].time,
                    data: requestsTimes,
                    borderColor: '#6381c7',
                    backgroundColor: '#6381c7',
                }]
            },
            options: {
                responsive: true,
                aspectRatio: 5,
                plugins: {
                    legend: {
                        position: 'top',
                    },
                    title: {
                        display: true,
                        text: lang[currentLang].responseTime
                    }
                }
            },
        });
        clearInterval(i)
    }, 10)
}

function statusCodeColor(code){
    if(code >= 100 && code < 200)
        return '#1a9ce8'
    if(code >= 200 && code < 300)
        return '#24e81a'
    if(code >= 300 && code < 400)
        return '#1a7ae8'
    if(code >= 400 && code < 500)
        return '#e81a92'
    if(code >= 500 && code <= 599)
        return '#e8359d'
    return '#9c517b'
}

window.onload = () => {
    currentLang = Cookies.get('lang') == null ? 'ru' : Cookies.get('lang')
    document.getElementById('language').textContent = lang[currentLang].name
}