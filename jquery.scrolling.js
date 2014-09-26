//<![CDATA[
/*****************************************
 * Create by Diowind - 2012/05/14
 * Version.2.3.1
 * 
 * HTML sample:
	<!-- 方向按鈕 / 基本形式 -->
	<div id="scrollPanel" style="position: relative; overflow: hidden; height: 300px;">
		<div id="scrollZone" style="position: relative;">
			<div class="item" style="height: 20px; width: 100px;">
				<!-- more code.... -->
			</div>
			<div class="item" style="height: 20px; width: 100px;">
				<!-- more code.... -->
			</div>
		</div>
		
		<!-- optional - 文字式方向鍵 -->
		<div id="btn_box" style="position: absolute; z-index: 99;">
			<a href="javascript:;" clk_direct="prev">前一項</a>
			<a href="javascript:;" clk_direct="next">後一項</a>
		</div>
		
		<!-- optional - 圖片式方向鍵 (左右) -->
		<div id="btn_img" class="btn_img" style="position: absolute; z-index: 99;">
			<a class="btn_box-prev" href="javascript:;" clk_direct="prev">前一項</a>
			<a class="btn_box-next" href="javascript:;" clk_direct="next">後一項</a>
		</div>
	</div>
	
	<!-- 導航按鈕形式 -->
	<div id="scrollPanel" style="position: relative; overflow: hidden; height: 300px;">
		<div id="scrollZone" style="position: relative;">
			<div class="item" style="height: 20px; width: 100px;" id="item_1" nava="1">
				<!-- more code.... -->
			</div>
			<div class="item" style="height: 20px; width: 100px;" id="item_2" nava="2">
				<!-- more code.... -->
			</div>
		</div>
		
		<ul id="btn_nav" style="position: absolute; z-index: 99;">
			<li><a href="javascript:;" id="navA_1" class="select">1</a></li>
			<li><a href="javascript:;" id="navA_2" class="">2</a></li>
		</ul>
		<input type="hidden" id="currNav" value="1" />
	</div>
	
	JS sample:
		$(顯示區塊 ID).scrolling();	//-- 預設值
		
		//-- 自訂
		$(顯示區塊 ID).scrolling({ 
			DIRECT: 'left',
			itemCls: 'adItem',
			scrollZone: 'adBox',
			eff: 'none' 
		});
		
		//-- 方向按鈕切換 --//
		$(顯示區塊 ID).scrolling({ 
			DIRECT: 'static'
		});
		
		//-- 自動 + 按鈕切換 --//
		$(顯示區塊 ID).scrolling({ 
			DIRECT: 'dual-left',		//-- dual-right、dual-up、dual-down
			pageDirect: 'vertical'	//-- 指定 dual-up、dual-down 時必須同時指定捲動方向為 vertical
		});
		
		//-- 導航按鈕 --//
		$('#adBox').scrolling({
			DIRECT: 'left',
			eff: 'none',
			hasBtnNav: true
		});
	
	CSS sample:
		ul#btn_nav { list-style: none outside none; }
		ul#btn_nav li { background-color: white; float: left; height: 20px; line-height: 20px; margin-right: 3px; text-align: center; width: 20px; }
		ul#btn_nav li a { color: #FF6600; display: block; font: 600 12px/20px arial; height: 20px; opacity: 0.5; width: 20px; text-decoration: none; outline: medium none; }
		ul#btn_nav li a:hover { opacity: 1; }
		ul#btn_nav li a.select { opacity: 1; border: 1px solid #FF6600; }
 * 
 *****************************************/

