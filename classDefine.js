var mongoose = require('mongoose'),
   		Schema = mongoose.Schema;
module.exports = function(){
	//定义用户类
	var userSchema = new Schema({ //用户
		username: {type:String, default: ''}, //用户名
		password: {type:String, default: ''}, //密码
		personData: { //用户信息
			name: {type:String, default: ''},
			email: {type:String, default: ''},
			personInfo: {type:String, default: ''},
			place: {type:String, default: ''}
		},
		userType: {type:String, default: 'customer'}, //用户类型
		own: [String], //拥有订单
		payed: [String],
		buyCar: [String], //购物车
	});

	var productSchema = new Schema({ //产品
		proName: {type:String, default: ''}, //产品名称
		publishDate: {type:Date, default: Date.now()}, //发布日期
		powerTime: {type:Number, default: 0}, //有效期
		link: {type:String, default: ''}, //产品链接
		showImages: [Schema.Types.Mixed], //产品图片
		comments: [String], //评价
		time: {type:Number, default: Date.now()},
		proType: {type: String, default: ''}, //产品类型
		price: {type:Number, default: 0}, //产品价格
		proNum: {type:Number, default: 0}, //库存数量
		forSeller: {type: String, default: ''} //所属商家
	});

	var sellerSchema = new Schema({ //商家
		loginName: {type:String, default: ''}, //登录名
		userType: {type: String, default: 'seller'}, //用户类型
		loginPsw: {type:String, default: ''}, //登录密码
		sellerName: {type:String, default: ''}, 
		ownPro: [String], //拥有的产品
		vipGrades: {type:Number, default: 0}, //vip等级
		sellerInfo: {type:String, default: ''}, //商家信息
	});

	var orderSchema = new Schema({
		orderDate: {type:Date, default: Date.now()}, //下单时期
		orderPrice: {type:Number, default: 0}, //订单价格
		orderNum: {type: Number, default: 0}, //订单数量	
		orderPic: [Schema.Types.Mixed],	//订单图片
		orderMessage: {type:String, default: ''}, //订单信息
		orderOwner: {type:String, default: ''}, //订单拥有者
		orderPro: {type:String, default: ''}, //订单商品
	});

	var recommendSchema = new Schema({ //推荐产品
		productName: [String] //推荐商品的名称
	});
	//定义集合users
	var User = mongoose.model('Users', userSchema);

	var Product = mongoose.model('Products', productSchema);

	var Seller = mongoose.model('Sellers', sellerSchema);

	var Order = mongoose.model('Orders', orderSchema);

	var Recommend = mongoose.model('Recommends', recommendSchema);
	
	this.users = User;
	this.products = Product;
	this.sellers = Seller;
	this.orders = Order;
	this.recommends = Recommend;
	
	console.log('connect Success!')
}