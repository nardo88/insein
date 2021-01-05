
const main = document.querySelector('.main');
const ListDefault = document.querySelector('.dropdown-lists__list--default');
const ListSelect = document.querySelector('.dropdown-lists__list--select');
const autocomplete = document.querySelector('.dropdown-lists__list--autocomplete');
const selectCities = document.getElementById('select-cities');
const closeButton = document.querySelector('.close-button');
const label = document.querySelector('.label');
const button = document.querySelector('.button');
const overlay = document.querySelector('.overlay');


// показатель на каком языке мы будем отображать информацию
let lang = 'RU';
// флаг включения/отключения кнопки
let link = false;

let data = [];

// включаем овердей
overlay.classList.add('overlay--active');
// если в куках есть lange
if(document.cookie.split('=')[0] === 'lang'){
    data = JSON.parse(localStorage.getItem('cities'));
    render(data);
    overlay.classList.remove('overlay--active');
// если в куках нет leng
} else {
    // запускаем цикл пока не получим корректное значение
    do {
        // модальное окно (prompt) для выбора языка
        lang = prompt('Enter your language for start application (RU, EN or DE)', 'EN');
    } while (!/^ru$|^en$|^de$/gi.test(lang));
    // на всякий случай переводим в верхни й регистр
    lang = lang.toUpperCase();
    // записываем значение в куки
    document.cookie = `lang=${lang}`
    // запрос на сервер
    fetch('db_cities.json')
    .then(response => response.json())
    .then(dataBase => {
        setTimeout(() => {
            // записываем базу в LocalStorage
            console.log(data);
            data = dataBase[lang];
            console.log(data);
            switch(lang){
                case 'EN':
                    data.unshift(data[2]);
                    data.splice(3,1)
                    break
                case 'DE':
                    data.unshift(data[1]);
                    data.splice(2,1)
                    break
            }
            localStorage.setItem('cities', JSON.stringify(data))
            // после получения данных мы отключаем оверлей и рендерим страницу
            render(data);
            overlay.classList.remove('overlay--active');

        }, 1000)
    })
}



// открытие блока default
const toggleOpenListDefault = () => {
    ListDefault.classList.add('open')
}

// открытие блока select
const toggleOpenListSelect = () => {
    ListSelect.classList.add('open')
}

// функция рендера select
const renderSelect = (index) => {
    ListSelect.children[0].innerHTML = '';
    // диструктуризация, получаем значения объекта
    const {cities, count, country} =  data[index];

    const countryBlock = document.createElement('div');
    countryBlock.classList.add('dropdown-lists__countryBlock');
    countryBlock.innerHTML = `
        <div class="dropdown-lists__total-line">
            <div class="dropdown-lists__country">${country}</div>
            <div class="dropdown-lists__count">${count}</div>
        </div>
    `;

    cities.forEach(item => {
        const dropdownListsLine = document.createElement('div');
        dropdownListsLine.classList.add('dropdown-lists__line');
        dropdownListsLine.innerHTML = `
                <div data-link="${item.link}" class="dropdown-lists__city">${item.name}</div>
                <div class="dropdown-lists__count">${item.count}</div>
        `
        countryBlock.insertAdjacentElement('beforeend', dropdownListsLine)
    })

    ListSelect.children[0].insertAdjacentElement('beforeend', countryBlock)
}

// функция рендера autocomplete
const renderAutocomplete = (text) => {
    if (text){
        closeButton.classList.add('open--btn')
        autocomplete.children[0].innerHTML = '';
        const arr = []
        const regExp = new RegExp('^' + text + '', 'i')

        data.forEach(item => {
           item.cities.forEach(elem => {
               if (regExp.test(elem.name)){
                 
                arr.push(elem)
               }
           })
        })
        const dropdownListsCountryBlock = document.createElement('div');
        dropdownListsCountryBlock.classList.add('dropdown-lists__countryBlock');
        if (arr.length){
            arr.forEach(item => {
                let newStr = item.name.replace(regExp, match => `<b>${match}</b>`)
                const child = `
                <div class="dropdown-lists__line">
                    <div data-link="${item.link}" class="dropdown-lists__city">${newStr}</div>
                    <div class="dropdown-lists__count">${item.count}</div>
                </div>
                `
                dropdownListsCountryBlock.insertAdjacentHTML('afterbegin', child)
            })
        } else {
            dropdownListsCountryBlock.textContent = 'Ничего не найдено'
        }

        autocomplete.children[0].insertAdjacentElement('afterbegin', dropdownListsCountryBlock)

    }
    
}

