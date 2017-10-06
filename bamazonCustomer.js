var mysql = require("mysql");
var inquirer = require("inquirer");

var colors = require("colors/safe");
var columnify = require("columnify");

var Product = require("./product-Obj.js");

// sets up connection to mysql
var connection = mysql.createConnection({
    // takes in an object 

    host: "localhost",
    port: 3306,

    // Your username
    user: "root",

    // Your password
    password: "password",
    database: "bamazon_db"
});


//confirms connection and displays thread number
connection.connect(function(err) {
    if (err) throw err;
    console.log("connected as id " + connection.threadId);

    afterConnection();

});

// first function executed after the connection is made
// This will display the items in the store.
function afterConnection(error) {
    connection.query("SELECT * FROM products", function(err, res) {

        console.log("\n\r");

        var productList = [];

        // uses the columnify Package to alter the display in the terminal window
        var columns = columnify(res, {
            columns: ['item_id', 'product_name', 'price']
        });

        console.log(columns);

        console.log("\n\r");

        //executes the function to start shopping
        startShopping();
    });

}

// Function to gets selected product from the database and creates an object and executes function to decrement the inventory

function readProducts(product, quantity) {

    var queryValue = product;

    connection.query("select * from products where item_id = " + queryValue, function(err, res) {
        if (err) throw err;

        var currentProduct = new Product(res[0].item_id, res[0].product_name, res[0].department_name, res[0].stock_quantity, res[0].price);


        if (currentProduct.quantity >= quantity) {

            currentProduct.decrementQuantity(quantity);

            var orderTotal = currentProduct.price * quantity;

            var adjOrderTotal = orderTotal.toFixed(2);

            updateProduct(currentProduct.id, currentProduct.quantity, currentProduct.name, currentProduct.category, quantity, adjOrderTotal);

        } else {
            console.log(colors.red("\n\rInsufficient Quantity!" + " There are " + currentProduct.quantity + " available."));

            afterConnection();
        }

    });

}


// updates the product on the DB. Receives all of these values from READ PRODUCTS function

function updateProduct(id, quantity, product, category, orderQuantity, orderTotal) {

    var query = connection.query(
        "UPDATE products SET ? WHERE ?", [{
            stock_quantity: quantity
        }, {
            item_id: id
        }],
        function(err, res) {


            console.log(colors.yellow("\n\rYou purchased " + orderQuantity + " " +
                product + ".\n\rYour Total Purchase Today is: $" +
                orderTotal + "\n\r"));

            continueShopping();
        }
    );

}


// this function uses INQUIRER Package to prompt customer to select item and quantity.
function startShopping() {
    inquirer.prompt([{
        name: "itemId",
        message: "What is the Item Number that you would like to purchase?"
    }, {
        name: "quantity",
        message: "How many pieces would you like to purchase?",


    }]).then(function(resp) {

        var itemPicked = resp.itemId;
        var quantityPicked = resp.quantity;

        readProducts(itemPicked, quantityPicked);

    });

}


// prompts customer to continue shopping or exit
function continueShopping() {

    inquirer.prompt([{

        type: "confirm",
        name: "confirm",
        message: "Do you want to keep shopping?"

    }]).then(function(resp) {

        if (resp.confirm === true) {
            afterConnection();

        } else {
            closeConnection();
        }

    });

}

function closeConnection() {
    connection.end();
    console.log(colors.red("\n\rHave a great day!\n\r"));

};