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


/*
 * Database object definition
 */
cora.Database = function ( spec, my )
{
	my = my || {};
	var that = {};
	
	my.name = 'cora';
	my.version = '';
	my.displayName = 'cora App';
	my.size = 10 * 1024 * 1024;
	my.tables = {
		students: 'CREATE TABLE IF NOT EXISTS students ( id INTEGER PRIMARY KEY AUTOINCREMENT, firstname TEXT, lastname TEXT );',
		students: 'CREATE TABLE IF NOT EXISTS students ( id INTEGER PRIMARY KEY AUTOINCREMENT, student INTERGER, created INTEGER, content TEXT );'
		};
	my.lastQuery = '';
		
	that.open = function ()
	{
		/*
		 * These queries should be wrapped in a transaction
		 */
		my.cx = window.openDatabase(my.name, my.version, my.displayName, my.size);

		for (var i in my.tables)
		{
			that.query({ query: my.tables[i], variables: [], onSuccess: function () {},
				onError: function () {
					cora.Logger.error(cora.Lang.dbQueryFailed+': ['+i+']:["'+variables.join("','")+'"]');
				}
			});
		}
	};

	that.reset = function ()
	{
		var txq = {
			queries: [],
			onSuccess: function () { cora.Logger.debug('database: database reset complete'); },
			onError: function () { cora.Logger.error('database: failed to reset database'); }
			};
			
		cora.Logger.warn('database: resetting database!');
		for (var i in my.tables)
		{
			if (typeof i !== 'function')
			{
				txq.queries.push({query: 'DROP TABLE '+i+';', variables: []});
			}
		}
		
		that.transaction(txq);
	};
	
	that.query = function ( o )
	{
		/*
		 * TODO
		 * Check that we have all the o.{property}'s before we do anything
		 */
		my.lastQuery = o.query;
		var tx = my.cx.transaction(function(tx) {
			cora.Logger.debug('database: query: ['+o.query+']:["'+o.variables.join('","')+'"]');
			tx.executeSql(o.query, o.variables, o.onSuccess, o.onError);
		});
	};
	
	that.transaction = function ( o )
	{
		/*
		 * TODO
		 * Check that we have all the o.{property}'s before we do anything
		 */
		cora.Logger.debug('database: executing transaction with '+o.queries.length+' queries');
		var tx = my.cx.transaction(function(tx) {
			for (var i=0; i<o.queries.length; i++)
			{
				cora.Logger.debug('database: transaction: query: ['+o.queries[i].query+']:["'+
					o.queries[i].variables.join('","')+'"]');
				tx.executeSql(o.queries[i].query, o.queries[i].variables, o.onSuccess, o.onError);
			}
		});
	};
	
	return that;
};


/*
 * Note object definition
 */
cora.Note = function ( spec, my )
{
	my = my || {};
	var that = {};
	var id, dateCreated, content, student;
	
	if (typeof spec.id === 'undefined')
		spec.id = 0;
	
	if (!cora.Validation.isNumeric(spec.dateCreated))
		spec.dateCreated = new Date();
	else
		spec.dateCreated = new Date(spec.dateCreated);
	
	if (typeof spec.content === 'undefined')
		throw {name: 'TypeError', message: 'content execpts non-empty string, undefined given'};
		
	if (typeof spec.student !== 'object')
		throw {name: 'TypeError', message: 'student expects object'};
	
	my.id = spec.id;
	my.dateCreated = spec.dateCreated;
	my.content = spec.content;
	my.student = spec.student;
	
	that.getId = function ()
	{
		return my.id;
	};
	
	that.getDateCreated = function ()
	{
		return my.dateCreated;
	};
	
	that.getContent = function ()
	{
		return my.content;
	};
	
	that.getStudent = function ()
	{
		return my.student;
	};
	
	that.setId = function ( id )
	{
		if (my.id === 0)
		{
			my.id = id;
		}
	};
};


/*
 * Tag object definition
 */
cora.Tag = {
	name: '',
	students: cora.Collection()
};


/*
 * Student object definition
 */
cora.Student = function ( spec, my )
{
	my = my || {};
	var that = {};
	var id, firstName, lastName, notes, groups;
	
	if (typeof spec.id === 'undefined')
		spec.id = 0;
	
	if (typeof spec.firstName === 'undefined')
		throw {name: 'TypeError', message: 'firstName expects string, undefined given'};
	
	if (typeof spec.lastName === 'undefined')
		throw {name: 'TypeError', message: 'lastName expects string, undefined given'};
	
	if (typeof spec.notes === 'undefined')
		notes = cora.Collection();
	
	if (typeof spec.tags === 'undefined')
		tags = cora.Collection();
	
	my.id = spec.id;
	my.firstName = spec.firstName;
	my.lastName = spec.lastName;
	my.notes = spec.notes;
	my.tags = spec.tags;

	that.getId = function ()
	{
		return my.id;
	};
	
	that.setId = function ( id )
	{
		if (my.id === 0)
		{
			my.id = id;
		}
	};
	
	that.getFirstName = function ()
	{
		return my.firstName;
	};
	
	that.getLastName = function ()
	{
		return my.lastName;
	};
	
	that.getNotes = function ()
	{
		return my.notes;
	};
	
	that.getTags = function ()
	{
		return my.tags;
	};
	
	return that;
};