// запись в инпут значения
const showInputValue = value => {
    label.classList.add('label--top')
    selectCities.value = value
    closeButton.classList.add('open--btn')
} 


// сброс в дефолтное состояние
const showDefault = () => {
    ListDefault.style.left = '0%'
    ListSelect.style.right = '100%'
    ListDefault.classList.add('open');
    ListSelect.classList.add('open');
    autocomplete.classList.remove('open');
}

// включение кнопки
const setLink = value => {
    link = true;
    button.href = value
}

// слешатель на клик
main.addEventListener('click', e => {
    const target = e.target;
    if (target.matches('#select-cities')){
        showDefault();
    };

    // клик по названию страны
    if (target.closest('.dropdown-lists__total-line')){
        let index = target.closest('.dropdown-lists__total-line').dataset.index;
        if(index){
            renderSelect(index)
            ListDefault.style.left = '100%'
            ListSelect.style.right = '0%'
        } else {
            ListDefault.style.left = '0%'
            ListSelect.style.right = '100%'

        }
        showInputValue(target.closest('.dropdown-lists__total-line').children[0].textContent)

        toggleOpenListDefault()
        toggleOpenListSelect()
        
    }

    // клик по городу в селекте
    if (target.matches('.dropdown-lists__city--ip')){
        showInputValue(target.textContent)
        setLink(target.dataset.link);
    }

    // клик по городу в autocomplete
    if (target.matches('.dropdown-lists__city')){
        showInputValue(target.textContent)
        setLink(target.dataset.link);
    }


    // нажатие на крестик
    if (target === closeButton){
        label.classList.remove('label--top')
        selectCities.value = ''
        closeButton.classList.remove('open--btn')
        showDefault();
        link = false;
    }
})

// ввод значения в input
selectCities.addEventListener('input', () => {
    if(!selectCities.value){
        ListDefault.classList.add('open')
        autocomplete.classList.remove('open')
        closeButton.classList.remove('open--btn')
        link = false
    } else {
        ListDefault.classList.remove('open')
        renderAutocomplete(selectCities.value)
        autocomplete.classList.add('open')

    }
})

// функция для сортировки массива по полю объекта
function byField(field) {
    return (a, b) => Number(a[field]) > Number(b[field]) ? 1 : -1;
}


// рендер страницы
function render (data) {
    data.forEach((item, i )=> {
        // создаем блок total-line который будет содержать название страны
        const countryBlock = document.createElement('div');
        countryBlock.classList.add('dropdown-lists__countryBlock');
        countryBlock.innerHTML = `
            <div data-index="${i}" class="dropdown-lists__total-line">
                <div class="dropdown-lists__country">${item.country}</div>
                <div class="dropdown-lists__count">${item.count}</div>
            </div>
        `;
        // теперь нужно получить топ 3 городов, получать будем
        // по количеству жителей, т.е. нужно отсортировать города
        item.cities = [...item.cities.sort(byField('count')).reverse()]
        // теперь заполняем dropdown-lists__line
        for (let i = 0; i < 3; i++){
            const listsLine = document.createElement('div')
            listsLine.classList.add('dropdown-lists__line');
            listsLine.innerHTML = `
                <div data-link="${item.cities[i].link}" class="dropdown-lists__city dropdown-lists__city--ip">${item.cities[i].name}</div>
                <div class="dropdown-lists__count">${item.cities[i].count}</div>
            `
            countryBlock.insertAdjacentElement('beforeend', listsLine)
        }
        ListDefault.children[0].insertAdjacentElement('beforeend', countryBlock)
        
    })
}

// нажатие на кнопку для ВИКИ
button.addEventListener('click', e => {
    if (!link){
        e.preventDefault()
    }
})


