/**
 * cora JS Library
 * Copyright (c) 2012 POPFASD
 * (Provincial Outreach Program for Fetal Alcohol Spectrum Disorder)
 * @author Matt Ferris <mferris@sd57.bc.ca>
 * @version alpha
 */

/*
 * Add trim to String for browsers that don't yet use EMCAScript5
 */
if (!String.prototype.trim)
{
	String.prototype.trim = function ()
	{
		return this.replace(/^\s+|\s+$/g, '');
	}
}
 
/**
 * Define the cora container object
 */
var cora = {
	persistence: persistence
};

/**
 * Date object
 * @param {object} [date] A date string
 */
cora.Date = function ( string )
{
	var date = new Date(string);
	var months = ['January','February','March','April','May','June','July','August','September','Octoboer','November','December'];
	var days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
	var that = {};
	that.getNoteTime = function ()
	{
		var h = date.getHours();
		var ampm = 'AM';
		var m = date.getMinutes();
		if (h > 12)
		{
			ampm = 'PM';
			h -= 12;
		}
		if (h == 0) h = 12;
		if (m < 10) m = '0'+m;
		return {hours: h, minutes: m, ampm: ampm};
	};
	that.getNoteTimeAsString = function ()
	{
		var t = that.getNoteTime();
		return t.hours+':'+t.minutes+' '+t.ampm;
	};
	that.getNoteDate = function ()
	{
		return {
			dayOfWeekName: days[date.getDay()],
			monthName: months[date.getMonth()],
			dayOfMonth: date.getDate(),
			year: date.getFullYear()
			};
	};
	that.getNoteDateAsString = function ()
	{
		var d = that.getNoteDate();
		return d.dayOfWeekName+', '+d.monthName+' '+d.dayOfMonth+', '+d.year;
	};
	that.getCompactDate = function ()
	{
		return date.getFullYear()+(date.getMonth()+1)+date.getDate();
	};
	return that;
};

/**
 * EntityCacheConstructor object
 * Caches entities for use across sequential screen loads
 */
cora.EntityCacheConstructor = function ()
{
	var cache = {};
	var that = {};
	that.isCached = function ( o )
	{
		if (typeof o === 'object' && o !== null) o = o.id;
		if (typeof cache[o] !== 'undefined') return true;
		else return false;
	};
	that.add = function ( o )
	{
		if (o !== null && !that.isCached(o))
		{
			console.log('cora: entity cache: added '+o.id);
			cache[o.id] = o;
		}
	};
	that.remove = function ( o )
	{
		console.log('cora: entity cache: removed '+o.id);
		if (that.isCached(o)) delete cache[o.id];
	};
	that.clear = function ()
	{
		console.log('cora: entity cache: cleared');
		cache = [];
	};
	that.removeAllExcept = function ( o )
	{
		console.log('cora: entity cache: removed all except '+o.id);
		cache = [];
		cache[o.id] = o;
	};
	that.get = function ( id, callback )
	{
		console.log('cora: entity cache: got '+id);
		if (typeof callback === 'undefined')
		{
			if (that.isCached(id)) return cache[id];
		}
		else
		{
			var object = null;
			if (that.isCached(id)) object = cache[id];
			callback(object);
		}
	};
	return that;
};

/**
 * Remove an entity object from persistence
 * @param {object} entity Entity object to remove
 */
cora.removeEntity = function ( entity )
{
	cora.EntityCache.remove(entity);
	persistence.remove(entity);
};

/**
 * Instantiate a new Student object and track via persistence
 * @param {string} firstName First name of the student
 * @param {string} lastName Last name of the student
 * @return {object} The new Student object
 */
cora.createStudent = function ( firstName, lastName )
{
	var student = new cora.Student({firstName: firstName, lastName: lastName});
	cora.persistence.add(student);
	cora.EntityCache.add(student);
	return student;
};

/**
 * Remove a Student object
 * @param {object} student Student to remove
 */
cora.removeStudent = cora.removeEntity;