;(function($) {
	$.fn.scrolling = function(opts) {
		var defOpts = {
			//scrollPanel: 'scrollPanel',	// 顯示區塊 ID
			panelH: 0,						//-- 顯示區塊 高
			panelW: 0,						//-- 顯示區塊 寬
			scrollZone: '',					//-- 卷軸區域 ID > default = 'scrollZone'
			zoneW: 0,						//-- 卷軸總寬
			zoneH: 0,						//-- 卷軸總高
			height: 0,						//-- 捲動幅度 - 上下
			width: 0,						//-- 捲動幅度 - 左右
			itemCls: 'item',				//-- 各項目的 class 名稱
			itemH: 0,						//-- 各項目的 高
			itemW: 0,						//-- 各項目的 寬
			scrollTimer: null,				//-- 計時器
			DIRECT: 'down',				//-- 捲動方向 ex: down、up、right、left、static(按鈕切換)、dual-down/up/right/left(自動+按鈕切換)
			times: 4000,					//-- 捲動間隔 ms
			scrollingTimes: 700,			//-- 捲動特效執行時間 ms
			eff: 'fade',						//-- 轉換效果: none、fade、slideUp (需搭配DIRECT: 'up')
			isHoverOn: true,				//-- 滑鼠hover時暫停捲動
			isScrolling: false,			//-- 手動按鈕時防連點
			isSingel: true,				//-- 左右捲動時是否為單一顯示項目
			
			hasBtnNav: false,			//-- 導航按鈕 [1] [2] [3] ...
			btn_nav: 'btn_nav',			//-- 導航按鈕區塊 ID
			nav_loc: 'BTR',				//-- 導航按鈕區塊 位置: BTR(右下)、BTL(左下)、UPR(右上)、UPL(左上)
			nav_margin: 8,				//-- 導航按鈕區塊 位置留白
			
			btn_icon: false,				//-- [前一項 / 後一項] 按鈕樣式 true: 圖片格式  false: 純文字
			btn_box: 'btn_box',			//-- [前一項 / 後一項] 按鈕區塊 ID
			btn_box_cls: 'btn_img',	//-- [前一項 / 後一項] 按鈕區塊 Class
			btn_top: false,				//-- [前一項 / 後一項] 按鈕區塊位置 - 上
			btn_right: false,				//-- [前一項 / 後一項] 按鈕區塊位置 - 右
			btn_bottom: false,			//-- [前一項 / 後一項] 按鈕區塊位置 - 下
			btn_left: false,				//-- [前一項 / 後一項] 按鈕區塊位置 - 左
			btn_w: false,					//-- [前一項 / 後一項] 按鈕區塊寬度
			btn_h: false,					//-- [前一項 / 後一項] 按鈕區塊高度
			pageDirect: 'horizontal',	//-- 手動時的捲動方向 > 上下捲動: vertical   左右捲動: horizontal
			tmpPos: 0,						//-- 手動捲動時, prev 按鈕時前一項目的位置
			tmpZone: 0,					//-- 捲動時的暫存區域 > 增寬 or 增長
			oriZone: 0,						//-- 卷軸原始長寬
			bind: 'click',
			
			onReady: function(){}	//-- 初始化完成後要進行的自訂 Function
		};

		var _opts = $.extend( defOpts, opts );	//-- 各項屬性覆寫
		
		var _handler = function() {
			var id = '#' + this.id;	//-- 顯示區塊 ID 加上 '#'
			//-- 卷軸區域 ID 加上 '#'  -------  scrollZone 未指定時，則預設取用顯示區塊下第一個子元素的ID
			_opts.scrollZone = '#' + ( ( _opts.scrollZone == '' ) ? $( id ).children().eq(0).attr('id') : _opts.scrollZone );
			_opts.itemCls = '.' + _opts.itemCls;				//-- class 	加上 '.'
			_opts.btn_box = '#' + _opts.btn_box;			//-- 按鈕區塊ID 加上 '#'
			_opts.btn_box_cls = '.' + _opts.btn_box_cls;	//-- 按鈕區塊Class 加上 '#'
			_opts.btn_nav = '#' + _opts.btn_nav;			//-- 導航按鈕區塊ID 加上 '#'
			
			//-- 取得顯示區域的寬高 = 未指定時取 [顯示區塊預設寬高]
			_opts.panelH = ( _opts.panelH > 0 ) ? _opts.panelH : $( id ).height();
			_opts.panelW = ( _opts.panelW > 0 ) ? _opts.panelW : $( id ).width();
			
			//-- 取得單項捲動項目的寬高
			_opts.itemH = ( _opts.itemH > 0 ) ? _opts.itemH : $(this).find( _opts.itemCls ).height();
			_opts.itemW = ( _opts.itemW > 0 ) ? _opts.itemW : $(this).find( _opts.itemCls ).width();
			
			$( id ).css({'overflow':'hidden', 'width': _opts.panelW + 'px', 'height': _opts.panelH + 'px'});	//-- 設定顯示區塊的寬高、遮罩範圍
			
			if( _opts.DIRECT == 'down' || _opts.DIRECT == 'up' )
				_opts.pageDirect = 'vertical';
			else
				_opts.pageDirect = 'horizontal';
			
			switch( _opts.DIRECT  ) {
				default:
					init( this, _opts );
					runAnimate( _opts );
					break;
				
				case 'static':
					init( this, _opts );
					//-- 掛上事件
					$( _opts.btn_box ).find('a').each(function(){ $(this).bind( _opts.bind, function(){ manualScroll( $(this).attr('clk_direct'), id, _opts ); } ); });
					break;
				
				case 'dual-down':
				case 'dual-up':
				case 'dual-left':
				case 'dual-right':
					_opts.DIRECT = _opts.DIRECT.replace(/dual-/g, '');
					
					init( this, _opts );
					runAnimate( _opts );
					//-- 掛上事件
					$( _opts.btn_box ).find('a').each(function(){ $(this).bind( _opts.bind, function(){ manualScroll( $(this).attr('clk_direct'), id, _opts ); } ); });
					break;
			}
		};
		
		return this.each( _handler );
	};
	
	//-- 捲動 - auto
	function runAnimate( _opts ) {
		var height = _opts.height;
		var width = _opts.width;
		var cloneTar = ':last-child';
		var addLoc = 'prependTo';
		
		switch( _opts.DIRECT ) {
			default:
			case 'down':
				height = width = 0;
				_opts.tmpPos = {'top':( 0 - _opts.itemH ), 'left':0};
				_opts.tmpZone = {'width':_opts.itemW, 'height':(_opts.zoneH + _opts.itemH)};
				break;
			case 'left':
				width = 0 - _opts.width;
				height = 0;
				cloneTar = ':first-child';
				addLoc = 'appendTo';
				break;
			
			case 'right':
				height = width = 0;
				_opts.tmpPos = {'top':0, 'left':( 0 - _opts.itemW )};
				_opts.tmpZone = {'width':(_opts.zoneW + _opts.itemW), 'height':_opts.itemH};
				break;
			case 'up':
				width = 0;
				height = 0 - _opts.height;
				cloneTar = ':first-child';
				addLoc = 'appendTo';
				break;
		}
		
		//-- 滑鼠 hover 時停止捲動
		if( _opts.isHoverOn ) { scrollPause( _opts ); }
		
		if ( _opts.scrollTimer == null ) {
			_opts.scrollTimer = setTimeout( function(){runAnimate( _opts );}, 1000 );
			return false;
		}
		
		var _lastItem = _opts.scrollZone + ' ' + _opts.itemCls + cloneTar;
		var isFade = '.show()';
		/*if( _opts.eff == 'fade' ) {
			$( _lastItem ).fadeOut( _opts.scrollingTimes );	// 將 被複製的對象 fadeOut
			isFade = ".fadeIn(" + _opts.scrollingTimes + ")";
		}*/
		//-- 轉場特效
		switch( _opts.eff ) {
			default:
			case 'none':
				break;
			
			case 'fade':
				$( _lastItem ).fadeOut( _opts.scrollingTimes );	//-- 將 被複製的對象 fadeOut
				isFade = ".fadeIn(" + _opts.scrollingTimes + ")";
				break;
			
			case 'slideUp':	//-- 搭配 DIRECT: 'up'
				$( _lastItem ).slideUp( _opts.scrollingTimes );	//-- 將 被複製的對象 slideUp
				height = width = 0;
				break;
		}
		
		eval("$( _lastItem ).clone(true, true).hide()." + addLoc + "( _opts.scrollZone )" + isFade);
		if( _opts.DIRECT == 'down' || _opts.DIRECT == 'right' ) {
			$( _opts.scrollZone ).css( _opts.tmpPos ).css( _opts.tmpZone );
		}
		
		/** 移動 **/
		$( _opts.scrollZone ).animate({
			top: height + 'px',
			left: width + 'px'
		}, (_opts.scrollingTimes-20), function(){
			$( _lastItem ).remove();
			$( _opts.scrollZone ).css({'top': 0, 'left': 0}).css( _opts.oriZone );
			
			//-- 導航按鈕模式, 改變按鈕CSS
			if( _opts.hasBtnNav ) {
				var tar = $( _opts.scrollZone + ' ' + _opts.itemCls + ':first-child' ).attr('nava');
				btnNavSelect(tar, _opts);
			}
			if ( _opts.scrollTimer != undefined ) { clearTimeout( _opts.scrollTimer ); }
			_opts.scrollTimer = setTimeout( function(){runAnimate( _opts );}, _opts.times );
		});
	}	//-- end of runAnimate()
	
	//-- 按鈕切換
	function manualScroll( goNext, id, _opts ) {
		//-- 防連點
		if ( _opts.isScrolling != false ) { 
			return false;
		}
		else {
			_opts.isScrolling = true;
			var height = ( _opts.pageDirect == 'vertical' ) ? (0 - _opts.height) : 0;
			var width = ( _opts.pageDirect == 'vertical' ) ? 0 : (0 - _opts.width);
			var cloneTar = ':last-child';
			// var addLoc = 'prependTo';
			
			switch( goNext ) {
				default:
				case 'next':
					cloneTar = ':first-child';
					// addLoc = 'appendTo';
					break;
					
				case 'prev':
					height = width = 0;
					break;
			}
			
			var _lastItem = _opts.scrollZone + ' ' + _opts.itemCls + cloneTar;
			if( goNext == 'prev' ) {	//-- 前一項 = 向右 or 向下
				$( _opts.scrollZone ).prepend( $( _lastItem ).clone(true, true) ).css( _opts.tmpZone );
				$( _opts.scrollZone ).css( _opts.tmpPos );
			}
			else {
				$( _opts.scrollZone ).append( $( _lastItem ).clone(true, true) ).css( _opts.tmpZone );
			}
			
			/** 移動 **/
			$( _opts.scrollZone ).animate({
				top: height + 'px',
				left: width + 'px'
			}, _opts.scrollingTimes, function(){
				$( _lastItem ).remove();
				$( _opts.scrollZone ).css({'top': 0, 'left': 0}).css( _opts.oriZone );
				
				setTimeout(function(){ _opts.isScrolling = false; }, _opts.scrollingTimes);
			});
		}
	} //-- end of manualScroll()
	
	//-- 導航按鈕切換	tar: 目標序號
	function navClick( tarObj, _opts ) {
		//-- 防連點
		if ( _opts.isScrolling != false ) { 
			return false;
		}
		else {
			_opts.isScrolling = true;
			var tar = parseInt( tarObj.innerHTML );
			var goDirect = 'sub';
			var currNav = parseInt( $('#currNav').val() );
			var move = Math.abs( currNav - tar );	//-- 位移距離
			
			var items = _opts.scrollZone + ' ' + _opts.itemCls;
			if( currNav > tar ) {	//-- 目標序號比當前序號小 ((右、下移
				goDirect = 'add';	//-- right、down
				var pos = _opts.tmpPos;
				for(var i = currNav-1; i >= tar; i--) {
					_lastItem = '#item_' + i;
					$( _opts.scrollZone ).prepend( $( _lastItem ).clone(true, true) ).css( _opts.tmpZone );
				}
				
				if( _opts.pageDirect == 'vertical' ) {	//-- 垂直捲動
					_opts.tmpZone['height'] += _opts.height * move;
					pos['top'] = 0 - _opts.height * move;
				}
				else {	//-- 水平捲動
					_opts.tmpZone['width'] += _opts.width * move;
					pos['left'] = 0 - _opts.width * move;
				}
				
				$( _opts.scrollZone ).css( pos );
			}
			else {	//-- 目標序號比當前序號大 ((左、上移
				goDirect = 'sub';	//-- left、up
				for(var i = currNav; i < tar; i++) {
					_lastItem = '#item_' + i;
					$( _opts.scrollZone ).append( $( _lastItem ).clone(true, true) ).css( _opts.tmpZone );
				}
			}
			
			var height = ( _opts.pageDirect == 'vertical' ) ?  ( goDirect == 'add' ) ? 0 : (0 - _opts.height * move) : 0;
			var width = ( _opts.pageDirect == 'vertical' ) ? 0 : ( goDirect == 'add' ) ? 0 : (0 - _opts.width * move);
			
			/** 移動 **/
			$( _opts.scrollZone ).animate({
				top: height + 'px',
				left: width + 'px'
			}, _opts.scrollingTimes, function(){
				
				setTimeout(function(){ 
					_opts.isScrolling = false;
					var child = ':first-child';
					if( goDirect == 'add' ) {
						child = ':last-child';
					}
					//-- 刪除項目
					// while(move > 0) {
					// 	$( items + child ).remove();
					// 	move--;
					// }
					$( _opts.scrollZone ).css({'top': 0, 'left': 0}).css( _opts.oriZone );
				}, _opts.scrollingTimes);
			});
			
			btnNavSelect(tar, _opts);
		}
	}
	
	/***********************************************************************************************/
	//-- 初始化
	function init( currObj, _opts ) {
		_opts.zoneW = _opts.panelW;		//-- 卷軸總寬 -- 左右捲動時設定為總物件寬
		_opts.zoneH = _opts.panelH;		//-- 卷軸總高 -- 上下捲動時設定為總物件高
		if( _opts.DIRECT == '' ) { _opts.DIRECT = 'down'; }
		if( _opts.pageDirect == '' ) { _opts.pageDirect = 'horizontal'; }
		if( _opts.DIRECT == 'right' || _opts.DIRECT == 'left' || ( _opts.DIRECT == 'static' && _opts.pageDirect == 'horizontal' ) ) {
			_opts.width = ( _opts.width > 0 ) ? _opts.width : _opts.itemW;
			_opts.height = 0;
			_opts.zoneW = _opts.itemW * $(currObj).find( _opts.itemCls ).length;
		}
		else if( _opts.DIRECT == 'up' || _opts.DIRECT == 'down' || ( _opts.DIRECT == 'static' && _opts.pageDirect == 'vertical' ) ) {
			_opts.width = 0;
			_opts.height = ( _opts.height > 0 ) ? _opts.height : _opts.itemH;
			_opts.zoneH = _opts.itemH * $(currObj).find( _opts.itemCls ).length;
		}
		
		//-- 卷軸原始長寬
		_opts.oriZone = {'width':_opts.zoneW, 'height':_opts.zoneH};
		if( _opts.isSingel )
			_opts.itemW = _opts.panelW;
		
		$( _opts.scrollZone ).css({'position':'relative', 'width':_opts.zoneW, 'height':_opts.zoneH}).find( _opts.itemCls ).css({'position':'relative', 'width':_opts.itemW, 'float':'left'});
		//---------------------------------------------------------------------------------------------------//
		
		//-- 按鈕切換時使用
		switch( _opts.pageDirect ) {
			default:
			case 'horizontal':	//-- 左右捲動
				_opts.tmpPos = {'top':0, 'left':( 0 - _opts.itemW )};
				_opts.tmpZone = {'width':(_opts.zoneW + _opts.itemW), 'height':_opts.itemH};
				break;
				
			case 'vertical':		//-- 上下捲動
				_opts.tmpPos = {'top':( 0 - _opts.itemH ), 'left':0};
				_opts.tmpZone = {'width':_opts.itemW, 'height':(_opts.zoneH + _opts.itemH)};
				break;
		}
		
		//-- 產生導航按鈕 --//<li><a id="navA_1" href="javascript:;" class="select">1</a></li>
		if( _opts.hasBtnNav ) {
			_opts.isHoverOn = true;	//-- 強制啟動 [滑鼠hover時暫停捲動] 功能
			var len = $( _opts.scrollZone ).find( _opts.itemCls ).length;
			var li, aLink;
			var cls = 'select';
			for(var i = 1; i <= len; i++) {
				li = document.createElement('li');
				aLink = document.createElement('a');
				aLink.id = 'navA_' + i;
				aLink.href = 'javascript:;';
				aLink.className = cls;
				aLink.innerHTML = i;
				
				//-- 加上 click 事件 - 分為 IE or FF系列
				if( ns ) {
					aLink.addEventListener("click", function(event) {
						navClick( this, _opts );
					});
				}
				else if( ie ) {
					aLink.attachEvent("onclick", function(event) {
						navClick( this, _opts );
					});
				}
				
				li.appendChild(aLink);
				$( _opts.btn_nav ).append(li);
				cls = '';
				aLink = li = null;
			}
			
			//-- 導航按鈕位置設定
			switch( _opts.nav_loc ) {
				default:
				case 'BTR'://-- 右下
					$( _opts.btn_nav ).css({'bottom': _opts.nav_margin + 'px', 'right': _opts.nav_margin + 'px'});
					break;
					
				case 'BTL':	//-- 左下
					$( _opts.btn_nav ).css({'bottom': _opts.nav_margin + 'px', 'left': _opts.nav_margin + 'px'});
					break;
					
				case 'UPR'://-- 右上
					$( _opts.btn_nav ).css({'top': _opts.nav_margin + 'px', 'right': _opts.nav_margin + 'px'});
					break;
					
				case 'UPL':	//-- 左上
					$( _opts.btn_nav ).css({'top': _opts.nav_margin + 'px', 'left': _opts.nav_margin + 'px'});
					break;
			}
		}
		
		//-- 按鈕位置設定
		if( _opts.btn_icon ) {
			//-- 圖片式方向鍵
			$( _opts.btn_box ).find('.btn_box-prev').css({left: 0});
			$( _opts.btn_box ).find('.btn_box-next').css({left: _opts.itemW - 50});
			$( _opts.btn_box ).css({top: ( _opts.zoneH / 2 ) - (25 / 2)});
		}
		else {
			//-- 文字式方向鍵
			if( typeof( _opts.btn_top ) == 'number' )
				$( _opts.btn_box ).css({'top': _opts.btn_top});
			if( typeof( _opts.btn_right ) == 'number' )
				$( _opts.btn_box ).css({'right': _opts.btn_right});
			if( typeof( _opts.btn_bottom ) == 'number' )
				$( _opts.btn_box ).css({'bottom': _opts.btn_bottom});
			if( typeof( _opts.btn_left ) == 'number' )
				$( _opts.btn_box ).css({'left': _opts.btn_left});
			if( typeof( _opts.btn_w ) == 'number' )
				$( _opts.btn_box ).css({'width': _opts.btn_w});
			if( typeof( _opts.btn_h ) == 'number' )
				$( _opts.btn_box ).css({'height': _opts.btn_h});
		}
		
		_opts.onReady();
	}
	
	//-- 滑鼠 hover 時暫停捲動
	function scrollPause( _opts ) {
		$( _opts.scrollZone + ' ' + _opts.itemCls + ', ' + _opts.btn_box + ' a, ' + _opts.btn_nav + ' a' ).hover(
			function(){ clearTimeout( _opts.scrollTimer ); }, 
			function(){
				if ( _opts.scrollTimer != undefined || _opts.scrollTimer != null ) { clearTimeout( _opts.scrollTimer ); }
				_opts.scrollTimer = setTimeout( function(){runAnimate( _opts );}, _opts.times );
		});
	}
	
	//-- 導航按鈕樣式切換
	function btnNavSelect(tar, _opts) {
		$('#currNav').prop('value', tar);
		$( _opts.btn_nav ).find('a').removeClass('select');
		$('#navA_'+tar).addClass('select');
	}
	
	//-- 判斷 IE系列 or FF系列 瀏覽器
	var ns = ((navigator.appName == 'Netscape') && (parseInt(navigator.appVersion) >= 5));
	var ie = ((parseInt(navigator.appVersion) >= 4) && (navigator.appName.indexOf('msie') != -1));
	
})(jQuery);





