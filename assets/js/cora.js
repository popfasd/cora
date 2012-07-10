/**
 * CORA - Classroom Observation Recording Application
 * Copyright (C) 2012  POPFASD (Provincial Outreach Program for Fetal
 * Alcohol Spectrum Disorder)
 * 
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 * 
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 * 
 * http://fasdoutreach.ca/~cora/LICENSE.TXT
 *
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
 * @constructor
 * @param {object} [date] A date string
 */
cora.Date = function ( string )
{
	var date = new Date(string);
	var months = [
		'January', 'February', 'March', 'April', 'May', 'June',
		'July', 'August', 'September', 'Octoboer', 'November', 'December'
		];
	var days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
	var that = {};
	/**
	* Return an object with properties: hours, minutes and meridiem (ante/AM, or post/PM)
	* @return {object}
	*/
	that.getNoteTime = function ()
	{
		var h = date.getHours();
		var meridiem = 'AM';
		var m = date.getMinutes();
		if (h > 12)
		{
			meridiem = 'PM';
			h -= 12;
		}
		if (h == 0) h = 12;
		if (m < 10) m = '0'+m;
		return {hours: h, minutes: m, meridiem: meridiem};
	};
	/**
	 * Return a string in the format "HH:mm [AM/PM]"
	 * @return {string}
	 */
	that.getNoteTimeAsString = function ()
	{
		var t = that.getNoteTime();
		return t.hours+':'+t.minutes+' '+t.meridiem;
	};
	/**
	 * Return an object with properties: dayOfWeekName, monthName, dayOfMonth and year
	 * @return {object}
	 */
	that.getNoteDate = function ()
	{
		return {
			dayOfWeekName: days[date.getDay()],
			monthName: months[date.getMonth()],
			dayOfMonth: date.getDate(),
			year: date.getFullYear()
			};
	};
	/**
	 * Return a string in the format "dayOfWeek, monthName dayofMonth, year"
	 * @return {string}
	 */
	that.getNoteDateAsString = function ()
	{
		var d = that.getNoteDate();
		return d.dayOfWeekName+', '+d.monthName+' '+d.dayOfMonth+', '+d.year;
	};
	/**
	 * Return a number derived from a date in the format yyyymmdd
	 * @return {number}
	 */
	that.getCompactDate = function ()
	{
		return date.getFullYear()+(date.getMonth()+1)+date.getDate();
	};
	return that;
};

/**
 * EntityCacheConstructor object
 * Caches entities for use across sequential screen loads
 * @constructor
 * @return {object} Instance of EntityCache
 */
