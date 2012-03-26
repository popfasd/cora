/**
 * cora.js
 */

/*
 * Define global asset container
 */
var cora = {};


/*
 * Validation object
 */
cora.Validation = {
	isNumeric: function ( n )
	{
		return !isNaN(parseFloat(n)) && isFinite(n);
	}
};


/*
 * Define a create function on the Object object
 */
if (typeof Object.create !== 'function')
{
	Object.create = function ( o )
	{
		var n = function () {};
		n.prototype = o;
		return n;
	}
}


/*
 * Collection object definition
 */
cora.Collection = function ( spec, my )
{
	my = my || {};
	var that = {};
	
	my.elements = new Array();
	
	that.add = function ( o )
	{
		my.elements.push(o);
	};
	
	that.remove = function ( o )
	{
		my.elements.splice(my.elements.indexOf(o), 1);
	};
	
	that.get = function ( i )
	{
		return my.elements[i];
	};
	
	that.getAll = function ()
	{
		return my.elements;
	}
	
	that.length = function ()
	{
		return my.elements.length;
	};
	
	return that;
};


/*
 * Lang object definition
 *
 * Stores translations of messages used througout the app
 */
cora.Lang = {};
cora.Lang.enCA = {
	repositoryNoEntityDefined: 'You must define an entity to use with the repository',
	noDatabaseConnection: 'A connection to the database hasn\'t been established',
	entityQueryReturnedMultipleRows: 'Entity query returned multiple rows',
	entityQueryReturnedNoRows: 'Entity query returned no rows',
	dbQueryFailed: 'Database query failed',
};


/*
 * Logger object definition
 *
 * Wrap console logging so it's easy to turn on and off, as well as ensure
 * that we don't try an log in browsers that lack support. We also prepend
 * 'cora: ' to all messages so we know where the message came from.
 */
cora.Logger = {
	logging: false,
	canLog: function () 
	{
		if (typeof(console) !== 'undefined' && this.logging === true) return true;
		else return false;
	},
	log: function (m) { if (this.canLog() === true) console.log('cora: '+m); },
	error: function (m) { if (this.canLog() === true) console.error('cora: '+m); },
	info: function (m) { if (this.canLog() === true) console.info('cora: '+m); },
	debug: function (m) { if (this.canLog() === true) console.debug('cora: '+m); },
	warn: function (m) { if (this.canLog() === true) console.warn('cora: '+m); },
	trace: function (m) { if (this.canLog() === true) console.trace('cora: '+m); },
	dir: function (m) { if (this.canLog() === true) console.dir('cora: '+m); },
	dirxml: function (m) { if (this.canLog() === true) console.dirxml('cora: '+m); },
	group: function (m) { if (this.canLog() === true) console.group('cora: '+m); },
	groupEnd: function (m) { if (this.canLog() === true) console.groupEnd('cora: '+m); },
	time: function (m) { if (this.canLog() === true) console.time('cora: '+m); },
	timeEnd: function (m) { if (this.canLog() === true) console.timeEnd('cora: '+m); },
	assert: function (m) { if (this.canLog() === true) console.assert('cora: '+m); },
	profile: function (m) { if (this.canLog() === true) console.profile('cora: '+m); }
};
