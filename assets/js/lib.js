// coraHistory object definition
function coraHistory ()
{
	this.storage = sessionStorage;
	this.history = [];
	
	/*
	 * load existing history from sessionStorage
	 */
	this.init = function ()
	{
		var tmp = this.storage.getItem('history');
		if (tmp) {
			this.history = JSON.parse(tmp);
			console.log('coraHistory: loaded existing history from session storage');
		}
	}
	
	this.save = function ()
	{
		this.storage.setItem('history', JSON.stringify(this.history));
		console.log('coraHistory: saved history to session storage');
	}
	
	this.push = function ( data )
	{
		if (this.history[this.history.length-1] != data)
		{
			this.history.push(data);
			console.log('coraHistory: added "'+data+'" to history');
			this.save();
		}
	}
	
	this.removeLast = function ( num )
	{
		if (typeof num != 'number')
		{
			num = 1;
		}
		for (var i = 0; i<num; i++)
		{
			this.history.pop();
		}
	}
	
	this.clear = function ()
	{
		console.log('coraHistory: clearing history');
		this.history = [];
		this.save();
	}
	
	this.getPrevious = function ()
	{
		return this.history[this.history.length-2];
	}
	
	this.length = function ()
	{
		return this.history.length;
	}
}

// coraScreen object definitions
function coraScreen ()
{
	this.history = new coraHistory();
	var headerSelector = '#screen-header h1';
	var bodySelector = '#screen-body > div';
	var homeScreen = 'home.html';
	
	this.init = function ()
	{
		console.log('coraScreen: initializing...');
		if (!$(bodySelector).children().length == 1)
		{
			this.load(homeScreen);
		}
	}
	
	this.load = function ( url )
	{
		console.log('coraScreen: loading ' + url);
		$.get(url, this._ajaxGetCallback);
		if (url == homeScreen)
		{
			this.history.clear();
		}
		this.history.push(url);
	}
	
	this._ajaxGetCallback = function ( data )
	{
		$(bodySelector).replaceWith(data);
	}
	
	this.previous = function ()
	{
		this.load(this.history.getPrevious());
	}
}

var screen = new coraScreen();

$('document').ready(function()
{
	screen.init();

	// load a new screen
	$('.screen-change').click(function()
	{
		var url = $(this).attr("rel") + '.html';
		screen.load(url);
	});
	
	// return to the previous screen
	$('.screen-back').click(function()
	{
		screen.previous();
	});
	
	$('form .fancy-field').focus(function ()
	{alert();
		$(this).addClass('selected');
	});
	
	$('form .fancy-field').blur(function ()
	{alert();
		$(this).removeClass('selected');
	});
});

