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
 * http://cora.fasdoutreach.ca/LICENSE.txt
 *
 * @author Matt Ferris <mferris@sd57.bc.ca>
 * @version 1.0
 */

/*
 * Quiet all console.log messages
 */
//console.log = function () {};
 
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
cora.suggestTags = function (inputValue, formId)
{
	var inTags = inputValue.split(',');
	for (var i=0; i<inTags.length; i++) inTags[i] = inTags[i].trim();
	var tag = inTags.pop();
	if (tag != '')
	{
		cora.Tag.all().filter('name', 'like', tag+'%').list(function (tags) {
			$(formId+'-tags-suggestions ul').empty();
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
						$(formId+'-tags-suggestions ul').append(
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
			$(formId+'-tags-suggestions ul').show();
			cora.suggestTagsTimeout = null;
			$(formId+'-tags-suggestions a').click(function (e) {
				e.preventDefault();
				e.stopImmediatePropagation();
				var tag = $(this).html();
				var taglist = $(formId+'-tags').val();
				taglist = taglist.split(',');
				for (var i=0; i<taglist.length; i++) taglist[i] = taglist[i].trim();
				taglist.pop();
				taglist.push(tag);
				$(formId+'-tags').val(taglist.join(', ')+', ');
                $(formId+'-tags').focus();
				$(formId+'-tags-suggestions ul').hide();
			});
		});
	}
};

/*
 * Exceptions
 */
cora.Exceptions = {
    elementDoesntExist: function ( id ) {
        throw {
            name: 'ElementDoesntExistException',
            message: 'No element exists with ID "'+id+'"'
        }
    },
};

/*
 * View object
 */
cora.View = function (id, my) {
    my = my || {};
    var that = {};
    
    var jq = $('#'+id);
    if (jq.length != 1)
    {
        cora.Exceptions.elementDoesntExist(id);
    }
    my.view = $(jq.get(0));
    my.id = id;
    
    that.data = function ( name, value ) {
        if (arguments.length == 1)
        {
            return my.view.data('cora.data.'+name);
        }
        else if (arguments.length == 2)
        {
            my.view.data('cora.data.'+name, value);
            return that;
        }
        else
        {
            var data = {};
            for (k in my.view.data())
            {
                if (k.indexOf('cora.data.') === 0)
                {
                    data[k.slice(10)] = my.view.data(k);
                }
            }
            return data;
        }
    };
    
    that.clearData = function ( name ) {
        if (!name) {
            foreach (k in my.view.data())
            {
                if (k.indexOf('cora.data.') === 0)
                {
                    my.view.removeData(k);
                }
            }
        }
        else
        {
            my.view.removeData('cora.data.'+name);
        }
        return that;
    };
    
    that.getChild = function ( name ) {
        var jq = $('#'+id+'-'+name);
        if (jq.length != 1)
        {
            cora.Exceptions.elementDoesntExist();
        }
        return $(jq.get(0));
    };
    
    that.getId = function () {
        return my.id;
    };
    
    that.getSelector = function () {
        return '#'+my.id;
    };
    
    that.find = function ( selector ) {
        return my.view.find(selector);
    };
    
    return that;
};

/*
 * PageView
 */
cora.PageView = function ( name, my ) {
    my = my || {};
    var that = cora.View(name, my);

    that.markDirty = function () {
        my.view.data('cora.clean', false);
    };
    
    that.markClean = function () {
        my.view.data('cora.clean', true);
    };
    
    that.isClean = function () {
        var clean = my.view.data('cora.clean');
        if (clean) return true;
        else return false;
    };
    
    return that;
};

/*
 * DialogView
 */
cora.DialogView = function ( name, my ) {
    my = my || {};
    var that = cora.View('dialog-'+name, my);
    
    that.close = function () {
        my.view.dialog('close');
        return that;
    };
    
    return that;
};

/*
 * ControllerAction
 */
cora.ControllerAction = function ( type, match, ui, view, callback ) {
    var that = {};
    that.view = cora.PageView(view);
    that.params = cora.Router.getParams(match[1]) || {};
    callback.call(that);
};

/**
 * Redirect to a different "page"
 * @param {string} url
 * @param {object} options
 */
cora.redirect = function ( url, options )
{
    options = options || {};
    options.transition = options.transition || $.mobile.defaultPageTransition;
    options.reverse = options.reverse || false;
    options.changeHash = options.changeHash || true;

    $.mobile.changePage(url, {
        transition: options.transition,
        reverse: options.reverse,
        changeHash: options.changeHash
    });
};

/**
 * Show a dialog
 * @param {cora.DialogView} dialog
 * @param {object} options
 */
cora.showDialog = function ( dialog, options )
{
    options = options || {};
    options.transition = options.transition || 'pop';
    options.reverse = options.reverse || false;
    options.changeHash = options.changeHash || false;
    
    var parts = [];
    for (k in options.params)
    {
        parts.push(k+'='+options.params[k]);
    }

    cora.redirect(dialog.getSelector()+'?'+parts.join('&'), options);
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
	onShowHome: function ( type, match, ui )
	{
        cora.ControllerAction(type, match, ui, 'home', function () {
            var ctlr = this;
            var view = ctlr.view;

            if (view.isClean())
            {
                console.log('not redrawing #home, nothing changed');
                return;
            }
            
            view.find('form.ui-listview-filter input[data-type="search"]').val('');
            view.find('form.ui-listview-filter a.ui-input-clear').addClass('ui-input-clear-hidden');
            
            cora.getAllStudents(function (students) {
                /*
                 * Determine sort order of list
                 */
                if (students.length !== 0)
                {
                    view.getChild('disclaimer').hide();
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
                view.find('div[data-role="content"] > ul').html(html);
                view.find('div[data-role="content"] > ul').listview('refresh');
            });
            view.markClean();
        });
	},
	/**
	 * #student-form
	 */
	onBeforeShowStudentForm: function ( type, match, ui )
	{
        cora.ControllerAction(type, match, ui, 'student-form', function () {
            var ctlr = this;
            var view = ctlr.view;
            var params = ctlr.params;
            var studentId = params.sid;

            var objectDoesntExistDialog = cora.DialogView('object-doesnt-exist');

            var viewTitle = view.find('h1');
            var form = view.getChild('form');
            var studentIdField = view.getChild('student-id');
            var firstnameField = view.getChild('firstname');
            var lastnameField = view.getChild('lastname');
            var cancelButton = view.getChild('button-cancel');

            // bind submit handler
            form.submit(cora.Controller.onSubmitStudentForm);

            // Reset form fields
            form.find('input').val('');
            form.find('label').removeClass('form-validation-error');

            if (typeof studentId === 'undefined' || studentId === '')
            {
                // new student
                viewTitle.html('Add student');
                cancelButton.attr('href', '#home');
            }
            else
            {
                // editing student
                cancelButton.attr('href', '#student?sid='+studentId);
                viewTitle.html('Edit student');

                cora.getStudentById(studentId, function (student) {
                    if (student !== null)
                    {
                        studentIdField.val(student.id);
                        firstnameField.val(student.firstName);
                        lastnameField.val(student.lastName);
                    }
                    else
                    {
                        cora.showDialog(objectDoesntExistDialog);
                    }
                });
            }
        });
	},
	/**
	 * #student-form submission
	 */
	onSubmitStudentForm: function ( e )
	{
        e.preventDefault();
        e.stopImmediatePropagation();

        var view = cora.PageView('student-form');
        var studentView = cora.PageView('student');
        var homeView = cora.PageView('home');

        var studentIdField = view.getChild('student-id');
        var firstnameField = view.getChild('firstname');
        var lastnameField = view.getChild('lastname');

        view.find('form label').removeClass('form-validation-error');

        var studentId = studentIdField.val();
        var firstName = firstnameField.val();
        var lastName = lastnameField.val();

        if (firstName != '')
        {
            if (studentId != '')
            {
                cora.getStudentById(studentId, function (student) {
                    student.firstName = firstName;
                    student.lastName = lastName;
                    persistence.flush(function () {
                        studentView.markDirty();
                        homeView.markDirty();
                        cora.redirect('#student?sid='+student.id, {
                            reverse: true, changeHash: false
                        });
                    });
                });
            }
            else
            {
                var student = cora.createStudent(firstName, lastName);
                persistence.flush(function () {
                    homeView.markDirty();
                    cora.redirect('#student?sid='+student.id, {
                        reverse: true, changeHash: false
                    });
                });
            }
        }
        else
        {
            if (!firstName)
            {
                view.getChild('firstname-label').addClass('form-validation-error');
            }
        }
	},
	/**
	 * #student
	 */
	onBeforeShowStudent: function ( type, match, ui )
	{
        cora.ControllerAction(type, match, ui, 'student', function () {
            var ctlr = this;
            var view = ctlr.view;
            var params = ctlr.params;
            var studentId = params.sid;
            var savedStudentId = view.data('studentId');

            var confirmDeleteDialog = cora.DialogView('confirm-delete');
            var objectDoesntExistDialog = cora.DialogView('object-doesnt-exist');
            var noObjectSpecifiedDialog = cora.DialogView('no-object-specified');

            var viewTitle = view.find('h1');
            var studentNotes = view.getChild('notes');
            var deleteButton = view.getChild('button-delete');
            var editButton = view.getChild('button-edit');
            var noteButton = view.getChild('button-note');

            // bind click handler
            deleteButton.click(function (e) {
                e.preventDefault();
                e.stopImmediatePropagation();
                if (typeof studentId !== 'undefined')
                {
                    cora.showDialog(confirmDeleteDialog, {
                        params: { sid: studentId },
                        reverse: true
                    });
                }
                return false;
            });

            if (savedStudentId === studentId && view.isClean())
            {
                console.log('not redrawing #student, same student requested');
                return;
            }

            // reset content
            view.find('div[data-role="content"] ul').empty();

            if (typeof studentId !== 'undefined')
            {
                cora.getStudentById(studentId, function (student) {
                    if (student !== null)
                    {
                        view.data('studentId', student.id);
                        viewTitle.html(student.firstName+' '+student.lastName);
                        editButton.attr('href', '#student-form?sid='+student.id);
                        noteButton.attr('href', '#note-form?sid='+student.id);

                        student.notes.order('created', false).list(function (notes) {
                            if (notes.length == 0)
                            {
                                var html = '<p class="message">This student doesn\'t have any notes yet. '+
                                    'Would you like to <a href="#note-form?sid='+student.id+
                                    '">add one now</a>?</p>';
                                studentNotes.html(html);
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
                                studentNotes.html('<ul data-role="listview">'+html+'</ul>');
                                studentNotes.find('ul').listview();
                            }
                        });
                        view.markClean();
                    }
                    else
                    {
                        cora.showDialog(objectDoesntExistDialog);
                    }
                });
            }
            else
            {
                cora.showDialog(noObjectSpecifiedDialog);
            }
        });
	},
	/**
	 * #note-form
	 */
    onBeforeShowNoteForm: function ( type, match, ui )
    {
        cora.ControllerAction( type, match, ui, 'note-form', function () {
            var ctlr = this;
            var view = ctlr.view;
            var params = ctlr.params;
            var studentId = params.sid;
            var noteId = params.nid;

            var confirmCancelDialog = cora.DialogView('confirm-cancel');
            var objectDoesntExistDialog = cora.DialogView('object-doesnt-exist');

            var backButton = view.getChild('button-back');

            var viewTitle = view.find('h1');
            var noteIdField = view.getChild('note-id');
            var studentIdField = view.getChild('student-id');
            var studentNameField = view.getChild('student-name');
            var contentField = view.getChild('content');
            var tagField = view.getChild('tags');
            var tagSuggestionsList = view.getChild('tags-suggestions ul');

            // setup tag suggestions
            tagSuggestionsList.empty();
            tagField.keyup(function (e) {
                e.preventDefault();
                e.stopImmediatePropagation();
                var inputValue = $(this).val();
                if (cora.suggestTagsTimeout !== null)
                {
                    clearTimeout(cora.suggestTagsTimeout);
                }
                cora.suggestTagsTimeout = setTimeout('cora.suggestTags("'+inputValue+'","#note-form")', 200);
            });

            // hide tag suggestions when focus changes to any field
            view.find('*').focusin(function () {
                tagSuggestionsList.hide();
            });
                 
            // bind to submit
            view.getChild('form').submit(cora.Controller.onSubmitNoteForm);
            
            // Reset form fields
            contentField.val('');
            view.find('form :input').val('');
            view.find('form label').removeClass('form-validation-error');
            
            // setup cancel button
            backButton.click(function () {
                view.data('noteText', contentField.val())
                    .data('noteTags', tagField.val());
            });

            // load any saved data
            if (view.data('noteText') || view.data('noteTags'))
            {
                contentField.val(view.data('noteText'));
                tagField.val(view.data('noteTags'));
                view.clearData('noteText').clearData('noteTags');
            }

            if (typeof noteId === 'undefined' || noteId === '')
            {
                /*
                 * We're adding a new note
                 */
                viewTitle.html('Add note');
                if (typeof studentId !== 'undefined' && studentId !== '')
                {
                    // setup cancel dialog
                    confirmCancelDialog
                        .data('nextUrl', '#student?sid='+studentId)
                        .getChild('button-no').attr('href', '#note-form?sid='+studentId);

                    /*
                     * A student was specified, so retrieve and load into the form
                     */
                    cora.getStudentById(studentId, function (student) {
                        if (student !== null)
                        {
                            viewTitle.html(
                                'Add note for '+student.firstName+' '+student.lastName
                            );
                            studentIdField.val(student.id);
                            studentNameField
                                .val(student.firstName+' '+student.lastName)
                                .attr('disabled', 'disabled');
                        }
                        else
                        {
                            cora.showDialog(objectDoesntExistDialog);
                        }
                    });
                }
            }
            else
            {
                /*
                 * We're editing a note
                 */
                viewTitle.html('Edit note');

                // setup cancel dialog
                confirmCancelDialog
                    .data('nextUrl', '#note?sid='+studentId+'&nid='+noteId)
                    .getChild('button-no').attr('href', '#note-form?sid='+studentId+'&nid='+noteId);

                cora.getNoteById(noteId, function (note) {
                    if (note !== null)
                    {
                        note.fetch('student', function (student) {
                            // set noteId and studentId on cancel dialog
                            confirmCancelDialog
                                .data('noteId', note.id)
                                .data('studentId', student.id);
                            noteIdField.val(note.id);
                            studentNameField
                                .val(student.firstName+' '+student.lastName)
                                .attr('disabled', 'disabled');
                            contentField.val(note.content);
                            note.tags.list(function (tags) {
                                var taglist = [];
                                for (var i=0; i<tags.length; i++) taglist.push(tags[i].name);
                                tagField.val(taglist.join(', '));
                            });
                        });
                    }
                    else
                    {
                        cora.showDialog(objectDoesntExistDialog);
                    }
                });
            }
        });
    },
	/**
	 * #note-form submission
	 */
	onSubmitNoteForm: function ( e )
	{
		e.preventDefault();
		e.stopImmediatePropagation();

        var view = cora.PageView('note-form');
        var studentView = cora.PageView('student');
        var manageTagsView = cora.PageView('options-manage-tags');

        var objectDoesntExistDialog = cora.DialogView('object-doesnt-exist');

        // reset validation errors
		view.find('form label').removeClass('form-validation-error');
        
		var noteId = view.getChild('note-id').val();
		var studentId = view.getChild('student-id').val();
		var formTags = view.getChild('tags').val();
		var content = view.getChild('content').val();
        
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
                                // reset the active state of all the tags for the note
                                for (var i=0; i<noteTags.length; i++)
                                {
                                    noteTags[i].active = false;
                                }
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
                                    // skip empty tags
									if (formTags[i] == '') continue;
									var tname = formTags[i].trim();
									var found = false;
									// compare submitted tag with existing tags
									for (var j=0; j<noteTags.length; j++)
									{
										if (noteTags[j].name === tname)
										{
											// tag already attached to the note
											found = noteTags[j].active = true;
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
											if (allTags[j].name === tname)
											{
												// this tag exists as an entity
												found = true;
												tag = allTags[j];
												break;
											}
										}
										if (found === false)
										{
											// submitted tag doesn't exist as an entity...
											// so we create a new entity for it
											tag = cora.createTag(tname);
                                            tag.active = true;
                                            manageTagsView.markDirty();
										}
										// finally we add it to the tag
										note.tags.add(tag);
									}
								}
                                // now we need to remove deleted tags
                                for (var i=0; i<noteTags.length; i++)
                                {
                                    console.log('notetag: '+noteTags[i].name+'.active = '+noteTags[i].active);
                                    // tags that don't have an 'active' attribute or tags
                                    // with 'active' set to false have been deleted
                                    if (noteTags[i].active !== true)
                                    {
                                        note.tags.remove(noteTags[i]);
                                    }
                                }
								cora.persistence.flush(function () {
                                    studentView.markDirty();
									note.fetch('student', function (student) {
										cora.redirect('#note?sid='+student.id+'&nid='+note.id, {
											reverse: true, changeHash: false
										});
									});
								});
							});
						});
					}
					else
					{
						ctlr
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
                                        manageTagsView.markDirty();
										
									}
									note.tags.add(tag);
								}
							}
							cora.persistence.flush(function () {
                                studentView.markDirty();
								cora.redirect('#student?sid='+student.id, { reverse: true });
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
				view.getChild('student-name-label').addClass('form-validation-error');
			}
			if (!content)
			{
				view.getChid('content-label').addClass('form-validation-error');
			}
		}		
		return false;
	},
	/**
	 * #dialog-confirm-cancel
	 */
	onBeforeShowDialogConfirmCancel: function ( type, match, ui )
	{
        cora.ControllerAction(type, match, ui, 'dialog-confirm-cancel', function () {
            var ctlr = this;
            var view = ctlr.view;

            var noButton = view.getChild('button-no');
            var yesButton = view.getChild('button-yes');

            var nextUrl = view.data('nextUrl');

            yesButton.click(function (e) {
                e.preventDefault();
                e.stopImmediatePropagation();
                cora.redirect(nextUrl, { transition: 'pop', reverse: true, changeHash: true });
            });
        });
	},
	/**
	 * #note
	 */
	onBeforeShowNote: function ( type, match, ui )
	{
        cora.ControllerAction(type, match, ui, 'note', function () {
            var ctlr = this;
            var view = ctlr.view;
            var params = ctlr.params;
            var studentId = params.sid;
            var noteId = params.nid;

            var confirmDeleteDialog = cora.DialogView('confirm-delete');
            var objectDoesntExistDialog = cora.DialogView('object-doesnt-exist');
            var noObjectSpecified = cora.DialogView('no-object-specified');

            var deleteButton = view.getChild('button-delete');
            var backButton = view.getChild('button-back');
            var editButton = view.getChild('button-edit');

            var studentContainer = view.find('p.note-student');
            var createdContainer = view.find('p.note-created');
            var contentContainer = view.find('p.note-content');
            var tagsContainer = view.find('p.note-tags');

            deleteButton.click(function (e) {
                e.preventDefault();
                e.stopImmediatePropagation();
                var noteId = view.data('noteId');
                var studentId = view.data('studentId');
                if (typeof noteId !== 'undefined' && noteId != '')
                {
                    cora.showDialog(confirmDeleteDialog, {
                        params: { nid: noteId, sid: studentId }
                    });
                }
                return false;
            });

            backButton.attr('href', '#student?sid='+studentId);

            var student = cora.EntityCache.get(studentId);
            if (typeof noteId !== 'undefined' && noteId !== '')
            {
                cora.getNoteById(noteId, function (note) {
                    if (note !== null)
                    {
                        view.data('noteId', note.id);
                        view.data('studentId', student.id);
                        studentContainer.html(student.firstName+' '+student.lastName);
                        var d = cora.Date(note.created);
                        createdContainer.html(d.getNoteDateAsString()+' @ '+d.getNoteTimeAsString());
                        note.tags.list(function (tags) {
                            var taglist = [];
                            for (var i=0; i<tags.length; i++) taglist.push(tags[i].name);
                            tagsContainer.html('Tags: '+taglist.join(', '));
                        });
                        contentContainer.html(note.content.replace(/\n\n/g, '</p><p>').replace(/\n/g, '<br />'));
                        editButton.attr('href', '#note-form?nid='+noteId);
                    }
                    else
                    {
                        cora.showDialog(objectDoesntExistDialog);			
                    }
                });
            }
            else
            {
                cora.showDialog(noObjectSpecifiedDialog);
            }
        });
	},
	/**
	 * #dialog-confirm-delete
	 */
	onBeforeShowDialogConfirmDelete: function ( type, match, ui )
	{
        cora.ControllerAction(type, match, ui, 'dialog-confirm-delete', function () {
            var ctlr = this;
            var view = ctlr.view;
            var params = ctlr.params;
            var noteId = params.nid;
            var studentId = params.sid;

            var deleteButton = view.getChild('button-delete');
            var cancelButton = view.getChild('button-cancel');

            if (typeof noteId !== 'undefined')
            {
                cancelButton.attr('href', '#note?nid='+noteId+'&sid='+studentId);
                deleteButton.click(function (e) {
                    e.preventDefault();
                    e.stopImmediatePropagation();
                    cora.getNoteById(noteId, function (note) {
                        cora.removeNote(note);
                        persistence.flush(function () {
                            cora.redirect('#student?sid='+studentId, {
                                transition: 'pop', reverse: true
                            });
                        });
                        return false;
                    });
                });
            }
            else if (typeof studentId !== 'undefined')
            {
                cancelButton.attr('href', '#student?sid='+studentId);
                deleteButton.click(function (e) {
                    e.preventDefault();
                    e.stopImmediatePropagation();
                    cora.getStudentById(studentId, function (student) {
                        cora.removeStudent(student);
                        persistence.flush(function () {
                            cora.PageView('home').markDirty();
                            cora.redirect('#home', {
                                transition: 'pop', reverse: true
                            });
                        });
                        return false;
                    });
                });
            }
        });
	},
	/**
	 * #options-export-data
	 */
	onBeforeShowExportData: function ( type, match, ui )
	{
        cora.ControllerAction(type, match, ui, 'options-export-data', function () {
            var ctlr = this;
            var view = ctlr.view;

            var textarea = view.getChild('textarea');
            // check if browser supports File API, particularly FileWriter
            if (typeof(FileWriter) !== 'undefined')
            {
            }
            // just dump the data into a textarea and have the user copy and paste
            else
            {
                cora.getAllStudents(function (students) {
                    textarea.append(
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
                                    textarea.append(data);
                                });
                            }
                        });
                    }
                });
            }
        });
	},
	/**
	 * #options-manage-tags
	 */
	onBeforeShowManageTags: function ( type, match, ui )
	{
        cora.ControllerAction(type, match, ui, 'options-manage-tags', function () {
            var ctlr = this;
            var view = ctlr.view;

            var tagList = view.find('ul');

            if (view.isClean())
            {
                console.log('not redrawing #options-manage-tags, nothing changed');
                return;
            }

            tagList.empty();
            cora.getAllTags(function (tags) {
                for (var t=0; t<tags.length; t++)
                {
                    var tag = tags[t];
                    tagList.append(
                        '<li><a href="#options-manage-tags-view?tid='+tag.id+'">'+tag.name+'</a></li>'
                    );
                }
                tagList.listview('refresh');
                view.markClean();
            });
        });
	},
	/**
	 * #options-manage-tags-view
	 */
	onBeforeShowManageTagsView: function ( type, match, ui )
	{
        cora.ControllerAction(type, match, ui, 'options-manage-tags-view', function () {
            var ctlr = this;
            var view = ctlr.view;
            var params = ctlr.params;
            var tagId = params.tid;

            var form = view.getChild('form');
            var tagIdField = view.getChild('form-tag-id');
            var tagNameField = view.getChild('form-tag-name');

            var deleteButton = view.getChild('button-delete');
            var saveButton = view.getChild('button-save');

            // bind to submit handler
            form.submit(cora.Controller.onSubmitShowManageTagsForm);
            
            saveButton.click(function (e) {
                e.preventDefault();
                form.submit()
            });
            deleteButton.attr('href', '#options-manage-tags-delete?tid='+tagId);

            tagIdField.val(tagId);

            cora.getTagById(tagId, function (tag) {
                tagNameField.val(tag.name);
            });
        });
	},
	/**
	 * #options-manage-tags-form submission
	 */
	onSubmitShowManageTagsForm: function ( e )
	{
        var view = cora.PageView('options-manage-tags-view');

        var tagIdField = view.getChild('form-tag-id');
        var tagNameField = view.getChild('form-tag-name');

		var tagId = tagIdField.val();
		var tagName = tagNameField.val();

		console.log('tag id: '+tagId);
		if (tagName != '')
		{
			cora.getTagById(tagId, function (tag) {
				tag.name = tagName;
				cora.persistence.flush(function () {
                    cora.PageView('options-manage-tags').markDirty();
					cora.redirect('#options-manage-tags', {
						reverse: true, changeHash: false
					});
				});
			});
		}
		else
		{
            view.getChild('form-tag-name-label').addClass('form-validation-error');
		}
	},
	/**
	 * #options-manage-tags-delete
	 */
	onBeforeShowManageTagsDelete: function ( type, match, ui )
	{
        cora.ControllerAction(type, match, ui, 'options-manage-tags-delete', function () {
            var ctlr = this;
            var view = ctlr.view;
            var params = ctlr.params;
            var tagId = params.tid;

            var deleteButton = view.getChild('button-delete');
            var cancelButton = view.getChild('button-cancel');

            cancelButton.attr('href', '#options-manage-tags-view?tid='+tagId);
            deleteButton.attr('href', '#'+tagId);
            deleteButton.click(function (e) {
                e.preventDefault();
                e.stopImmediatePropagation();
                cora.getTagById($(this).attr('href').slice(1), function (t) {
                    cora.removeTag(t);
                    persistence.flush(function () {
                        cora.PageView('options-manage-tags').markDirty();
                        cora.redirect('#options-manage-tags', { reverse: true });
                    });
                });
            });

            cora.getTagById(tagId, function ( tag ) {
                view.getChild('tag-name').html('Tag: <i>'+tag.name+'</i>');
            });
        });
	},
    /**
     * #options-reports
     */
    onBeforeShowReports: function ( type, match, ui )
    {
        cora.ControllerAction(type, match, ui, 'options-reports', function () {
            var ctlr = this;
            var view = ctlr.view;
            var resultsView = cora.PageView('options-reports-results');

            var form = view.getChild('form');
            var tagSuggestionsList = view.getChild('form-tags-suggestions ul');
            var tagsField = view.getChild('form-tags');

            // setup tag suggestions
            tagSuggestionsList.empty();
            tagsField.keyup(function (e) {
                e.preventDefault();
                e.stopImmediatePropagation();
                var inputValue = $(this).val();
                if (cora.suggestTagsTimeout !== null)
                {
                    clearTimeout(cora.suggestTagsTimeout);
                }
                cora.suggestTagsTimeout = setTimeout('cora.suggestTags("'+inputValue+'","#options-reports-form")', 200);
            });
            view.find('*').focusin(function () {
                tagSuggestionsList.hide();
            });
            // bind to submit
            form.submit(function ( e ){       
                var tags = tagsField.val();
                tagsField.val('');
                resultsView.data('tags', tags);
                resultsView.getChild('data').empty();
                cora.Controller.onSubmitReportsForm(e);
            });
        });
    },
    /**
     * #options-reports-results
     */
    onSubmitReportsForm: function ( e )
    {
        e.preventDefault();
        e.stopImmediatePropagation();

        var resultsView = cora.PageView('options-reports-results');
        var formView = cora.PageView('options-reports');

        var criteriaContainer = resultsView.getChild('criteria');
        var dataContainer = resultsView.getChild('data');
        var refineButton = resultsView.getChild('button-refine');

		var formTags = resultsView.data('tags');
        formTags = formTags.split(',');

        refineButton.click(function (e) {
            e.preventDefault();
			e.stopImmediatePropagation();
            formView.getChild('tags').val(resultsView.data('tags'));
            cora.redirect('#options-reports', {
                reverse: true, changeHash: false
            });
        });

        var tagsqc = cora.Tag.all();
        var criteria = [];
        for (var i=0; i<formTags.length; i++)
        {
            var tagName = formTags[i];
            if (tagName == '' || tagName.match(/^\s+$/)) continue
            if (i === 0)
            {
                tagsqc = tagsqc.filter('name', '=', tagName);
            }
            else
            {
                tagsqc = tagsqc.and(new persistence.PropertyFilter('name', '=', tagName));
            }
            criteria.push(tagName);
        }

        // reset content
        criteriaContainer.html(
            'Displaying all notes tagged with <i>'+criteria.join('</i> and <i>')+'</i>'
        );

        tagsqc.list(function (tags) {
            if (tags.length === 0)
            {
                dataContainer.html('<p><i>No matching notes found</i></p>');
            }
            var studentNotesLists = {};
            for (var i=0; i<tags.length; i++)
            {
                var tag = tags[i];
                tag.notes.prefetch('student').list(function (notes) {
                    for (var j=0; j<notes.length; j++)
                    {
                        var note = notes[j];
                        //var studentNotesList = $('#sid-'+note.student.id+' ul');
                        if (typeof studentNotesLists[note.student.id] === 'undefined')
                        {
                            dataContainer.append(
                                '<div id="sid-'+note.student.id+'" data-role="collapsible" data-inset="false">'+
                                '<h2>'+note.student.firstName+' '+note.student.lastName+'</h2>'+
                                '<ul data-role="listview"></ul></div>'
                            );
                            var studentNotes = $('#sid-'+note.student.id);
                            studentNotes.collapsible();
                            studentNotesLists[note.student.id] = studentNotes.find('ul');
                            studentNotesLists[note.student.id].listview();
                        }
                        studentNotesLists[note.student.id].append(
                            '<li>'+
                            '<p class="note-time">'+cora.Date(note.created).getNoteTimeAsString()+'</p>'+
							'<p class="note-teaser">'+note.content+'</p></a></li>'
                        );
                        studentNotesLists[note.student.id].listview('refresh');
                    }
                });               
            }
            cora.redirect('#options-reports-results', {
                reverse: false, changeHash: false
            });
        });
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
		{'#options-reports': {events: 'bs', handler: 'onBeforeShowReports'}},
		{'#options-reports-results([?].*)': {events: 'bs', handler: 'onBeforeShowReportsResults'}},
		{'#options-export-data': {events: 'bs', handler: 'onBeforeShowExportData'}},
		{'#options-manage-tags$': {events: 'bs', handler: 'onBeforeShowManageTags'}},
		{'#options-manage-tags-view([?].*)': {events: 'bs', handler: 'onBeforeShowManageTagsView'}},
		{'#options-manage-tags-delete([?].*)': {events: 'bs', handler: 'onBeforeShowManageTagsDelete'}},
		{'#dialog-confirm-delete([?].*)': {events: 'bs', handler: 'onBeforeShowDialogConfirmDelete'}},
		{'#dialog-confirm-cancel(|[?].*)': {events: 'bs', handler: 'onBeforeShowDialogConfirmCancel'}},
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

    /*
     * Event locking system to prevent multiple clicks from
     * overloading the framework - tinyissue#149
     */
    var eventLocker = function (e) {
        if ($(document).data('cora.locked') === true)
        {
            console.log('locked');
            e.preventDefault();
            e.stopPropagation();
        }
        else
        {
            console.log('locking');
            $(this).data('cora.locked', true);
            setTimeout(function () {
                console.log('unlocking');
                $(document).data('cora.locked', false);
            }, 500);
        }
    };
    if (document.addEventListener)
    {
        // modern browsers
        document.addEventListener('click', eventLocker, true);
    }
    else
    {
        // ie8 and lower
        document.attacheEvent('click', eventLocker);
    }
};