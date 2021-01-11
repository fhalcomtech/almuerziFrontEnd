//Variables Gobales
let btnSave = null;
let listUlOrders = null, listUlMeals = null;
let currentMeal = null, mealsState;
let currentUser = null;
let route =  'login';

const switchLoader = (activate) =>
{
    const loaderElement = document.querySelector(".loader");
    if(activate) loaderElement.classList.remove('hide');
    else loaderElement.classList.add('hide');
}

const getMealById =  (id) =>
{
    let name;
    const msg = document.querySelector("#meals>.message");
    msg.classList.remove("hide")
    
    const element = listUlMeals
    element.classList.add("hide");

    element.innerHTML = "";
     fetch(`https://almuerzi.fhalcomtech.vercel.app/api/meals/${id}`,
        {
            method: "GET",
            mode:"cors",
            cache:"no-cache",
            credentials: 'same-origin',
            headers:{
                'Content-type':'application/json'
                ,'authorization':localStorage.getItem('token')
            }
        })
        .then(data=>data.json())
        .then(json => name = json.name);
        return name;
}


const loadMeals = (fnRender)=>
{
    switchLoader(true);
    const msg = document.querySelector("#meals>.message");
    msg.classList.remove("hide")
    
    const element = listUlMeals
    element.classList.add("hide");

    element.innerHTML = "";
    fetch("https://almuerzi.fhalcomtech.vercel.app/api/meals",
        {
            method: "GET",
            mode:"cors",
            cache:"no-cache",
            credentials: 'same-origin',
            headers:{
                'Content-type':'application/json'
                ,'authorization':localStorage.getItem('token')
            }
        })
        .then(data=>data.json())
        .then(json=>{
            fnRender(json);
            loadOrders(renderOrders);
            switchLoader(false);
        });
}


const loadOrders = (fnRender) =>
{
    const msg = document.querySelector("#orders>.message");
    msg.classList.remove("hide")
    const element = listUlOrders;
    element.classList.add("hide");
    fetch("https://almuerzi.fhalcomtech.vercel.app/api/orders",
        {
            method: "GET",
            mode:"cors",
            cache:"no-cache",
            credentials: 'same-origin',
            headers:{
                'Content-type':'application/json'
                ,'authorization':localStorage.getItem('token')
            }
        })
        .then(data=>data.json())
        .then(json=>fnRender(json));
}


const parseHtml = x => 
{
    const str = `<li class="meal" id = "${x._id}">${x.name}</li>`;
    const parser = new DOMParser();
    return parser.parseFromString(str, 'text/html').body.firstChild;
}

const parseHtmlOrder = x => 
{
 
    const str = `<li class="row" id="${x._id}"><span class="column">${document.getElementById(x.meal_id).textContent}</span><span class="column">${currentUser.email}</span></li>`;
    const parser = new DOMParser();
    return parser.parseFromString(str, 'text/html').body.firstChild;
}


const renderOrders = (json) =>
{
    const msg = document.querySelector("#orders>.message");
    const element = listUlOrders;
    const orders = json.map(parseHtmlOrder);
    orders.forEach(e => element.appendChild(e));
    msg.classList.add("hide")
    element.classList.remove("hide")
}


const renderMeals = (json) =>
{
    const msg = document.querySelector("#meals>.message");
    const element = listUlMeals;
    const meals = json.map(parseHtml);
    meals.forEach(e => element.appendChild(e));
    msg.classList.add("hide")
    element.classList.remove("hide")
    btnSave.removeAttribute('disabled');
}

const selectMeal = e =>
{
    const element = e.target;
    const tagName =  element.tagName.toUpperCase();
    if(tagName==='LI')
    {   
        currentMeal = element.id;   
        const currentSelected = element.parentElement.querySelector('li.selected');
        if(currentSelected)currentSelected.classList.remove('selected');
        element.classList.add('selected');
    }
    console.log(currentMeal);
}


