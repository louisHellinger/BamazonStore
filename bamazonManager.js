// require all NPM packages

var mysql = require("mysql");
var inquirer = require("inquirer");
var Product = require("./product-Obj.js");
var columnify = require("columnify");


// creates connection to mysql DB
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

//confirms connection and responds with connection Thread ID
connection.connect(function(err) {
    if (err) throw err;
    console.log("connected as id " + connection.threadId);

    managerOptions();

});


//uses inquirer NPM and switch method to present manager options

function managerOptions() {
    inquirer
        .prompt({
            name: "action",
            type: "list",
            message: "What would you like to do?",
            choices: [

                "View Products For Sale",
                "View Low Inventory",
                "Add To Inventory",
                "Add New Product",
                "Exit"
            ]
        })
        .then(function(answer) {
            switch (answer.action) {
                case "View Products For Sale":
                    viewProducts();
                    break;

                case "View Low Inventory":
                    viewLowInventory();
                    break;

                case "Add To Inventory":
                    addToInventory();
                    break;

                case "Add New Product":
                    addNewProduct();
                    break;

                case "Exit":
                    exitApp();
                    break;
            }

        });
}


// Makes an array to hold all of the products on the DB
function makeProductArray() {
    connection.query("SELECT * FROM products", function(err, res) {
        if (err) throw err;

        var productArray = [];

        for (var i = 0; i < res.length; i++) {
            var addProduct = new Product(res[i].item_id, res[i].product_name, res[i].department_name, res[i].price, res[i].stock_quantity);

            console.log(columnify(res[i]));
        }

        productArray.push(addProduct);
    })

}

// Shows all of the products in the store
function viewProducts(addInventory) {
    connection.query("SELECT * FROM products", function(err, res) {
        if (err) throw err;

        console.log("\n\r");

         var columns = columnify(res, {
                columns: ['item_id', 'product_name', 'department_name','price','stock_quantity']
                });

            console.log(columns);
            console.log("\n\r");

        if (addInventory === 1) {

            addToInventory();

        } else {
            managerOptions()
        }
    });

}


// Shows a list of items with low inventory
function viewLowInventory() {
    connection.query("SELECT * FROM products WHERE stock_quantity <= 6", function(err, res) {
        if (err) throw err;

        var productList = [];

        console.log("\n\r");

        console.log("THERE ARE " + res.length + " PRODUCTS WITH LOW INVENTORY\n\r");

        for (var i = 0; i < res.length; i++) {

            var newProduct = new Product(res[i].item_id, res[i].product_name, res[i].department_name, res[i].price);

            productList.push(newProduct);

        }

        var columns = columnify(res, {
                columns: ['item_id', 'product_name', 'department_name','price','stock_quantity']
                });

            console.log(columns);

        managerOptions();
    });

}


// function to add additional units to the inventory

function addToInventory() {
    inquirer
        .prompt([{
            name: "itemId",
            type: "input",
            message: "Which product ID would you like to update?",

        }, {
            name: "quantity",
            type: "input",
            message: "How many units would you like to add?",
            validate: function(value) {
                if (isNaN(value) === false) {
                    return true;
                }
                return false;
            }
        }])
        .then(function(answer) {

            var queryValue = answer.itemId;

            connection.query("select * from products where item_id = " + queryValue, function(err, res) {

                if (err) throw err;

                var currentProduct = new Product(res[0].item_id, res[0].product_name, res[0].department_name, res[0].stock_quantity, res[0].price);

                currentProduct.incrementQuantity(answer.quantity);

                updateProduct(currentProduct.id, currentProduct.quantity, currentProduct.name);

            });

        });
}


// this updates the product on the DB
function updateProduct(id, quantity, product, category, orderQuantity, orderTotal) {

    var query = connection.query(
        "UPDATE products SET ? WHERE ?", [{
            stock_quantity: quantity
        }, {
            item_id: id
        }],
        function(err, res) {
            console.log("You have updated " + product + ". Inventory is now " + quantity + ".\n\r");
            managerOptions();
        }
    );

}

// this function adds a new product to the DB using the INQUIRER NPM to gather the data from the manager
function addNewProduct() {
    console.log("Updating Product quantity...\n");

    inquirer.prompt([{
            name: "productName",
            message: "Enter New Product Name: "
        }, {
            name: "departmentName",
            message: "Enter Department Name: "
        }, {
            name: "price",
            message: "Enter Product Price: "
        }, {
            name: "addStock",
            message: "Add Stock Quantity: "
        }

    ]).then(function(resp) {
        var query = connection.query(
            "INSERT INTO products SET ?",

            {
                product_name: resp.productName,
                department_name: resp.departmentName,
                price: resp.price,
                stock_quantity: resp.addStock
            },
            function(err, res) {
                console.log("\n\rNew Product Added \n\r" + resp.productName + " $" + resp.price + ".\n\r");

                managerOptions();

            });
    });

}


function exitApp() {
    console.log("Have a Great Day!");
    connection.end();

};