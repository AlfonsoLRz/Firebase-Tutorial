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
	
	// Update user information.
	db.ref().child('users').on('child_changed', function(snapshot) {
		updateUser(snapshot.key, snapshot.val().name + ' ' + snapshot.val().lastName, snapshot.val().username, snapshot.val().email);
	});

	
	// Create user function 
	$('#createUser').on('click', function(e) {
		// Don't load the page again.
		e.preventDefault();
		
		// Identifier of the alert.
		var idAlert = 'errorCreateUser';
		
		// Reset alert state.
		hideAlert(idAlert);
		
		isUserValid(idAlert, '', false);
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
		
		hideAlert(idAlert);
		window.alert('User ' + $('#inputUsername').val() + ' was registered');
		cleanInputs('');
	});
	
	// Update user function
	$('#updateUser').on('click', function(e) {
		// Don't load the page again.
		e.preventDefault();
		
		// Identifier of the alert.
		var idAlert = 'errorUpdateUser';
		
		// By default we will hide the alert.
		hideAlert(idAlert);
		
		isUserValid(idAlert, 'New', true);
		if ($('#' + idAlert).parent('.alert').css('display') == 'block') {
			return;
		}
		
		// Update information with the input data
		updateUserDatabase();
	});
	
	
	// OTHER METHODS
	
	function addUser(id, name, username, email) {
		$('#userContainer').append('<div id=' + id + ' class="card mt-4 ml-2 mr-2" style="width: 18rem;"><div class="card-body"><h5 class="card-title">' + name + '</h5></div><ul class="list-group list-group-flush text-left"><li class="username list-group-item">Username: ' + username + '</li><li class="email list-group-item">Email: ' + email + '</li></ul></div>');
	}
	
	function cleanInputs(prefix) {
		$('#input' + prefix + 'Username').val(''),
		$('#input' + prefix + 'Name').val(''),
		$('#input' + prefix + 'LastName').val(''),
		$('#input' + prefix + 'Email').val('')
	}
	
	function hideAlert(id) {
		$('#' + id).parent('.alert').css('display', 'none');
	}

	function isUserValid(idError, prefix, isUpdate) {	
		// First we need to check if any field is empty.
		if (!$('#input' + prefix + 'Username').val()) {
			showAlert(idError, 'Username field cannot be empty');
			return;
		}
		
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
		
		// Only in case of update we need to check if the username already exists.
		if (!isUpdate) {
			var usernameRef = db.ref().child('users').orderByChild('username').equalTo($('#input' + prefix + 'Username').val()).on('child_added', function(snapshot) {
				showAlert(idError, 'This username already exists.');
			});
			db.ref().off('child_added', usernameRef);
		}
	}
	
	function showAlert(id, message) {
		// User can't be inserted.
		$('#' + id).text(message);
		$('#' + id).parent('.alert').css('display', 'block');
	}
	
	function updateUserDatabase() {
		var updated = false;
		
		var usernameRef = db.ref().child('users').orderByChild('username').equalTo($('#inputNewUsername').val()).on('child_added', function(snapshot) {
			// We got the id of the user!
			var update = {
				username: $('#inputNewUsername').val(),
				name: $('#inputNewName').val(),
				lastName: $('#inputNewLastName').val(),
				email: $('#inputNewEmail').val()
			};
			var userRef = db.ref('users/' + snapshot.key);
			userRef.update(update);
			updated = true;
		});
		db.ref().off('child_added', usernameRef);
		
		if (updated) {
			cleanInputs('New');
			hideAlert('errorUpdateUser');
			window.alert('User ' + $('#inputNewUsername').val() + ' is now updated');
		} else {
			showAlert('errorUpdateUser', 'There is not any user with that username');
		}
	}
	
	function updateUser(id, name, username, email) {
		$('#' + id).find('.card-title').text(name);
		$('#' + id).find('.username').text(username);
		$('#' + id).find('.email').text(email);
	}
});