const saveOrden = () =>
{
    btnSave.disabled = true;
    btnSave.classList.add('disabled');
    switchLoader(true);
    const mealId = currentMeal;
    const userId = currentUser._id;
    if(mealId && userId)
    {
        const orden = {
            meal_id: mealId,
            user_id: userId,
        };

        fetch("https://almuerzi.fhalcomtech.vercel.app/api/orders",
        {
            method: "POST",
            mode:"cors",
            cache:"no-cache",
            credentials: 'same-origin',
            headers:{'Content-Type':'application/json','authorization':localStorage.getItem('token')},
            body: JSON.stringify(orden)
        })
        .then(data=>data.json()).then(odJson=>{
            const element = listUlOrders;
            const orderHtml = parseHtmlOrder(odJson);
            element.appendChild(orderHtml);
            btnSave.removeAttribute('disabled');
            btnSave.classList.remove('disabled');
            switchLoader(false);
        });
    }
    else
    {
        alert('Select a meal please');
        btnSave.removeAttribute('disabled');
        btnSave.classList.remove('disabled');
        switchLoader(false);
    }
};

const inicializeDomVars = () =>
{
    loginForm = document.getElementById("login_form_id");
    loginForm.addEventListener('submit',loginFromForm);
}


const loginUser = (email,password) =>
{
    fetch("https://almuerzi.fhalcomtech.vercel.app/api/auth/login",{
        method: 'POST',
        mode:"cors",
        cache:"no-cache",
        credentials: 'same-origin',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({email: email, password: password})
    })
    .then(data => data.json())
    .then(json => {
        if(json){
            if(json)
            {
                localStorage.setItem("token", json.token);
                route = "orders"
                return json.token;
            }
            return null;
        }
    })
    .then(token=>{
        fetch("https://almuerzi.fhalcomtech.vercel.app/api/auth/me",{
            method: 'GET',
            mode:"cors",
            cache:"no-cache",
            credentials: 'same-origin',
            headers:{
                'Content-Type':'application/json',
                authorization: token
            }
        }).then(resp=>resp.json())
        .then(user=>{
            currentUser = user;
            localStorage.setItem('user',JSON.stringify(user));
            renderApp();
        })
        
    });
};


const renderApp = () =>
{
    const token = localStorage.getItem('token');
    if(token)
    {
        
        const orders_view = document.getElementById("order-view");
        const home_login = document.getElementById("home-login");

        const home_login_clone = document.importNode(home_login, true);
        const orders_view_children = document.importNode(orders_view.content, true);

        const login_template = document.createElement("template");
        login_template.appendChild(home_login_clone);

        document.body.innerHTML= "";
        document.body.appendChild(login_template);
        document.body.appendChild(orders_view_children);
        loadInitialData();
        
    }
}

const loginFromForm = (e) =>
{
    e.preventDefault();
    const userel = document.getElementById("user_id");
    const pwdel = document.getElementById("user_pwd");
    if(userel && pwdel)
    {
        const user = userel.value;
        const pwd = pwdel.value;
        if(user && pwd)
        {
            loginUser(user, pwd);
        }
        else
        {alert('User and/or Password can not be empty');}
    } else alert('User and/or Password can not be empty');
}

const loadInitialData = ()=>
{
    listUlMeals = document.getElementById('meals-list');
    listUlOrders = document.getElementById('orders-list');
    btnSave = document.querySelector(".btn-meal");

    listUlMeals.addEventListener('click', e => {selectMeal(e);});
    btnSave.addEventListener('click', e => {e.preventDefault(); saveOrden();})
    loadMeals(renderMeals);
}

const registerUser = (user,password) =>
{
    fetch("https://almuerzi.fhalcomtech.vercel.app/api/auth/register",{
        method: 'POST',
        mode:"cors",
        cache:"no-cache",
        credentials: 'same-origin',
        headers:{'Content-type':'application/json'},
        body:JSON.stringify({email: user, password: password})
    });
};




document.addEventListener('DOMContentLoaded',(e)=>
{
    //registerUser('fhalcom.tech@gmail.com','fhalcom');
    
  inicializeDomVars();
    /*
    loadInitialData();
    */
});