/*
 * Entity definitions
 */
cora.Entities = {
	Student: {
		constructor: cora.Student,
		table: 'students',
		primaryKey: 'id',
		fields: {
			id: { column: 'id', getter: 'getId' },
			firstName: { column: 'firstname', getter: 'getFirstName' },
			lastName: { column: 'lastname', getter: 'getLastName' }
		},
		relationships: {
			notes: {
				type: 'one-to-many',
				entity: 'Note',
				joinColumn: 'student'
			}
		},
		onPostConstruction: 'onPostConstruction'
	},
	Note: {
		constructor: cora.Note,
		table: 'notes',
		primaryKey: 'id',
		fields: {
			id: { column: 'id', getter: 'getId' },
			created: { column: 'dateCreated', getter: 'getDateCreated' },
			content: { column: 'content', getter: 'getContent' }
		},
		relationships: {
			student: {
				type: 'many-to-one',
				entity: 'Student',
				joinColumn: 'id'
			}
		},
		onPostConstruction: 'onPostConstruction'
	}
};


/*
 * Repository object definition
 */
cora.Repository = function ( spec, my )
{
	my = my || {};
	var that = {};
	
	my.entity = {};
	my.entities = cora.Collection();
	my.removedEntities = cora.Collection();
	
	if (typeof spec.db !== 'undefined') my.db = spec.db;

	that.create = function ( o ) {};
	that.add = function ( o ) {};

	
	
	my.getEntityPrimaryKeyValue = function ( o )
	{
		return o[my.entity.fields[my.entity.primaryKey].getter]();
	};
	
	that.load = function ( callback )
	{
		/*
		 * Find out what entities are already loaded and except them
		 * from the query
		 */
		var loaded = {ids: [], expr: []};
		for (var i=0; i<my.entities.length(); i++)
		{
			loaded.ids.push(my.getEntityPrimaryKeyValue(my.entities.get(i)));
			loaded.expr.push('id!=?');
		}
		 
		var q = 'SELECT * FROM ' + my.entity.table;
		var v = [];
		
		if (loaded.ids.length > 0)
		{
			q += ' WHERE ('+loaded.expr.join(' or ')+')';
			v = loaded.ids;
		}
		
		var r = my.db.query({
			query: q,
			variables: v,
			onSuccess: function ( tx, rs )
			{
				if (rs.rows.length === 0)
				{
					cora.Logger.debug(cora.Lang.entityQueryReturnedNoRows+': ['+my.db.lastQuery+']');
				}
				for (var i=0; i<rs.rows.length; i++)
				{
					my.prepare(rs.rows.item(i));
				}
				callback(my.entities.getAll());
			},
			onError: my.query_onError
		});
	};
	
	that.getById = function ( id, callback )
	{
		/*
		 * Check if the entity has already been loaded
		 */
		for (var i=0; i<my.entities.length(); i++)
		{
			var o = my.entities.get(i);
			if (o.getId() === id)
			{
				callback(o);
				return;
			}
		}
		
		var q = 'SELECT * FROM ' + my.entity.table + ' WHERE id=?';
		var r = my.db.query({
			query: q,
			variables: [id],
			onSuccess: function ( tx, rs )
				{
					if (rs.rows.length > 1)
					{
						cora.Logger.warn(cora.Lang.entityQueryReturnedMultipleRows+': ['+my.db.lastQuery+']');
					}
					else if (rs.rows.length === 0)
					{
						cora.Logger.debug(cora.Lang.entityQueryReturnedNoRows+': ['+my.db.lastQuery+']');
					}
					else
					{
						callback(my.prepare(rs.rows.item(0)));
						
					}
				},
			onError: my.query_onError
		});
		return this;
	};

	that.remove = function ( o )
	{
		if (my.entities.indexOf(o) > -1)
		{
			my.entities.remove(o);
			if (o._new !== true) my.removedEntities.add(o);
		}
		else
		{
			cora.Logger.warn('attempted to remove non-existent entity ('+my.entity.table+':'+
				my.getEntityPrimaryKeyValue(o));
		}
	};

	my.prepare = function ( row )
	{
		var spec = {};
		for (var i in my.entity.fields)
		{
			spec[i] = row[my.entity.fields[i].column];
		}
		
		if (typeof my.entity.preConstructorMethod !== 'undefined')
			spec = my[my.entity.preConstructorMethod](row, spec);
			
		var o = my.entity.constructor(spec);
		
		if (typeof my.entity.postConstructorMethod !== 'undefined')
			o = my.entity.constructor(row, o);
		
		o._dirty = false;
		o._new = false;
		my.add(o);
		return o;
	};

	that.create = function ( spec )
	{
		var o = my.entity.constructor(spec);
		o._dirty = false;
		o._new = true;
		my.add(o);
		return o;
	};
	
	my.add_onSuccess = function ( o )
	{
		my.entities.add(o);
	};
	
	my.query_onError = function ( o )
	{
		cora.Logger.error(cora.Lang.dbQueryFailed+': ['+my.db.lastQuery+']');
	};
	
	my.add = function ( o )
	{
		cora.Logger.debug('added entity (id:'+my.getEntityPrimaryKeyValue(o)+') to repository for '+
			my.entity.table);
		my.entities.add(o);
	};
	
	that.persist = function ()
	{
		cora.Logger.debug('starting persist for '+my.entity.table);
		var txq = {
			queries: [],
			onSuccess: function () { cora.Logger.debug('completed persist'); },
			onError: function () { cora.Logger.error('persist: SQL transaction failed'); }
			};

		var updated = inserted = deleted = 0;
		for (var i=0; i<my.entities.length(); i++)
		{
			var o = my.entities.get(i);
			
			if (typeof o !== 'object') continue;
			
			if ((typeof o._dirty !== 'undefined' && o._dirty === true)
				|| (typeof o._new !== 'undefined' && o._new === true))
			{
				var cols = [];
				var vals = [];
				var colval = [];
				var q = [];
				for (var j in my.entity.fields)
				{
					if (j !== my.entity.primaryKey)
					{
						cols.push(j);
						vals.push(o[my.entity.fields[j].getter]());
						colval.push(j+'=?');
						q.push('?');
					}
				}
				if (o._dirty === true)
				{
					vals.push(my.getEntityPrimaryKeyValue(o));
					txq.queries.push({
						query: 'UPDATE '+my.entity.table+' SET '+
							colval.join(',')+' WHERE '+my.entity.primaryKey+'=?;',
						variables: vals
						});
					cora.Logger.debug('persist: updating '+my.entity.table+':'+
						my.getEntityPrimaryKeyValue(o));
					updated++;
					o._dirty = false;
				}
				else if (o._new === true)
				{
					cora.Logger.debug('persist: adding entity to '+my.entity.table);
					my.db.query({
						query: 'INSERT INTO '+my.entity.table+' ('+
							cols.join(',')+') VALUES ('+q.join(',')+');',
						variables: vals,
						onSuccess: function (tx, rs) {
							o.setId(rs.insertId);
						},
						onError: function () {},
						});
					inserted++;
					o._new = false;
				}
			}
		}
		
		for (var o in my.deletedEntities)
		{
			txq.queries.push({
				query: 'DELETE FROM '+my.entity.table+' WHERE '+
					my.entity.primaryKey+'=?',
				variables: [my.getEntityPrimaryKeyValue(o)]
				});
			cora.Logger.debug('persist: deleting entity '+my.entity.table+':'+
				my.getEntityPrimaryKeyValue(o));
		}
		
		if (txq.queries.length > 0)
		{
			my.db.transaction(txq);
		}
		
		cora.Logger.debug('persist: found '+(my.entities.length()+my.removedEntities.length())+
			' loaded entities for '+my.entity.table+': '+updated+' updated, '+
			inserted+' inserted, '+deleted+' deleted');
	};
	
	return that;
};


