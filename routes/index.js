
/*
 * GET home page.
 */
function authenicated(req, res, next){
  if(req.session.loggedIn) res.redirect('/');
  next();
}
function notLogin(req, res, next){
  if(!req.session.loggedIn) res.redirect('/login');
  next();
}
var fs = require('fs');
module.exports = function(app, egou){
  app.get('/', function(req, res){
    console.log(req.body);
  	res.render('index', { title: '易购网' });
  });

  app.post('/', function(req, res){
    egou.users.findOne({username: req.body.user.name}, function(err, doc){
      if(err) throw err;
      if(doc){
        var password = doc["password"];
        if(password !== req.body.user.psw){
          req.flash('error', '密码错误, 请重新输入...');
          res.redirect('/login');
        }else{
          req.session.loggedIn = true;
          req.session.username = doc['username'];
          req.session.userType = doc['userType'];
          console.log(req.session.username);
          res.render('index');
        }
      }else{
        egou.sellers.findOne({loginName: req.body.user.name}, function(err, doc){
          if(err) throw err;
          if(doc){
            var password = doc["loginPsw"];
            if(password !== req.body.user.psw){
              req.flash('error', '密码错误, 请重新输入...');
              res.redirect('/login');
            }else{
              req.session.loggedIn = true;
              req.session.username = doc['loginName'];
              req.session.sellerName = doc['sellerName'];
              req.session.userType = doc['userType'];
              console.log(req.session.username);
              res.render('index');
            }
          }else{
            req.flash('error', '亲, 用户不存在, 赶紧注册一个吧!');
            res.redirect('/login');
          }
        });
      }
    });
  });
  app.get('/login', authenicated, function(req, res){
  	res.render('login');
  });

  app.get('/signup', authenicated, function(req, res){
  	res.render('signup');
  });

  app.get('/signOut', authenicated, function(req, res){
    req.session.loggedIn = false;
    res.redirect('/');
  })

  app.post('/login', function(req, res){
  	if(req.body.user.psw !== req.body.user.confirm){
  		req.flash('error', '2次输入的密码不一致,请重新输入...');
  		res.redirect('/signup');
  	}else{
      egou.sellers.findOne({loginName: req.body.user.name}, function(err, doc){
        if(err) throw err;
        if(doc){
          req.flash('error','对不起,您所注册的用户名已经存在...');
          res.redirect('/signup');
        }
      });
  		egou.users.findOne({username: req.body.user.name}, function(err, doc){
	  		if(err) throw err;
	  		if(doc){
	  			req.flash('error','对不起,您所注册的用户名已经存在...');
	  			res.redirect('/signup');
	  		}else{
	  			console.log('good job');
	  			var newUser = new egou.users({
			  		username: req.body.user.name,
			  		password: req.body.user.psw,
			  		personData: {
			  			email: req.body.user.email
			  		}
			  	});
          
			  	newUser.save();
          res.render('login');
	  		}
	  	}) 	
  	}	
  });

  app.get('/signForSeller', function(req, res){
    res.render('signForSeller');
  })

  app.post('/signSellerSuccess', function(req, res){
    var newSeller = new egou.sellers({
      loginName: req.body.seller.userName,
      loginPsw: req.body.seller.password,
      sellerName: req.body.seller.name,
      sellerInfo: req.body.seller.info,
    });
    
    newSeller.save();
    res.redirect('/login');
  });

  app.get('/publishPro', notLogin, function(req, res){
    res.render('publishPro');
  })

  app.get('/sellerPro', notLogin, function(req, res){
    egou.products.find(function(err, products){
      if(err) throw err;
      egou.sellers.findOne({loginName: req.session.username}, function(err, doc){
        var temPro = [];
        for(var i=0; i<products.length; i++){
          if(products[i].forSeller === doc['sellerName']){
            temPro.push(products[i]);
          }
        }
        res.render('sellerPro', {allProduct: temPro}); 
      })
    });
  });

  app.post('/sellerPro', function(req, res){
    var images = req.files.product.img;
    var proImages = [];
    for(var i=0; i<images.length; i++){
     var tmp_path = images[i]['path'];
      // 指定文件上传后的目录 - 示例为"images"目录。 
      var target_path = './public/images/proImg/' + req.body.product.name + i + '.jpg';
      var store_path = '/images/proImg/' + req.body.product.name + i + '.jpg';
      proImages.push(store_path);
      // 移动文件
      fs.rename(tmp_path, target_path, function(err) {
        if (err) throw err;
        // 删除临时文件夹文件, 
        fs.unlink(tmp_path, function() {
           if (err) throw err;
        });
      });
    };
    var newProduct = new egou.products({
      proName: req.body.product.name,
      powerTime: req.body.product.power,
      showImages: proImages,
      link:　'/product/' + Date.now(),
      proType: req.body.product.type,
      price: req.body.product.price,
      proNum: req.body.product.number,
      forSeller: req.body.sellername
    });
    newProduct.save(function(err){
      if(err) throw err;
      egou.sellers.findOne({sellerName: req.body.sellername}, function(err, doc){
        if(err) throw err;
        var Owns = doc['ownPro'];
        var allPro = [];
        var newOwn;
        Owns.push(req.body.product.name);
        newOwn = Owns;
        egou.sellers.update({sellerName: req.body.sellername}, {ownPro: newOwn}, function(err){
          if(err) throw err;
          console.log(newOwn);
          for(var i=0; i<newOwn.length; i++){
            egou.products.findOne({proName: newOwn[i]}, function(err, doc){
              if(err) throw err;
              allPro.push(doc);
              if(newOwn.length === allPro.length){
                console.log()
                res.render('sellerPro', {allProduct: allPro});
              }
            });
          }
        });
      });  
    });
  });
  
  app.post('/product/:proName', notLogin, function(req, res){
    var oldBuyCar = [];
    egou.users.findOne({username: req.session.username}, function(err, doc){
      if(err) throw err;
      oldBuyCar = doc.buyCar;
      oldBuyCar.push(req.body.proName);
      egou.users.update({username: req.session.username}, {buyCar: oldBuyCar}, function(err){
        if(err) throw err;
        res.send('success');
      })
    })
  });

  app.get('/product/:proName', function(req, res){
    var links = '/product/' + req.params.proName;
    egou.products.findOne({link: links}, function(err, doc){
      if(err) throw err;
      req.session.nowView = doc;
      console.log(doc);
      res.render('productTem', {product: doc});
    });
  });

  app.get('/proBuy', notLogin, function(req, res){
    res.render('proBuy');
  });

  app.post('/myOrder', notLogin, function(req, res){
    var orderImages = [];
    egou.users.findOne({username: req.session.username}, function(err, doc){
      var oNow = doc.own
      oNow.push(req.body.proName);
      egou.users.update({username: req.session.username}, {own: oNow}, function(err){
        if(err) throw err;
      });
    });
    egou.products.findOne({proName: req.body.proName}, function(err, doc){
      orderImages = doc['showImages'];

      var newOrder = new egou.orders({
        orderPrice: req.body.price,
        orderOwner: req.session.username,
        orderNum: req.body.buy.number,
        orderPic: orderImages,
        orderMessage: req.body.buy.message,
        orderPro: req.body.proName
      });

      newOrder.save(function(err){
        if(err) throw err;
        getMyOrder(req, res);
      });
    });
  });

  app.post('/confirmGet', function(req, res){
    var userName = req.body.username;
    var proName = req.body.proName;
    console.log(userName + '||' +　proName);
    egou.orders.findOne({orderOwner: userName, orderPro: proName}, function(err, doc){
      egou.orders.remove({_id: doc['_id']}, function(err){
        console.log("error happened!");
      })
    });
    egou.users.findOne({username: userName}, function(err, doc){
      if(err) throw err;

      var newPayed = doc['payed'];
      var delIndex = doc['own'].indexOf(proName);
      var newOwn = doc['own']
      newOwn.splice(delIndex, 1);
      newPayed.push(proName);
      egou.users.update({username: userName}, {payed: newPayed, own: newOwn}, function(err){
        if(err) throw err;
        res.send('success');
      });
    });
  })

  app.get('/myOrder', notLogin, function(req, res){
    getMyOrder(req, res);
  });

  app.get('/buyCar', notLogin, function(req, res){
    var allProductName = [];
    var allProObj = [];
    egou.users.findOne({username: req.session.username},function(err, doc){
      if(err) throw err;
      allProductName = doc.buyCar;
      if(allProductName.length === 0) res.render('buyCar');
      for(var i=0; i<allProductName.length; i++){
        egou.products.findOne({proName: allProductName[i]}, function(err, doc){
          if(err) throw err;
          allProObj.push(doc);
          if(allProObj.length === allProductName.length){
            res.render('buyCar', {allPro: allProObj});
          }
        });
      }
    });
  });

  app.get('/search', function(req, res){
    egou.products.find({proType: req.query.proType}, function(err, docs){
      if(err) throw err;
      res.send(docs);
    });
  });

  function getMyOrder(req, res){
    egou.orders.find({orderOwner: req.session.username}, function(err, orders){
      if(err) throw err;
      var newData = [];
      if(orders.length === 0){
        res.render('myOrder', {allOrder: newData});
      }
      for(var i=0; i<orders.length; i++){
        var orderNow = orders[i];
        (function(orderNow){
          egou.users.findOne({username: orderNow['orderOwner']}, function(err, doc){
            if(err) throw err;
            if(doc['own'].length === 0){
              res.render('myOrder', {allOrder: newData});
            }
            for(var j=0; j<doc['own'].length; j++){
              if(doc['own'][j] === orderNow['orderPro']){
                newData.push(orderNow);
              }
              if(newData.length === doc['own'].length){
                res.render('myOrder', {allOrder: newData});
              }
            }
          });
        })(orderNow)
      }  
    });
  }
};