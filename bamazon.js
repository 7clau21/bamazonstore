var mysql = require('mysql');
var inquirer = require('inquirer');

var connection = mysql.createConnection({
    host: "localhost",
    port:8889,
    user: "root",
    password: "root",
    database: "bamazon",
})

connection.connect(function(err){
    if (err) throw err;
    console.log("connection successful!");
makeTable();
})

var makeTable = function(){
    connection.query("SELECT * FROM products", function(err,res){
        for(var i=0; i<res.length; i ++){
            console.log(res[i].itemId+" || "+res[i].productName+" || "+ res[i].departmentName+ " || " +res[i].price+" || "
        +res[i].stockQuantity+"\n");
        }
        promptCustomer(res);
    })
}
var promptCustomer = function(res){
    inquirer.prompt([{
      type:'input',
      name: 'choice',
      message: "What would you like to purchase? [Quit with Q]"  
    }]).then(function(answer){
        var correct = false;
        if(answer.choice.toUpperCase()=="Q"){
            process.exit();
        }
        for (var i=0; i <res.length; i++){
            if (res[i].productName==answer.choice){
                correct = true;
                var product = answer.choice;
                var id = i;
                inquirer.prompt({
                   type:"input",
                   name: "quant",
                   message: "How many would you like to buy?",
                   validate: function(value){
                       if(isNaN(value)==false){
                           return true;
                       } else {
                           return false;
                       }
                   } 
                }).then(function(answer){
                    if((res[id].stockQuantity - answer.quant)>0){
                        connection.query("UPDATE products SET stockQuantity = '" + (res[id].stockQuantity-
                        answer.quant)+" ' WHERE productName= '" +product + "'", function(err,res2){
                            console.log("Product Bought!");
                            makeTable();
                        })

                    }
                    else {
                        console.log("Not a valid selection!");
                        promptCustomer(res);
                    }
                })
            }
        }
        if(i==res.length && correct ==false){
            console.log("Not a valid selection");
            promptCustomer(res);
        }
    })
}