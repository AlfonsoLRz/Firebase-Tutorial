$(document).ready(function() {
	// Initialize Firebase
	var config = {
		apiKey: "AIzaSyDqf__kS8RWO-e2i7rljgvB37jvvwoyWeQ",
		authDomain: "web-based-technologies.firebaseapp.com",
		databaseURL: "https://web-based-technologies.firebaseio.com",
		projectId: "web-based-technologies",
		storageBucket: "",
		messagingSenderId: "557801722520"
	};
	firebase.initializeApp(config);
	console.log(firebase);
	
	// Our database :D
	var db = firebase.database();
	
	// Load users. Not only load those who exists at the start, but also those who are added later.
	db.ref().child('users').on('child_added', function(snapshot) {
		addUser(snapshot.key, snapshot.val().name + ' ' + snapshot.val().lastName, snapshot.val().username, snapshot.val().email);
	});
	
	// Delete users. 
	db.ref().child('users').on('child_removed', function(snapshot) {
		removeUser(snapshot.key);
	});
	
	// Update user information.
	db.ref().child('users').on('child_changed', function(snapshot) {
		updateUser(snapshot.key, snapshot.val().name + ' ' + snapshot.val().lastName, snapshot.val().username, snapshot.val().email);
	});
		
	
	// Create user function .
	$('#createUser').on('click', function(e) {
		// Don't load the page again.
		e.preventDefault();
		
		// Identifier of the alert.
		var idAlert = 'errorCreateUser';
		
		// Reset alert state.
		hideAlert(idAlert);
		
		isUserValid(idAlert, '', false);
		// If an error is being shown, then we can't insert.
		if ($('#' + idAlert).parent('.alert').css('display') == 'block') {
			return;
		}
		
		// Success.
		var users = db.ref('users');
		var data = {
			username: $('#inputUsername').val(),
			name: $('#inputName').val(),
			lastName: $('#inputLastName').val(),
			email: $('#inputEmail').val()
		}
		users.push(data);
		
		// Restart form and notify event.
		window.alert('User ' + $('#inputUsername').val() + ' has been added.');
		cleanInputs('');
	});
	
	
	// Click on collapse buttons. At this moment the div is hidden.
	$(document).on('click', '.fa-chevron-down', function() {
		$(this).removeClass('fa-chevron-down').addClass('fa-chevron-up');
	});

	
	// Click on collapse buttons. At this moment the div is opened.
	$(document).on('click', '.fa-chevron-up', function() {
		$(this).removeClass('fa-chevron-up').addClass('fa-chevron-down');
	});
	
	
	// Remove user form.
	$('#removeUser').on('click', function(e) {
		// Don't load the page again.
		e.preventDefault();
		
		// Identifier of the alert.
		var idAlert = 'errorDeleteUser';
		
		// By default we'll hide the alert.
		hideAlert(idAlert);
		
		isUserValid(idAlert, 'Current', true, true);
		if ($('#' + idAlert).parent('.alert').css('display') == 'block') {
			return;
		}
		
		removeUserDatabase();		
		window.alert('User ' + $('#inputCurrentUsername').val() + ' has been deleted.');
		cleanInputs('Current');
	});
	
	
	// Update user function.
	$('#updateUser').on('click', function(e) {
		// Don't load the page again.
		e.preventDefault();
		
		// Identifier of the alert.
		var idAlert = 'errorUpdateUser';
		
		// By default we will hide the alert.
		hideAlert(idAlert);
		
		isUserValid(idAlert, 'New', true, false);
		if ($('#' + idAlert).parent('.alert').css('display') == 'block') {
			return;
		}
		
		// Update information with the input data
		updateUserDatabase();		
		window.alert('User ' + $('#inputNewUsername').val() + ' has been updated.');
		cleanInputs('New');
	});
	
	
	// OTHER METHODS
	
	// Adds an user in the UI.
	function addUser(id, name, username, email) {
		$('#userContainer').append('<div id=' + id + ' class="card mt-4 ml-2 mr-2" style="width: 18rem;"><div class="card-body"><h5 class="card-title">' + name + '</h5></div><ul class="list-group list-group-flush text-left"><li class="username list-group-item">Username: ' + username + '</li><li class="email list-group-item">Email: ' + email + '</li></ul></div>');
	}
	
	
	// Restart inputs with a certain name to the default value.
	function cleanInputs(prefix) {
		$('#input' + prefix + 'Username').val(''),
		$('#input' + prefix + 'Name').val(''),
		$('#input' + prefix + 'LastName').val(''),
		$('#input' + prefix + 'Email').val('')
	}
	
	
	// Hides an alert (Display property).
	function hideAlert(id) {
		$('#' + id).parent('.alert').css('display', 'none');
	}
	

	// Checks if an user is valid to do any process (insert, update or delete).
	function isUserValid(idError, prefix, checkExists, checkOnlyUsername) {	
		// First we need to check if any field is empty.
		if (!$('#input' + prefix + 'Username').val()) {
			showAlert(idError, 'Username field cannot be empty');
			return;
		}
		
		if (!checkOnlyUsername) {
			if (!$('#input' + prefix + 'Name').val()) {
				showAlert(idError, 'Name field cannot be empty');
				return;
			}
			
			if (!$('#input' + prefix + 'LastName').val()) {
				showAlert(idError, 'Last name field cannot be empty');
				return;
			}
			
			if (!$('#input' + prefix + 'Email').val()) {
				showAlert(idError, 'Email field cannot be empty');
				return;
			}
		}
		
		// Only in case of update we need to check if the user name already exists.
		var exists = false;
		var usernameRef = db.ref().child('users').orderByChild('username').equalTo($('#input' + prefix + 'Username').val()).on('child_added', function(snapshot) {
			exists = true;
		});
		db.ref().off('child_added', usernameRef);
		
		if (exists && !checkExists) {
			showAlert(idError, 'This username already exists.');
		} else if (!exists && checkExists) {
			showAlert(idError, 'There is not any user with that username');
		}
	}
	
	
	// Removes an user from the database.
	function removeUserDatabase() {
		var usernameRef = db.ref().child('users').orderByChild('username').equalTo($('#inputCurrentUsername').val()).once('value', function(snapshot) {
			db.ref().child('users/' + Object.keys(snapshot.val())[0]).remove();
		});
	}
	
	
	// Removes an user from the UI.
	function removeUser(identifier) {
		$('#' + identifier).remove();
	}
	
	
	// Display an alert in the UI.
	function showAlert(id, message) {
		// User can't be inserted.
		$('#' + id).text(message);
		$('#' + id).parent('.alert').css('display', 'block');
	}
	
	
	// Updates the information of an user in the database.
	function updateUserDatabase() {
		var usernameRef = db.ref().child('users').orderByChild('username').equalTo($('#inputNewUsername').val()).once('value', function(snapshot) {
			// We got the id of the user!
			var update = {
				username: $('#inputNewUsername').val(),
				name: $('#inputNewName').val(),
				lastName: $('#inputNewLastName').val(),
				email: $('#inputNewEmail').val()
			};
			var userRef = db.ref('users/' + Object.keys(snapshot.val())[0]);
			userRef.update(update);
		});
	}
	
	
	// Updates user card in the UI.
	function updateUser(id, name, username, email) {
		$('#' + id).find('.card-title').text(name);
		$('#' + id).find('.username').text('Username: ' + username);
		$('#' + id).find('.email').text('Email: ' + email);
	}
});