/*****************************************
 * Modify by Diowind - 2014/09/26 - ver.2.3.1
 * Modify by Diowind - 2014/07/08 - ver.2.3.0
 * Modify by Diowind - 2013/11/19 - ver.2.2.1
 * Modify by Diowind - 2012/09/12 - ver.2.2.0
 * Modify by Diowind - 2012/09/10 - ver.2.1.4
 * Modify by Diowind - 2012/06/04 - ver.2.1.3
 * Modify by Diowind - 2012/05/16 - ver.2.1.2
 * Modify by Diowind - 2012/05/15 - ver.2.0.1
 *
 *	version Log
 *	Version.2.3.1---
 *	修正 parseInt() 函式，指定轉換為十進位。
 *	
 *	Version.2.3.0---
 *	新增 [onReady] 初始化完成後的自訂 Function
 *	新增 [btn_icon] 圖片 / 文字模式的方向鍵
 *	新增 [btn_box_cls] 方向鍵區塊的 class
 *	新增 方向鍵在圖片模式時的位置設定在上下置中，以及圖片兩側。
 *	修正 複製元素時連同事件一起複製。  .clone() > .clone(true, true) 
 *	修正 註解
 *	
 *	Version.2.2.1---
 *	修正 .attr('屬性', '值') > .prop('屬性', '值')
 *	
 *	Version.2.2.0---
 *	新增 [導航按鈕] 模式
 *	新增 IE、NS系列瀏覽器判斷
 *	新增 [slideUp] 轉場特效 (需搭配向上捲動)
 *
 *	Version.2.1.4---
 *	新增 左右捲動時，顯示項目數量為單一或多數而改變項目寬度
 *	
 *	Version.2.1.3---
 *	新增 [按鈕區塊] 上右下左位置設定
 *	
 *	Version.2.1.2---
 *	修正 [按鈕切換] 模式時的防止快速連點 bug
 *	修正 function init() 捲動方向和移動方向的 預設值指定
 *	
 *	Version.2.1.1---
 *	新增 [自動 + 按鈕切換] 模式
 *	修正 [自動] 模式下的滑動
 *	更改檔名為 jquery.scrolling
 *	
 *	Version.2.0.1---
 *	新增 [按鈕切換] 模式
 *
 *	Version.2.0.0---
 *	更改檔名為 scrolling_200
 *	修改為 jQuery plugin 格式
 *
 *	--------------------------------------------------
 *	Version.1.1.2---
 *	新增項目	itemH、itemW 可獨立指定項目的寬高
*****************************************/
//]]>