cora.EntityCacheConstructor = function ()
{
	var cache = {};
	var that = {};
	/**
	 * Check if an entity is cached
	 * @return {bool} Return true if entity is cached, false if it isn't
	 */
	that.isCached = function ( o )
	{
		if (typeof o === 'object' && o !== null) o = o.id;
		if (typeof cache[o] !== 'undefined') return true;
		else return false;
	};
	/**
	 * Add an entity to the cache
	 * @param {object} o Entity to cache
	 */
	that.add = function ( o )
	{
		if (o !== null && !that.isCached(o))
		{
			console.log('cora: entity cache: added '+o.id);
			cache[o.id] = o;
		}
	};
	/**
	 * Remove an entity from the cache
	 * @param {object} o Entity to remove
	 */
	that.remove = function ( o )
	{
		console.log('cora: entity cache: removed '+o.id);
		if (that.isCached(o)) delete cache[o.id];
	};
	/**
	 * Clear all entities from the cache
	 */
	that.clear = function ()
	{
		console.log('cora: entity cache: cleared');
		cache = [];
	};
	/**
	 * Remove all entities from the cache except the specified one
	 * @param {object} o The entity that shouldn't be removed
	 */
	that.removeAllExcept = function ( o )
	{
		console.log('cora: entity cache: removed all except '+o.id);
		cache = [];
		cache[o.id] = o;
	};
	/**
	 * Get an entity from the cache. If the entity hasn't been cached then
	 * the value of the parameter passed to the callback will be false
	 * @param {string} id Entity ID
	 * @param {function} callback Callback function
	 */
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
 * Get tag given an ID
 * @param {string} id ID of the tag to get
 * @param {function} callback Callback function
 */
 cora.getTagById = function ( id, callback )
 {
	if (cora.EntityCache.isCached(id))
	{
		cora.EntityCache.get(id, callback);
	}
	else
	{
		cora.Tag.load(id, function (t) {
			cora.EntityCache.add(t);
			callback(t);
		});
	}
 };
 
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
 * Suggest tags to the user based on what they've type so far
 */
cora.suggestTagsTimeout = null;
cora.suggestTags = function (inputValue)
{
	var inTags = inputValue.split(',');
	for (var i=0; i<inTags.length; i++) inTags[i] = inTags[i].trim();
	var tag = inTags.pop();
	if (tag != '')
	{
		cora.Tag.all().filter('name', 'like', tag+'%').list(function (tags) {
			$('#note-form-tags-suggestions ul').empty();
			var numSuggestions = 0;
			var maxSuggestions = 5;
			for (var i=0; i<tags.length; i++)
			{
				var found = false;
				for (var j=0; j<inTags.length; j++)
				{
					console.log(inTags[j].toLowerCase()+' = '+tags[i].name.toLowerCase());
					if (inTags[j].toLowerCase() == tags[i].name.toLowerCase())
					{
						console.log('matched, so not suggesting');
						found = true;
						break;
					}
				}
				if (found === false)
				{
					console.log('suggesting '+tags[i].name);
					if (numSuggestions < maxSuggestions)
					{
						numSuggestions++;
						$('#note-form-tags-suggestions ul').append(
							'<li><a href="#">'+tags[i].name+'</li>'
						);
					}
					else
					{
						break;
					}
				}
			}
			/*$('#note-form-tags-suggestions ul').listview('refresh');*/
			$('#note-form-tags-suggestions ul').show();
			cora.suggestTagsTimeout = null;
			$('#note-form-tags-suggestions a').click(function (e) {
				e.preventDefault();
				e.stopImmediatePropagation();
				var tag = $(this).html();
				var taglist = $('#note-form-tags').attr('value');
				taglist = taglist.split(',');
				for (var i=0; i<taglist.length; i++) taglist[i] = taglist[i].trim();
				taglist.pop();
				taglist.push(tag);
				$('#note-form-tags').attr('value', taglist.join(', '));
				$('#note-form-tags-suggestions ul').hide();
			});
		});
	}
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
	/**
	 * Default action
	 */
	defaultAction: function ( type, match, ui )
	{
	},
	/**
	 * #home
	 */
	onShowHome: function ( type, match, ui)
	{
		$('#home form.ui-listview-filter input[data-type="search"]').attr('value', '');
		$('#home form.ui-listview-filter a.ui-input-clear').addClass('ui-input-clear-hidden');
		cora.getAllStudents(function (students) {
			/*
			 * Determine sort order of list
			 */
			if (students.length !== 0)
			{
				var student = students[0];
				if (student.firstName == '' || student.lastName === '' || student.lastName.length < 1)
				{
					students.sort(function (a, b) {
						if (a.firstName > b.firstName)
						{
							return 1;
						}
						else if (a.firstName < b.firstName)
						{
							return -1;
						}
						else
						{
							return 0;
						}
					});
				}				
			}
			var html = '';
			for (var i=0; i<students.length; i++)
			{
				var s = students[i];
				var name = '';
				if (s.lastName.length <= 1)
				{
					name = s.firstName+' '+s.lastName;
				}
				else
				{
					name = s.lastName+', '+s.firstName;
				}
				html += '<li><a href="#student?sid='+s.id+'">'+name+'</a></li>';
			}
			$('#home div[data-role="content"] > ul').html(html);
			$('#home div[data-role="content"] > ul').listview('refresh');
		});
	},
	/**
	 * #student-form
	 */
	onBeforeShowStudentForm: function ( type, match, ui )
	{
		$('#student-form-form').submit(cora.Controller.onSubmitStudentForm);
		// Reset form fields
		$('#student-form-form input').attr('value', '');
		$('#student-form-form label').removeClass('form-validation-error');
		var studentId;
		if (match.length > 1)
		{
			var params = cora.Router.getParams(match[1]);
			studentId = params.sid;
		}
		if (typeof studentId === 'undefined' || studentId === '')
		{
			// new student
			$('#student-form h1').html('Add student');
			$('#student-form-button-cancel').attr('href', '#home');
		}
		else
		{
			$('#student-form-button-cancel').attr('href', '#student?sid='+studentId);
			// editing student
			$('#student-form h1').html('Edit student');
			cora.getStudentById(studentId, function (student) {
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
	/**
	 * #student-form submission
	 */
	onSubmitStudentForm: function ( e )
	{
		e.preventDefault();
		e.stopImmediatePropagation();
		$('#student-form-form label').removeClass('form-validation-error');
		var studentId = $('#student-form-student-id').attr('value');
		var firstName = $('#student-form-firstname').attr('value');
		var lastName = $('#student-form-lastname').attr('value');
		if (firstName != '')
		{
			if (studentId != '')
			{
				cora.getStudentById(studentId, function (student) {
					student.firstName = firstName;
					student.lastName = lastName;
					persistence.flush(function () {
						$.mobile.changePage('#student?sid='+student.id, {
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
					$.mobile.changePage('#student?sid='+student.id, {
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
		}
	},
	/**
	 * #student
	 */
	onBeforeShowStudent: function ( type, match, ui )
	{
		$('#student-button-delete').click(function (e) {
			e.preventDefault();
			e.stopImmediatePropagation();
			var studentId = $('#student').attr('data-cora-student-id');
			if (typeof studentId !== 'undefined')
			{
				$.mobile.changePage('#dialog-confirm-delete?sid='+studentId, {
					transition: 'pop',
					reverse: true,
					changeHash: false
				});
			}
			return false;
		});
		// reset content
		$('#student div[data-role="content"] ul').empty();
		var studentId = cora.Router.getParams(match[1]).sid;
		if (typeof studentId !== 'undefined')
		{
			cora.getStudentById(studentId, function (student) {
				if (student !== null)
				{
					$('#student').attr('data-cora-student-id', student.id);
					$('#student-button-edit').attr('href', '#student-form?sid='+student.id);
					$('#student div[data-role="header"] > h1').html(
						student.firstName+' '+student.lastName
					);
					$('#student-button-note').attr('href', '#note-form?sid='+student.id);
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
	/**
	 * delete student
	 */
	onDeleteStudent: function ( e )
	{
		e.preventDefault();
		e.stopImmediatePropagation();
		var studentId = $('#student').attr('data-cora-student-id');
		if (typeof studentId !== 'undefined' && studentId != '')
		{
			cora.getStudentById(studentId, function (student) {
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
						'#student?sid='+student.id
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
		return false;
	},
	/**
	 * #note-form
	 */
	onBeforeShowNoteForm: function ( type, match, ui )
	{
		// setup tag suggestions
		$('#note-form-tags-suggestions ul').empty();
		$('#note-form-tags').keyup(function (e) {
			e.preventDefault();
			e.stopImmediatePropagation();
			var inputValue = $(this).attr('value');
		    if (cora.suggestTagsTimeout !== null)
			{
				clearTimeout(cora.suggestTagsTimeout);
			}
			cora.suggestTagsTimeout = setTimeout('cora.suggestTags("'+inputValue+'")', 200);
		});
		$('#note-form *').focusin(function () {
			$('#note-form-tags-suggestions ul').hide();
		});
		// bind to submit
		$('#note-form-form').submit(cora.Controller.onSubmitNoteForm);
		// Reset form fields
		$('#note-form-form input').attr('value', '');
		$('#note-form-content').val('');
		$('#note-form-form label').removeClass('form-validation-error');
		var params = cora.Router.getParams(match[1]);
		var noteId = params.nid;
		if (typeof noteId === 'undefined' || noteId === '')
		{
			/*
			 * We're adding a new note
			 */
			$('#note-form h1').html('Add note');
			var studentId = params.sid;
			if (typeof studentId !== 'undefined' && studentId !== '')
			{
				/*
				 * A student was specified, so retrieve and load into the form
				 */
				cora.getStudentById(studentId, function (student) {
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
						$('#note-form-button-back').attr('href', '#student?sid='+studentId);
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
			cora.getNoteById(noteId, function (note) {
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
	/**
	 * #note-form submission
	 */
	onSubmitNoteForm: function ( e )
	{
		e.preventDefault();
		e.stopImmediatePropagation();
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
									if (formTags[1] == '') continue;
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
								$.mobile.changePage('#student?sid='+student.id,{reverse: true});
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
	/**
	 * #note
	 */
	onBeforeShowNote: function ( type, match, ui )
	{
		$('#note-button-delete').click(function (e) {
			e.preventDefault();
			e.stopImmediatePropagation();
			var noteId = $('#note').attr('data-cora-note-id');
			var studentId = $('#note').attr('data-cora-student-id');
			if (typeof noteId !== 'undefined' && noteId != '')
			{
				$.mobile.changePage('#dialog-confirm-delete?nid='+noteId+'&sid='+studentId, {
					transition: 'pop',
					reverse: false,
					changeHash: false
				});
			}
			return false;
		});
		var params = cora.Router.getParams(match[1]);
		var studentId = params.sid;
		var noteId = params.nid;
		$('#note-button-back').attr('href', '#student?sid='+studentId);
		var student = cora.EntityCache.get(studentId);
		if (typeof noteId !== 'undefined' && noteId !== '')
		{
			cora.getNoteById(noteId, function (note) {
				if (note !== null)
				{
					$('#note').attr('data-cora-note-id', note.id);
					$('#note').attr('data-cora-student-id', student.id);
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
					$('#note p.note-content').html(note.content.replace(/\n\n/g, '</p><p>').replace(/\n/g, '<br />'));
					$('#note-button-edit').attr('href', '#note-form?nid='+noteId);
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
	/**
	 * #dialog-confirm-delete
	 */
	onBeforeShowDialogConfirmDelete: function ( type, match, ui )
	{
		var params = cora.Router.getParams(match[1]);
		var noteId = params.nid;
		var studentId = params.sid;
		if (typeof noteId !== 'undefined')
		{
			$('#dialog-confirm-delete-button-delete').attr('data-cora-note-id', noteId);
			$('#dialog-confirm-delete-button-delete').attr('data-cora-student-id', studentId);
			$('#dialog-confirm-delete-button-cancel').attr('href', '#note?nid='+noteId+'&sid='+studentId);
			$('#dialog-confirm-delete-button-delete').click(function (e) {
				var noteId = $(this).attr('data-cora-note-id');
				var studentId = $(this).attr('data-cora-student-id');
				e.preventDefault();
				e.stopImmediatePropagation();
				cora.getNoteById(noteId, function (note) {
					cora.removeNote(note);
					persistence.flush(function () {
						$.mobile.changePage('#student?sid='+studentId, {
							transition: 'pop',
							reverse: true,
							changeHash: true
						});
					});
					return false;
				});
			});
		}
		else if (typeof studentId !== 'undefined')
		{
			$('#dialog-confirm-delete-button-delete').attr('data-cora-student-id', studentId);
			$('#dialog-confirm-delete-button-cancel').attr('href', '#student?sid='+studentId);
			$('#dialog-confirm-delete-button-delete').click(function (e) {
				var studentId = $(this).attr('data-cora-student-id');
				e.preventDefault();
				e.stopImmediatePropagation();
				cora.getStudentById(studentId, function (student) {
					cora.removeStudent(student);
					persistence.flush(function () {
						$.mobile.changePage('#home', {
							transition: 'pop',
							reverse: true,
							changeHash: true
						});
					});
					return false;
				});
			});
		}
	},
	/**
	 * #options-export-data
	 */
	onBeforeShowExportData: function ( type, match, ui )
	{
		// check if browser supports File API, particularly FileWriter
		if (typeof(FileWriter) !== 'undefined')
		{
		}
		// just dump the data into a textarea and have the user copy and paste
		else
		{
			cora.getAllStudents(function (students) {
				$('#options-export-data-textarea').append(
					'"First name", "Last name", "Date", "Tags", "Note"\r\n'
				);
				for (var s=0; s<students.length; s++)
				{
					var student = students[s];
					student.notes.list(function (notes) {
						for (var n=0; n<notes.length; n++)
						{
							var note = notes[n];
							note.tags.list(function (tags) {
								var data = '';
								data += '"' + student.firstName + '", "' + student.lastName + '"';
								data += ', "' + (new cora.Date(note.created)).getNoteDateAsString() + '"';
								var taglist = [];
								for (var t = 0; t<tags.length; t++)
								{
									taglist.push(tags[t].name);
								}
								data += ', "' + taglist.join(';') + '"';
								data += ', "' + note.content + '"';
								data += '\r\n';
								$('#options-export-data-textarea').append(data);
							});
						}
					});
				}
			});
		}
	},
	/**
	 * #options-manage-tags
	 */
	onBeforeShowManageTags: function ( type, match, ui )
	{
		$('#options-manage-tags ul').empty();
		cora.getAllTags(function (tags) {
			for (var t=0; t<tags.length; t++)
			{
				var tag = tags[t];
				$('#options-manage-tags ul').append(
					'<li><a href="#options-manage-tags-view?tid='+tag.id+'">'+tag.name+'</a></li>'
				);
			}
			$('#options-manage-tags ul').listview('refresh');
		});
	},
	/**
	 * #options-manage-tags-view
	 */
	onBeforeShowManageTagsView: function ( type, match, ui )
	{
		$('#options-manage-tags-form').submit(cora.Controller.onSubmitShowManageTagsForm);
		var params = cora.Router.getParams(match[1]);
		var tagId = params.tid;
		$('#options-manage-tags-form-tag-id').val(tagId);
		cora.getTagById(tagId, function (tag) {
			$('#options-manage-tags-form-tag-name').val(tag.name);
		});
	},
	/**
	 * #options-manage-tags-form submission
	 */
	onSubmitShowManageTagsForm: function ( e )
	{
		var tagId = $('#options-manage-tags-form-tag-id').attr('value');
		var tagName = $('#options-manage-tags-form-tag-name').attr('value');
		console.log('tag id: '+tagId);
		if (tagName != '')
		{
			cora.getTagById(tagId, function (tag) {
				tag.name = tagName;
				cora.persistence.flush(function () {
					$.mobile.changePage('#options-manage-tags', {
						reverse: true,
						changeHash: false
					});
				});
			});
		}
		else
		{
			$('#options-manage-tags-form-tag-name-label').addClass('form-validation-error');
		}
	},
};

/**
 * Initialize the persistence layer
 * @param {function} callback Callback function
 * @param {object} [config] Alternate configuration parameters
 */
cora.initialize = function ( callback, config )
{
	$.mobile.allowCrossDomainPages = true;
	$.mobile.defaultPageTransition = 'slide';
	cora.EntityCache = cora.EntityCacheConstructor();
	cora.Router = new $.mobile.Router([
		{'#home': 'onShowHome'},
		{'#student-form([?].*)': {events: 'bs', handler: 'onBeforeShowStudentForm'}},
		{'#student-form$': {events: 'bs', handler: 'onBeforeShowStudentForm'}},
		{'#student([?].*)': {events: 'bs', handler: 'onBeforeShowStudent'}},
		{'#note-form([?].*)': {events: 'bs', handler: 'onBeforeShowNoteForm'}},
		{'#note([?].*)': {events: 'bs', handler: 'onBeforeShowNote'}},
		{'#options-export-data': {events: 'bs', handler: 'onBeforeShowExportData'}},
		{'#options-manage-tags$': {events: 'bs', handler: 'onBeforeShowManageTags'}},
		{'#options-manage-tags-view([?].*)': {events: 'bs', handler: 'onBeforeShowManageTagsView'}},
		{'#dialog-confirm-delete([?].*)': {events: 'bs', handler: 'onBeforeShowDialogConfirmDelete'}},
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