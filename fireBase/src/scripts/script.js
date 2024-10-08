import { initializeApp } from "./firebase-app.js"
import { getDatabase, ref, push, onValue, remove } from "./firebase-database.js"

const firebaseConfig = {
    databaseURL: "https://birthday-app-2bcd2-default-rtdb.asia-southeast1.firebasedatabase.app/"
}

const app = initializeApp(firebaseConfig)
const database = getDatabase(app)
const referenceInDB = ref(database, "leads")

const inputEl = document.getElementById("input-el")
const inputBtn = document.getElementById("input-btn")
const saveTabBtn = document.getElementById("save-tab-btn")
const ulEl = document.getElementById("ul-el")
const deleteBtn = document.getElementById("delete-btn")

function render(leads) {
    let listItems = ""
    for (let i = 0; i < leads.length; i++) {
        listItems += `
            <li>
                <a target='_blank' href='${leads[i]}'>
                    ${leads[i]}
                </a>
            </li>
        `
    }
    ulEl.innerHTML = listItems
}

onValue(referenceInDB, function(snapshot) {
    if (snapshot.exists()) {
        const snapshotValues = snapshot.val()
        const leads = Object.values(snapshotValues)
        render(leads)
    } else {
        ulEl.innerHTML = "" 
    }
}, function(error) {
    console.error("Error reading data:", error)
})

deleteBtn.addEventListener("dblclick", function() {
    remove(referenceInDB)
        .then(() => {
            ulEl.innerHTML = "" 
        })
        .catch((error) => {
            console.error("Error deleting data:", error)
        })
})

inputBtn.addEventListener("click", function() {
    const leadValue = inputEl.value.trim()
    if (leadValue) {
        push(referenceInDB, leadValue)
            .then(() => {
                inputEl.value = "" 
            })
            .catch((error) => {
                console.error("Error adding data:", error)
            })
    }
})

saveTabBtn.addEventListener("click", function() {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        const activeTab = tabs[0]
        const activeTabURL = activeTab.url
        inputEl.value = activeTabURL
        if (activeTabURL) {
            push(referenceInDB, activeTabURL)
                .then(() => {
                    inputEl.value = ""
                })
                .catch((error) => {
                    console.error("Error saving tab URL:", error)
                })
        }
    })
})
