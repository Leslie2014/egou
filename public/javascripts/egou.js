$(function(){
	$.easing.def="easeInOutQuad";
	var image = new Image($(document).innerWidth(), $(document).innerHeight());
	var timer;
	var moveDone = false;
	var indexImg = 0;
	var gallaryData = [
		{
			"title": "瑞士转山只为一睹少女峰雍容",
			"content": "少女峰并不是因为形状像少女，而是，入冬的第一场初雪总是最先降临在这座山峰上，因此，称之为少女峰。只有切实体验过，才能领略这份辽阔的壮美……"
		},
		{
			"title": "边城纳木寺3日游",
			"content": "哈瓦那的美是任何语言都不能去讲述的，虽然人们试图用各种语言去向她献媚。于是，在拉丁美洲的热情，配合着加勒比的阳光海滩，混杂着香醇的龙舌兰与雪茄的阳光下……"
		},
		{
			"title": "探寻古巴哈瓦那神秘之旅",
			"content": "哈瓦那的美是任何语言都不能去讲述的，虽然人们试图用各种语言去向她献媚。于是，在拉丁美洲的热情，配合着加勒比的阳光海滩，混杂着香醇的龙舌兰与雪茄的阳光下……"
		},
		{
			"title":　"波兰印象看不够的克拉科夫",
			"content": "如果去波兰只能选择一座城市，那我会毫不犹豫地推荐这个国家的第三大城市，故都克拉科夫……"
		},
		{
			"title": "幽谷梵音 泉州清源山",
			"content": "景区内峰峦岩石掩映，盎然生趣，素有“闽海蓬莱第一山”之美誉。"
		}
	];
	image.src = "/images/bg.jpg";
	$('.titleA').html(gallaryData[0]['title']);
	$('.contentA').html(gallaryData[0]['content']);
	$(image).on('load', function(){
		$('.bg').append(image);
		image.style.display = "none";
		$(image).fadeIn(300, function(){
			$(".midCenter").fadeIn('fast');
		});
	});
	$(".bg").css({
		'width': $(document).innerWidth(),
		'height': $(document).innerHeight(),
	});
	$(".midCenter").css({
		'left': ($(document).innerWidth() - $(".midCenter").width())/2 + 'px',
		'top':  ($(document).innerHeight() - $(".midCenter").height())/2 - 20 + 'px'
	});
	$("#loginForm").css({
		'left': ($(document).innerWidth() - $("#loginForm").width())/2 + 'px',
	});


	$('.listUl li').click(clickMove);
	$('.imgUl li').hover(clearTimer, setTimer);
	$('.nextA').click(preMove);
	$('.preA').click(nextMove);

	$(".tBox img").hover(function(){
		$(this).css('opacity', '0.7');
	}, function(){
		$(this).css('opacity', '1');
	});

	$("#postAjax").click(function(){
		var urls = location.pathname;
		$.post(urls, {proName: $(".proName").text()}, function(data){
				alert('商品已成功加入购物车!');
				console.log(data);
		});
	});

	$('.confirmGet').click(function(){
		var _this = $(this);
		$.post('/confirmGet', {username: $('#username').text(), proName: $(this).parent().parent().find('td').eq(0).text()}, function(data){
			console.log(data);
			if(data === 'success'){
				_this.css({
					'backgroundColor': '#99A0A8',
					'color': '#1D1F21',
					'textShadow': '0px 1px 0px #fff',
					'border': '1px solid #E4E7E9'
				}).attr('disabled', 'disabled').html('收货成功!');
				alert('确认收货成功!');
			}
		});
	});

	$('#search').click(searchData);

	$("#searchIpt").keypress(function(ev){
		if(ev.keyCode === 13){
			searchData();
		}
	})
	timer = setInterval(nextMove, 3000);
	function clearTimer(){
		clearInterval(timer);
	}
	function setTimer(){
		clearTimer();
		timer = setInterval(nextMove, 3000);
	}
	function clickMove(){
		var index = $(this).index();
		move(index);
	}
	function preMove(){
		var index = indexImg - 1;
		if(index === -1) index = 4;
		move(index);
	}
	function nextMove(){
		var index = indexImg + 1;
		if(index === 5) index = 0;
		move(index);
	}
	function dataBoxMove(index){
		$('.titleA').html(gallaryData[index]['title']);
		$('.contentA').html(gallaryData[index]['content']);
		$('.titleA').css({
			'left': '-200px',
			'opacity': 0
		});
		$('.contentA').css({
			'left': '200px',
			'opacity': 0
		});
		$('.titleA, .contentA').animate({left: 0, opacity: 1},350);
	}
	function move(index){
		dataBoxMove(index);
		$('.imgUl').animate({left: - ($('.imgUl li img').width() * index) }, 350, function(){
			indexImg = index;
			$('.listUl li').removeClass('active');
			$('.listUl li').eq(index).addClass('active');
			moveDone = true;
		});
	}
	function searchData(){
		var htmlTem = "";
		var wrap = $("<div id='wrap'></div>");
		$.get('/search', {proType: $("#searchIpt").val()}, function(data){
 			$('#egouReal').fadeOut(300, function(){
 				for(var i=0; i<data.length; i++){
 					var searchModel = data[i];
 					htmlTem += "<div class='searchModel'><img src='"
 					 + searchModel.showImages[0] + "'/><hr/><p>产品名称:<span>" 
 					 + searchModel.proName + "</span></p><p>产品价格:<span>"
 					 + searchModel.price + "元</span></p><p class='lastR'><a class='btn btn-warning' href='"
 					 + searchModel.link + "'>购买</a></p></div>";
 					 wrap.html(htmlTem);
 					$("#egouReal").append(wrap);
 					$(this).html(htmlTem).fadeIn(300);
 				}
 			});
		});
	}
})