function Product (id,name,category,quantity,price) {
	this.id = id;
	this.name = name;
	this.category = category;
	this.quantity = quantity;
	this.price = price;

	
	this.decrementQuantity = function(userQuantity) {

		this.quantity = this.quantity - parseInt(userQuantity);

	}

	this.incrementQuantity = function(addQuantity) {
		this.quantity = this.quantity + parseInt(addQuantity);
	}
};

module.exports = Product;