/**
 * Return student with a given ID
 * @param {string} id ID of the entity
 * @param {function} callback Callback function
 */
cora.getStudentById = function ( id, callback )
{
	if (cora.EntityCache.isCached(id))
	{
		cora.EntityCache.get(id, callback);
	}
	else
	{
		cora.Student.load(id, function (s) {
			cora.EntityCache.add(s);
			callback(s);
		});
	}
};

/**
 * Get an array of all students
 * @param {function} callback Callback function
 */
cora.getAllStudents = function ( callback )
{
	cora.Student.all().order('lastName').list(callback);
};

/**
 * Instantiate a new Note object and track via persistence
 * @param {object} student Student to attach the note to
 * @param {string} content Content of the note
 * @return {object} The new Note object
 */
cora.createNote = function ( student, content )
{
	var created = Date.parse(new Date());
	var note = new cora.Note({student: student.id, created: created, content: content});
	cora.persistence.add(note);
	cora.EntityCache.add(note);
	return note;
};

/**
 * Remove a Note object
 * @param {object} note Note to remove
 */
cora.removeNote = cora.removeEntity;

/**
 * Get note given an ID
 * @param {string} id ID of the note to get
 * @param {function} callback Callback function
 */
 cora.getNoteById = function ( id, callback )
 {
	if (cora.EntityCache.isCached(id))
	{
		cora.EntityCache.get(id, callback);
	}
	else
	{
		cora.Note.load(id, function (n) {
			cora.EntityCache.add(n);
			callback(n);
		});
	}
 };
 
/**
 * Get an array of all notes
 * @param {function} callback Callback function
 */
cora.getAllNotes = function ( callback )
{
	cora.Note.all().list(callback);
};

/**
 * Instantiate a new Tag object and track via persistence
 * @param {string} name Name of the tag
 * @return {object} New tag object
 */
cora.createTag = function ( name )
{
	var tag = new cora.Tag({name: name});
	cora.persistence.add(tag);
	cora.EntityCache.add(tag);
	return tag;
};

/**
 * Remove a Tag object
 * @param {object} tag Tag to remove
 */
cora.removeTag = cora.removeEntity;

/**
 * Get tag given a name
 * @param {string} name Name of the tag
 * @param (function} callback Callback function
 */
cora.getTagByName = function ( name, callback )
{
	cora.Tag.all().filter('name', '=', name).one(function (t) {
		if (t !== null) cora.EntityCache.add(t);
		callback(t);
	});
};

/**
 * Get an array of all tags
 * @param {function} callback Callback function
 */
cora.getAllTags = function ( callback )
{
	cora.Tag.all().list(callback);
};

/**
 * Flush object graph to database
 * @param {function} [callback] Callback function
 */
cora.flush = persistence.flush;

/**
 * Controller object for jquery mobile router.
 */
