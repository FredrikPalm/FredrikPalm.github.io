function toUpper(s)
{
	return s[0].toUpperCase() + s.substr(1);
}

function swap(a, b)
{
	var c = a;
	a = b;
	b = c;
}

function clamp(v, min, max)
{
	return Math.max(Math.min(v, max), min);
}

function pulse(i, freq, min, max)
{
	return min + max * (1 - 2.0 * (Math.abs(0.5 - (i % freq) / (freq - 1))));
}

var digits = ['', 'first', 'second', 'third', 'fourth', 'fifth', 'sixth', 'seventh', 'eighth', 'ninth', 'tenth', 'eleventh', 'twelvth', 'thirteenth', 'fourteenth', 'fifteenth', 'sixteenth', 'seventeenth', 'eighteenth', 'nineteenth'];
var counts = ['no', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
var tens = ['twent', 'thirt', 'fourt', 'fift', 'sixt', 'sevent', 'eight', 'ninet'];

function toCount(n)
{
	if(n < 20) return counts[n];
	var ten = tens[Math.floor(n / 10) - 2] + "y";
	if(n % 10 == 0) return ten;
	return ten + "-" + counts[n % 10];  
}

function number(n) 
{
	if(n < 20) return digits[n];
	var ten = tens[Math.floor(n / 10) - 2];
	if(n % 10 == 0) return ten + 'ieth';
	return ten + 'y-' + digits[n % 10];
}

function rgb(r,g,b,a)
{
	return "rgba(" + Math.round(r*255) + "," + Math.round(g*255) + "," + Math.round(b*255) + "," + a + ")";
}

// FirebaseUI config.
var uiConfig = {
	signInSuccessUrl: window.location.href,
	signInOptions: [
	  // Leave the lines as is for the providers you want to offer your users.
	  firebase.auth.GoogleAuthProvider.PROVIDER_ID,
	  //firebase.auth.FacebookAuthProvider.PROVIDER_ID,
	  //firebase.auth.TwitterAuthProvider.PROVIDER_ID,
	  //firebase.auth.GithubAuthProvider.PROVIDER_ID,
	  //firebase.auth.EmailAuthProvider.PROVIDER_ID,
	  //firebase.auth.PhoneAuthProvider.PROVIDER_ID,
	  firebaseui.auth.AnonymousAuthProvider.PROVIDER_ID
	],
	// tosUrl and privacyPolicyUrl accept either url string or a callback
	// function.
	// Terms of service url/callback.
	tosUrl: '',
	// Privacy policy url/callback.
	privacyPolicyUrl: function() {
	  window.location.assign('');
	}
};

var app = angular.module('TrenderApp', []);
var scope;
var useruid;
var db;

initApp = function() {
	db = firebase.firestore();
	firebase.auth().onAuthStateChanged(function(user) {
	  scope.authenticated = !!user;
	  scope.$apply();
	  if (user) {
	    // User is signed in.
	    var displayName = user.displayName;
	    var email = user.email;
	    var emailVerified = user.emailVerified;
	    var photoURL = user.photoURL;
	    var uid = user.uid;
	    useruid = user.uid;
	    loadFromStorage();
	    var phoneNumber = user.phoneNumber;
	    var providerData = user.providerData;
	    user.getIdToken().then(function(accessToken) {
	    	/*firebase.initializeApp({
			  apiKey: '### FIREBASE API KEY ###',
			  authDomain: '### FIREBASE AUTH DOMAIN ###',
			  projectId: '### CLOUD FIRESTORE PROJECT ID ###'
			});*/

		  document.getElementById('sign-in-status').textContent = 'Signed in';
	      document.getElementById('sign-in').textContent = 'Sign out';
	      document.getElementById('account-details').textContent = JSON.stringify({
	        displayName: displayName,
	        email: email,
	        emailVerified: emailVerified,
	        phoneNumber: phoneNumber,
	        photoURL: photoURL,
	        uid: uid,
	        accessToken: accessToken,
	        providerData: providerData
	      }, null, '  ');
	    });
	  } else {
	    // User is signed out.
	    document.getElementById('sign-in-status').textContent = 'Signed out';
	    document.getElementById('sign-in').textContent = 'Sign in';
	    document.getElementById('account-details').textContent = 'null';
	  }
	}, function(error) {
	  console.log(error);
	});

	// Initialize the FirebaseUI Widget using Firebase.
	var ui = new firebaseui.auth.AuthUI(firebase.auth());
	// The start method will wait until the DOM is loaded.
	{
		ui.start('#firebaseui-auth-container', uiConfig);
	}

};

window.addEventListener('load', function() {
	initApp();
});

var paused = false;
var days = 0;
var finalDay = 90 * 365;

var stats = {};

var projects = [];

var chart;

function saveToStorage()
{
	var p = [];
	for(var i = 0; i < projects.length; i++){
		var t = projects[i];
		p.push({ name : t.name, duration : t.duration, amountDone : t.amountDone });
	}

	db.collection("users").doc(useruid).set({
    	projects : p
	})
	.then(function() {
    	console.log("Document successfully written!");
	})
	.catch(function(error) {
    	console.error("Error writing document: ", error);
	});

	//localStorage.setItem("projects", JSON.stringify(p));
}

function loadFromStorage()
{
	var docRef = db.collection("users").doc(useruid);
	docRef.get().then(function(doc) {
    if (doc.exists) {
        console.log("Document data:", doc.data());
        var pt = doc.data().projects;
		if(pt && pt.length){
			for(var i = 0; i < pt.length; i++){
				projects.push(new Project(pt[i].name, pt[i].duration, pt[i].amountDone));
			}
			scope.$apply();
		}
    } else {
        console.log("Found no data for user!");
    }
	}).catch(function(error) {
    	console.log("Error getting document:", error);
    	var p = localStorage.getItem("projects");
		var pt = JSON.parse(p);
		if(pt && pt.length){
			for(var i = 0; i < pt.length; i++){
				projects.push(new Project(pt[i].name, pt[i].duration, pt[i].amountDone));
			}
			scope.$apply();
		}
	});
}

var editingProject;
var mouseStart = {};
var startAmount;

function tick()
{
	if(editingProject != undefined){

	}
}

app.controller('main', function($scope){ 
	window.scope = $scope;

    // Start as not visible but when button is tapped it will show as true 

    $scope.visible = false;

    // Create the array to hold the list of Birthdays

    $scope.projects = projects;

    // Create the function to push the data into the "bdays" array

    $scope.editAmountDone = function(project, e)
    {
    	if(editingProject) return;
    	window.event = e;
    	if(e.touches !== undefined)
    		e = e.touches[0];
    	startAmount = (project.amountDone === undefined) ? 0 : project.amountDone;
    	window.scope = $scope;
    	editingProject = project;
    	console.log("Editing project " + project.name);
    	mouseStart = { x : e.clientX, y : e.clientY };
    	console.log("Mouse at " + e.clientY);
    	if(e.preventDefault) e.preventDefault();
    	window.ontouchend = window.onmouseup = function(e)
    	{
    		if(!editingProject) return;
    		editingProject = undefined;
    		if(e.preventDefault) e.preventDefault();
    	};

    	window.ontouchcancel = window.onmouseleave = function(e)
    	{
    		if(!editingProject) return;
    		editingProject = undefined;
    		if(e.preventDefault) e.preventDefault();
    	};

    	window.ontouchmove = window.onmousemove = function(e)
    	{
    		if(!editingProject) return;
    		if(e.touches !== undefined)
    			e = e.touches[0];

    		if(editingProject){
    			var change = -( mouseStart.y - e.clientY ) / 250;  //TODO
    			editingProject.amountDone = clamp(startAmount + change, 0, editingProject.duration);
    			$scope.update();
    			$scope.$apply();
			}
    		if(e.preventDefault) e.preventDefault();
    	};
    };

    $scope.update = function(){
    	console.log("updating");
    	for(var i = $scope.projects.length - 1; i >= 0; i--){
    		if($scope.projects[i].name === undefined || $scope.projects[i].name.length == 0){
    			$scope.projects.splice(i, 1);
    		}
    	}
    	saveToStorage();
    };

    $scope.newProject = function(){

    	console.log("Adding " + $scope.projectname);
        $scope.projects.push(new Project($scope.projectname));
        $scope.projectname = '';
        saveToStorage();
    };
}).directive('ngTouchstart', [function() {
                return function(scope, element, attr) {
                	window.element = element;
                    element[0].ontouchstart = function(event) {
                        var $event = event;
                        scope.$apply(function() { 
                            scope.$eval(attr.ngTouchstart, { $event : event }); 
                        });
                    };
                };
            }]).directive('ngTouchend', [function() {
                return function(scope, element, attr) {

                    element[0].ontouchstart =  function(event) {
                    	var $event = event; 
                        scope.$apply(function() { 
                            scope.$eval(attr.myTouchend, { $event : event });
                        });
                    };
                };
            }]);


function Sample(time, timeSpent)
{
	this.time = time;
	this.timeSpent = timeSpent;
};

function Project(name, duration, amountDone)
{
	this.name = (name === undefined) ? "" : name;
	this.duration = (duration === undefined) ? 0 : duration;
	this.amountDone = (amountDone === undefined) ? 0 : amountDone;
	this.info = {};
	this.samples = [];

	var t = this;

	this.getEta = function(){

	};

	this.addSample = function(time, timeSpent){
		samples.push(new Sample(time, timeSpent))
	};

	this.percentDone = function()
	{
		return t.amountDone / t.duration;
	};

	this.percentDoneString = function()
	{
		var p = t.percentDone();
		return Math.round(100 * p) + "%"; 
	}
};

function etaIsUnknown(eta)
{
	return eta === undefined || eta < 0.0;
}

function etaString(eta)
{
	if(etaIsUnknown(eta)) return "-";
	return eta / 3600;
}

