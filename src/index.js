const quotesList = document.getElementById("quote-list")
const form = document.getElementById("new-quote-form")
const editForm = document.getElementById("editing-form")
editForm.style.display = "None"
let Quotes = []


const sortButton = document.getElementById("sort-btn")
let isSortActivated = false

sortButton.addEventListener("click", (e) => {
    isSortActivated = !isSortActivated
    e.target.textContent = isSortActivated ? "SORT: ON" : "SORT: OFF"
    handleSorting(isSortActivated)
})

function handleSorting(isSortActivated) {
    const status = isSortActivated
    if (status === false){
        makeQuotes(Quotes)
    }else{

        const sorted = Quotes.toSorted( (a, b) => a.author.trim().localeCompare(b.author.trim()))  
        makeQuotes(sorted)
    }
}

form.addEventListener("submit", (e) => {
    e.preventDefault()
    const newObj = {
        quote: e.target.elements["new-quote"].value,
        author: e.target.author.value,
    }

    handlePost(newObj)
})


fetch("http://localhost:3000/quotes?_embed=likes")
.then(r => r.json())
.then(data => {
    Quotes = data
    makeQuotes(Quotes)
})
.catch(err => console.error(err))

function makeQuotes (quotes) {
    quotesList.innerHTML = ''
    quotes.forEach(quote => {
            renderQuote(quote)
    });
}

function renderQuote(quote) {
    const li = document.createElement("li")
    li.className = "quote-card"
    li.id = quote.id
    li.innerHTML = `
        <blockquote class="blockquote">
            <p class="mb-0">${quote.quote}</p>
            <footer class="blockquote-footer">${quote.author}</footer>
            <br>
        </blockquote>    
    `;

    // const blockquote = li.querySelector("blockquote")
    
    let likes;
    if (quote.likes == null) {
        likes = 0
    }else{
        likes = quote.likes.length
    }

    const btnSuccess = document.createElement("button")
    btnSuccess.className = "btn-success"
    btnSuccess.innerHTML = `
        Likes: <span>${likes}</span>
    `
    li.append(btnSuccess)

    const btnDanger = document.createElement("button")
    btnDanger.className = "btn-danger"
    btnDanger.textContent = "Delete"

    li.append(btnDanger)

    const editButton = document.createElement("button")
    editButton.className = "btn-edit"
    editButton.textContent = "Edit Quote?"

    li.append(editButton)
    
    quotesList.append(li)

    btnDanger.addEventListener("click", (e) => {
            handleDelete(li)
    })
    btnSuccess.addEventListener("click", (e) => {
        const time = new Date().toLocaleTimeString()
        const date = new Date().toLocaleDateString()
        const newObj = {
            quoteId: quote.id, 
            createdAt: `${date} ${time}`
        }
        handleLike(e.target, newObj)
    })
    editButton.addEventListener("click", (e) => {
        editForm.style.display = "block" 
        editForm.elements["edited-quote"].value = quote.quote
        editForm.author.value = quote.author
        // editForm.quote.value = quote.quote
        // editForm.quote.author = quote.author        
        handleEdit(quote)
    })
}

function handleDelete(listElement) {
    fetch(`http://localhost:3000/quotes/${listElement.id}`, {
        method: "DELETE"
    })
    .then(r => r.json())
    .then(deletedObj => {
        const index = Quotes.findIndex(quote => quote.id === deletedObj.id)
        Quotes.splice(index, 1)
        makeQuotes(Quotes)
    })
}

function handlePost(quote) {
    fetch("http://localhost:3000/quotes", {
        method: "POST", 
        headers: {
            "Content-Type": "application/json", 
            "Accept": 'application/json',
        }, 
        body: JSON.stringify(quote)
    })
    .then(r => r.json())
    .then(newQuote => {
        Quotes.push(newQuote)
        makeQuotes(Quotes)
        form.reset()
    })
    .catch(err => console.error(err))
    
}


function handleLike(button, likeObj) {
    fetch(`http://localhost:3000/likes`, {
        method: "POST", 
        headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
        },
        body: JSON.stringify(likeObj)
    })
    .then(r => r.json())
    .then(newLike => {
        const span = button.querySelector("span")
        const currentLike = span.textContent || 0
        span.textContent = Number(currentLike) + 1
    })
    .catch(err => console.error(err))
}

function handleEdit(quote) {
    editForm.addEventListener("submit", (e) => {
        e.preventDefault()
        const editedObj = {
            quote: e.target.elements['edited-quote'].value, 
            author: e.target.author.value
        }
        patchQuote(quote, editedObj)
    })
}

function patchQuote (quote, editedObj) {
    fetch(`http://localhost:3000/quotes/${quote.id}`, {
        method: "PATCH", 
        headers: {
            "Content-Type": "application/json", 
            "Accept": "application/json", 
        },
        body: JSON.stringify(editedObj)
    })
    .then(r => r.json()) 
    .then(editedObj => {

        const entries = Object.entries(editedObj) 
        const likes = quote.likes

        const likeList = ['likes', likes]
        entries.push(likeList)

        const updatedQuote = Object.fromEntries(entries)

        const index = Quotes.findIndex(quote => quote.id === editedObj.id)
        Quotes[index] = updatedQuote
        makeQuotes(Quotes)

        editForm.reset()
        editForm.style.display = "None"

    })
}

//Query Params

// http://localhost:3000/likes?quoteId=
// fetch("http://localhost:3000/quotes?_sort=author")

//How reducer can achieve the same functionality as the Object.prototype.foo

 // const reducer = Quotes.reduce((acc, current) => {
        // if(!acc[name]) {
        //     acc[name] = []
        // }
        // acc[name].push(current)
        // return acc
        // }, {})
        // console.log(reducer)

