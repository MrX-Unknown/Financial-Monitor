let balance = 0;

function addTransaction(){

let desc = document.getElementById("desc").value;
let amount = parseFloat(document.getElementById("amount").value);
let type = document.getElementById("type").value;

let list = document.getElementById("list");
let li = document.createElement("li");

if(type === "income"){
balance += amount;
li.innerText = desc + " + " + amount;
}else{
balance -= amount;
li.innerText = desc + " - " + amount;
}

list.appendChild(li);

document.getElementById("balance").innerText = balance;

}