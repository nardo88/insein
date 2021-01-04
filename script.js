import data from './db_cities.js';

const main = document.querySelector('.main');
const ListDefault = document.querySelector('.dropdown-lists__list--default');
const ListSelect = document.querySelector('.dropdown-lists__list--select');
const autocomplete = document.querySelector('.dropdown-lists__list--autocomplete');
const selectCities = document.getElementById('select-cities');
const closeButton = document.querySelector('.close-button');
const label = document.querySelector('.label');
const button = document.querySelector('.button');
const overlay = document.querySelector('.overlay');


overlay.classList.add('overlay--active');

fetch('db_cities.json')
    .then(response => response.json())
    .then(data => {
        setTimeout(() => {
            render(data);
            overlay.classList.remove('overlay--active');
        }, 1000)
    })

// показатель на каком языке мы будем отображать информацию
let lang = 'RU';
let link = false;

// открытие закрытие блока default
const toggleOpenListDefault = () => {
    ListDefault.classList.add('open')
}

// открытие закрытие блока select
const toggleOpenListSelect = () => {
    ListSelect.classList.add('open')
}

// функция рендера select
const renderSelect = (index) => {
    ListSelect.children[0].innerHTML = '';
    // диструктуризация, получаем значения объекта
    const {cities, count, country} =  data[lang][index];

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
        autocomplete.children[0].innerHTML = '';
        const arr = []
        const regExp = new RegExp('^' + text + '', 'i')

        data[lang].forEach(item => {
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

const showInputValue = value => {
    label.classList.add('label--top')
    selectCities.value = value
    closeButton.classList.add('open--btn')
} 

const showDefault = () => {
    ListDefault.style.left = '0%'
    ListSelect.style.right = '100%'
    ListDefault.classList.add('open');
    ListSelect.classList.add('open');
    autocomplete.classList.remove('open');
}

const setLink = value => {
    link = true;
    button.href = value
}


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


    if (target.matches('.dropdown-lists__city--ip')){
        showInputValue(target.textContent)
        setLink(target.dataset.link);
    }
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

selectCities.addEventListener('input', () => {
    if(!selectCities.value){
        ListDefault.classList.add('open')
        autocomplete.classList.remove('open')
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

const render = (data) => {
    data[lang].forEach((item, i )=> {
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

button.addEventListener('click', e => {
    if (!link){
        e.preventDefault()
    }
})

// render()

