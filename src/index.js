const quotesList = document.getElementById("quote-list")
const form = document.getElementById("new-quote-form")

form.addEventListener("submit", (e) => {
    e.preventDefault()
    const newObj = {
        quote: e.target.elements["new-quote"].value,
        author: e.target.author.value,
        likes: []
    }

 handlePost(newObj)
})

let Quotes = []

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

    let likes = quote.likes.length

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
    
    // <button  class="btn-success">Likes: <span>0</span></button>
    // <button  class="btn-danger">Delete</button
    
    quotesList.append(li)

    btnDanger.addEventListener("click", (e) => {
            handleDelete(li)
    })
}

function handleDelete(listElement) {
    fetch(`http://localhost:3000/quotes/${listElement.id}`, {
        method: "DELETE"
    })
    .then(r => r.json())
    .then(deletedObj => {
        const updatedQuotes = Quotes.filter(quote => quote.id !== deletedObj.id)
        makeQuotes(updatedQuotes)
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
        const updatedQuotes = Quotes.push(newQuote)
        console.log(updatedQuotes)
        makeQuotes(updatedQuotes)
    })
    .catch(err => console.error(err))
    
}


