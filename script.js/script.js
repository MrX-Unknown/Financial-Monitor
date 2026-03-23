let balance = 0;

function addTransaction() {
    // Get values from input fields
    const desc = document.getElementById("desc").value;
    const amount = parseFloat(document.getElementById("amount").value);
    const type = document.getElementById("type").value;

    // Create a new list item for the transaction
    const list = document.getElementById("list");
    const li = document.createElement("li");

    // Update balance and list item text based on transaction type
    if (type === "income") {
        balance += amount;
        li.innerText = `${desc} + ${amount.toFixed(2)}`;
    } else if (type === "expense") {
        balance -= amount;
        li.innerText = `${desc} - ${amount.toFixed(2)}`;
    }

    // Add the new transaction to the list
    list.appendChild(li);

    // Update balance display
    document.getElementById("balance").innerText = balance.toFixed(2);

    // Clear input fields after adding transaction
    document.getElementById("desc").value = "";
    document.getElementById("amount").value = "";
}