/*
 * StudentRepository
 */
cora.StudentRepository = function ( spec, my )
{
	my = my || {};
	var that = cora.Repository(spec, my);
	
	my.entity = cora.Entities.Student;
	
	my.onPostConstruction = function ( o, callback )
	{
		o.getNotes = function ()
		{
			cora.Instances.get('NoteRepository').getByStudent(id, callback);
		}
	};
		
	return that;
};


/*
 * NoteRepository
 */
cora.NoteRepository = function ( spec, my )
{
	my = my | {};
	var that = cora.Repository(spec, my);

	my.entity = cora.Entities.Note;
	
	my.onPostConstruction = function ( o, callback )
	{
		o.getStudent = function ( o, callback )
		{
			cora.Instances.get('StudentRepository').getByNote(o, callback);
		};
	};
};


/*
 * ObjectFactory object definition
 */
cora.ObjectFactory = function ()
{
	var objects = {};
	var that = {};
	
	objects.Database = cora.Database();
	objects.Database.open();
	
	objects.StudentRepository = cora.StudentRepository({db: objects.Database});
	
	that.get = function ( name )
	{
		var o = null;
		if (typeof objects[name] !== 'undefined') o = objects[name];
		return o;
	};
	
	that.set = function ( name, o )
	{
		objects[name] = o;
		return o;
	};
	
	return that;
};