cora.Controller = {
	/*
	 * Default action
	 */
	defaultAction: function ( type, match, ui )
	{console.log('cora: default');
	},
	/*
	 * #home
	 */
	onShowHome: function ( type, match, ui)
	{console.log('cora: onShowHome');
		cora.getAllStudents(function (students) {
			var html = '';
			for (var i=0; i<students.length; i++)
			{
				var s = students[i];
				html += '<li><a href="#student?id='+s.id+'">'+
					s.lastName+', '+s.firstName+'</a></li>';
			}
			$('#home div[data-role="content"] > ul').html(html);
			$('#home div[data-role="content"] > ul').listview('refresh');
		});
	},
	/*
	 * #student-form
	 */
	onBeforeShowStudentForm: function ( type, match, ui )
	{console.log('cora: onBeforeShowStudentForm');
		$('#student-form-form').submit(cora.Controller.onSubmitStudentForm);
		// Reset form fields
		$('#student-form-form input').attr('value', '');
		$('#student-form-form label').removeClass('form-validation-error');
		var sid;
		if (match.length > 1)
		{
			var params = cora.Router.getParams(match[1]);
			sid = params.sid;
		}
		if (typeof sid === 'undefined' || sid === '')
		{
			// new student
			$('#student-form h1').html('Add student');
		}
		else
		{
			// editing student
			$('#student-form h1').html('Edit student');
			cora.getStudentById(sid, function (student) {
				if (student !== null)
				{
					$('#student-form-student-id').attr('value', student.id);
					$('#student-form-firstname').attr('value', student.firstName);
					$('#student-form-lastname').attr('value', student.lastName);
				}
				else
				{
					$.mobile.changePage('#dialog-object-doesnt-exist', {
						transition: 'pop',
						reverse: false,
						changeHash: false
					});
				}
			});
		}
	},
	/*
	 * #student-form submission
	 */
	onSubmitStudentForm: function ()
	{console.log('cora: onSubmitStudentForm');
		$('#student-form-form label').removeClass('form-validation-error');
		var studentId = $('#student-form-student-id').attr('value');
		var firstName = $('#student-form-firstname').attr('value');
		var lastName = $('#student-form-lastname').attr('value');
		if (firstName != '' && lastName != '')
		{
			if (studentId != '')
			{
				cora.getStudentById(studentId, function (student) {
					student.firstName = firstName;
					student.lastName = lastName;
					persistence.flush(function () {
						$.mobile.changePage('#student?id='+student.id, {
							reverse: true,
							changeHash: false
						});
					});
				});
			}
			else
			{
				var student = cora.createStudent(firstName, lastName);
				persistence.flush(function () {
					$.mobile.changePage('#student?id='+student.id, {
						reverse: true,
						changeHash: false
					});
				});
			}
		}
		else
		{
			if (!firstName)
			{
				$('#student-form-firstname-label').addClass('form-validation-error');
			}
			if (!lastName)
			{
				$('#student-form-lastname-label').addClass('form-validation-error');
			}
		}
		return false;
	},
	/*
	 * #student
	 */
	onBeforeShowStudent: function ( type, match, ui )
	{console.log('cora: onBeforeShowStudent');
		$('#student-button-delete').click(cora.Controller.onDeleteStudent);
		// reset content
		$('#student div[data-role="content"] ul').empty();
		var id = cora.Router.getParams(match[1]).id;
		if (typeof id !== 'undefined')
		{
			cora.getStudentById(id, function (student) {
				if (student !== null)
				{
					$('#student').attr('data-cora-student-id', student.id);
					$('#student-button-edit').attr('href', '#student-form?sid='+student.id);
					$('#student div[data-role="header"] > h1').html(
						student.firstName+' '+student.lastName
					);
					$('#student a#note-button').click(function () {
						$(this).attr('href', '#note-form?sid='+student.id);
					});
					student.notes.order('created', false).list(function (notes) {
						if (notes.length == 0)
						{
							var html = '<p class="message">This student doesn\'t have any notes yet. '+
								'Would you like to <a href="#note-form?sid='+student.id+
								'">add one now</a>?</p>';
							$('#student div[data-role="content"] div#student-notes').html(html);
						}
						else
						{
							var html = '';
							var day = 0;
							for (var i=0; i<notes.length; i++)
							{
								var n = notes[i];
								var d = cora.Date(n.created);
								var cd = d.getCompactDate();
								if (cd != day)
								{
									var day = cd;
									var dd = d.getNoteDate();
									html += '<li data-role="list-divider">'+
										d.getNoteDateAsString()+'</li>';											
								}
								html += '<li><a href="#note?sid='+student.id+'&nid='+n.id+'">'+
									'<p class="note-time">'+d.getNoteTimeAsString()+'</p>'+
									'<p class="note-teaser">'+n.content+'</p></a></li>';
							}
							$('#student div[data-role="content"] #student-notes').html(
								'<ul data-role="listview">'+html+'</ul>'
							);
							$('#student div[data-role="content"] #student-notes ul').listview();
						}
					});
				}
				else
				{
					$.mobile.changePage('#dialog-object-doesnt-exist', {
						transition: 'pop',
						reverse: false,
						changeHash: false
					});
				}
			});
		}
		else
		{
			$.mobile.changePage('#dialog-no-object-specified', {
				transition: 'pop',
				reverse: false,
				changeHash: false
			});
		}		
	},
	/*
	 * delete student
	 */
	onDeleteStudent: function ()
	{console.log('cora: onDeleteStudent');
		var sid = $('#student').attr('data-cora-student-id');
		if (typeof sid !== 'undefined' && sid != '')
		{
			cora.getStudentById(sid, function (student) {
				if (student !== null)
				{
					$('#dialog-confirm-delete-button-delete').click(function () {
						student.notes.forEach(function (note) {
							cora.removeNote(note);
						});
						cora.removeStudent(student);
						persistence.flush(function () {
							$.mobile.changePage('#home', {
								transition: 'pop',
								reverse: true,
								changeHash: false
							});
						});
					});
					$('#dialog-confirm-delete-button-cancel').attr('href',
						'#student?id='+student.id
					);
					$.mobile.changePage('#dialog-confirm-delete', {
						transition: 'pop',
						reverse: true,
						changeHash: false
					});
				}
				else
				{
					$.mobile.changePage('#home', {
						transition: 'pop',
						reverse: true,
						changeHash: false
					});
				}
			});
		}
	},
	/*
	 * #note-form
	 */
	onBeforeShowNoteForm: function ( type, match, ui )
	{console.log('cora: onBeforeShowNoteForm');
		$('#note-form-form').submit(cora.Controller.onSubmitNoteForm);
		// Reset form fields
		$('#note-form-form input').attr('value', '');
		$('#note-content').val('');
		$('#note-form-form label').removeClass('form-validation-error');
		var params = cora.Router.getParams(match[1]);
		var nid = params.nid;
		if (typeof nid === 'undefined' || nid === '')
		{
			/*
			 * We're adding a new note
			 */
			$('#note-form h1').html('Add note');
			var sid = params.sid;
			if (typeof sid !== 'undefined' && sid !== '')
			{
				/*
				 * A student was specified, so retrieve and load into the form
				 */
				cora.getStudentById(sid, function (student) {
					if (student !== null)
					{
						$('#note-form h1').html(
							'Add note for '+student.firstName+' '+student.lastName
						);
						$('#note-form-student-id').attr(
							'value', student.id
						);
						$('#note-form-student-name').attr(
							'value', student.firstName+' '+student.lastName
						);
						$('#note-form-student-name').attr(
							'disabled', 'disabled'
						);
					}
					else
					{
						$.mobile.changePage('#dialog-object-doesnt-exist', {
							transition: 'pop',
							reverse: false,
							changeHash: false
						});
					}
				});
			}
		}
		else
		{
			/*
			 * We're editing a note
			 */
			$('#note-form h1').html('Edit note');
			cora.getNoteById(nid, function (note) {
				if (note !== null)
				{
					note.fetch('student', function (student) {
						$('#note-form-note-id').attr('value', note.id);
						$('#note-form-student-name').attr(
							'value', student.firstName+' '+student.lastName
						);
						$('#note-form-student-name').attr('disabled', 'disabled');
						$('#note-form-content').attr('value', note.content);
						note.tags.list(function (tags) {
							var taglist = [];
							for (var i=0; i<tags.length; i++) taglist.push(tags[i].name);
							$('#note-form-tags').attr('value', taglist.join(', '));
						});
					});
				}
				else
				{
					$.mobile.changePage('#dialog-object-doesnt-exist', {
						transition: 'pop',
						reverse: false,
						changeHash: false
					});
				}
			});
		}
	},
	/*
	 * #note-form submission
	 */
	onSubmitNoteForm: function (e)
	{console.log('cora: onSubmitNoteForm');
		e.preventDefault();
		$('#note-form-form label').removeClass('form-validation-error');
		var noteId = $('#note-form-note-id').attr('value');
		var studentId = $('#note-form-student-id').attr('value');
		var formTags = $('#note-form-tags').attr('value');
		var content = $('#note-form-content').val();
		if ((noteId !== '' && content !== '') 
			|| (!noteId && studentId !== '' && content !== ''))
		{
			/*
			 * No empty fields
			 */
			if (typeof noteId !== 'undefined' && noteId != '')
			{
				cora.getNoteById(noteId, function (note) {
					if (note !== null)
					{
						note.content = content;
						cora.getAllTags(function (allTags) {
							note.tags.list(function (noteTags) {
								formTags = formTags.split(',');
								/*
								 * TODO
								 * would be nice to avoid having to loop through all
								 * the tags, rather, just call getTagByName() or
								 * maybe something like tagExists()
								 */
								// loop through tags in the form
								for (var i=0; i<formTags.length; i++)
								{
									var tname = formTags[i].trim();
									var found = false;
									// compare submitted tag with existing tags
									for (var j=0; j<noteTags.length; j++)
									{
										if (noteTags[j].name === tname)
										{
											// tag already attached to the note
											found = true;
											break;
										}
									}
									if (found === false)
									{
										// this submitted tag is new
										var tag;
										// compare this new tag with all existing tags
										for (var j=0; j<allTags.length; j++)
										{
											if (allTags[i].name === tname)
											{
												// this tag exists as an entity
												found = true;
												tag = allTags[i];
												break;
											}
										}
										if (found === false)
										{
											// submitted tag doesn't exist as an entity...
											// so we create a new entity for it
											tag = cora.createTag(tname);
										}
										// finally we add it to the tag
										note.tags.add(tag);
									}
								}
								cora.persistence.flush(function () {
									note.fetch('student', function (student) {
										$.mobile.changePage('#note?sid='+student.id+'&nid='+note.id, {
											reverse: true,
											changeHash: false
										});
									});
								});
							});
						});
					}
					else
					{
						$.mobile.changePage('#dialog-object-doesnt-exist', {
							transition: 'pop',
							reverse: false,
							changeHash: false
						});
					}
				});
			}
			else
			{
				/*
				 * New note
				 */
				cora.getStudentById(studentId, function (student) {
					if (student !== null)
					{
						cora.getAllTags(function (tags)
						{
							var note = cora.createNote(student, content);
							if (formTags !== '')
							{
								formTags = formTags.split(',');
								for (var i=0; i<formTags.length; i++)
								{
									var tname = formTags[i].trim();
									var tag;
									for (var j=0; j<tags.length; j++)
									{
										if (tags[j].name === tname)
										{
											tag = tags[j];
											break;
										}
									}
									if (typeof tag === 'undefined')
									{
										tag = cora.createTag(tname);
										
									}
									note.tags.add(tag);
								}
							}
							cora.persistence.flush(function () {
								$.mobile.changePage('#student?id='+student.id,{reverse: true});
							});
						});
					}
				});
			}
		}
		else
		{
			/*
			 * One or more required fields were empty
			 */
			if (!studentId)
			{
				$('#note-form-student-name-label').addClass('form-validation-error');
			}
			if (!content)
			{
				$('#note-form-content-label').addClass('form-validation-error');
			}
		}		
		return false;
	},
	/*
	 * #note
	 */
	onBeforeShowNote: function ( type, match, ui )
	{console.log('cora: onBeforeShowNote');
		$('#note-button-delete').click(cora.Controller.onDeleteNote);
		var params = cora.Router.getParams(match[1]);
		var sid = params.sid;
		var nid = params.nid;
		var student = cora.EntityCache.get(sid);
		if (typeof nid !== 'undefined' && nid !== '')
		{
			cora.getNoteById(nid, function (note) {
				if (note !== null)
				{
					$('#note').attr('data-cora-note-id', note.id);
					$('#note p.note-student').html(
						student.firstName+' '+student.lastName
					);
					var d = cora.Date(note.created);
					$('#note p.note-created').html(
						d.getNoteDateAsString()+' @ '+d.getNoteTimeAsString()
					);
					note.tags.list(function (tags) {
						var taglist = [];
						for (var i=0; i<tags.length; i++) taglist.push(tags[i].name);
						$('#note p.note-tags').html('Tags: '+taglist.join(', '));
					});
					$('#note p.note-content').html(note.content);
					$('#note-button-edit').attr('href', '#note-form?nid='+nid);
				}
				else
				{
					$.mobile.changePage('#dialog-object-doesnt-exist', {
						transition: 'pop',
						reverse: false,
						changeHash: false
					});				
				}
			});
		}
		else
		{
			$.mobile.changePage('#dialog-no-object-specified', {
				transition: 'pop',
				reverse: false,
				changeHash: false
			});
		}
	},
	/*
	 * delete note
	 */
	onDeleteNote: function ()
	{console.log('cora: onDeleteNote');
		var nid = $('#note').attr('data-cora-note-id');
		if (typeof nid !== 'undefined' && nid != '')
		{
			cora.getNoteById(nid, function (note) {
				if (note !== null)
				{
					$('#dialog-confirm-delete-button-delete').click(function () {
						cora.removeNote(note);
						persistence.flush(function () {
							$.mobile.changePage('#student', {
								transition: 'pop',
								reverse: true,
								changeHash: false
							});
						});
					});
					$('#dialog-confirm-delete-button-cancel').attr('href',
						'#note?nid='+student.id
					);
					$.mobile.changePage('#dialog-confirm-delete', {
						transition: 'pop',
						reverse: true,
						changeHash: false
					});
				}
				else
				{
					$.mobile.changePage('#home', {
						transition: 'pop',
						reverse: true,
						changeHash: false
					});
				}
			});
		}
	}
};

/**
 * Initialize the persistence layer
 * @param {function} callback Callback function
 * @param {object} [config] Alternate configuration parameters
 */
cora.initialize = function ( callback, config )
{
	$.mobile.defaultPageTransition = 'slide';
	cora.EntityCache = cora.EntityCacheConstructor();
	cora.Router = new $.mobile.Router([
		{'#home': 'onShowHome'},
		{'#student-form([?].*)': {events: 'bs', handler: 'onBeforeShowStudentForm'}},
		{'#student-form$': {events: 'bs', handler: 'onBeforeShowStudentForm'}},
		{'#student([?].*)': {events: 'bs', handler: 'onBeforeShowStudent'}},
		{'#note-form([?].*)': {events: 'bs', handler: 'onBeforeShowNoteForm'}},
		{'#note([?].*)': {events: 'bs', handler: 'onBeforeShowNote'}},
		{'defaultHandler': 'defaultAction'}
	], cora.Controller);
	/*
	 * Setup persistence
	 */
	callback = callback || function () {};
	config = config || {
		database: 'cora',
		description: 'cora app local storage',
		size: 5 * 1024 * 1024 //5MB
	};
	cora.persistence.store.websql.config(
		cora.persistence, config.database, config.description, config.size
		);
	/*
	 * Define the entity objects
	 */
	cora.Student = persistence.define('Student', {
		firstName: 'TEXT',
		lastName: 'TEXT'
	});
	cora.Note = persistence.define('Note', {
		created: 'DATE',
		content: 'TEXT'
	});
	cora.Tag = persistence.define('Tag', {
		name: 'TEXT'
	});
	cora.Student.index(['firstName', 'lastName'], {unique: true});
	cora.Student.hasMany('notes', cora.Note, 'student');
	cora.Student.hasMany('tags', cora.Tag, 'students');
	cora.Note.hasMany('tags', cora.Tag, 'notes');
	cora.Tag.hasMany('students', cora.Student, 'tags');
	cora.Tag.hasMany('notes', cora.Note, 'tags');
	/*
	 * Synch the definitions with the persistence layer
	 * TODO: make this a one-time thing (during first-run)
	 */
	cora.persistence.schemaSync(callback);
};