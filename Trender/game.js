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


var paused = false;
var days = 0;
var finalDay = 90 * 365;

var stats = {};

var projects = [];

var chart;

var app = angular.module('TrenderApp', []);

function saveToStorage()
{
	var p = [];
	for(var i = 0; i < projects.length; i++){
		var t = projects[i];
		p.push({ name : t.name, duration : t.duration, amountDone : t.amountDone });
	}

	localStorage.setItem("projects", JSON.stringify(p));
}

function loadFromStorage()
{
	var p = localStorage.getItem("projects");
	var pt = JSON.parse(p);
	if(pt && pt.length){
		for(var i = 0; i < pt.length; i++){
			projects.push(new Project(pt[i].name, pt[i].duration, pt[i].amountDone));
		}	
	}
}

loadFromStorage();

var editingProject;
var mouseStart = {};
var startAmount;

function tick()
{
	if(editingProject != undefined){

	}
}

app.controller('main', function($scope){ 

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
    		editingProject = undefined;
    		if(e.preventDefault) e.preventDefault();
    	};

    	window.ontouchcancel = window.onmouseleave = function(e)
    	{
    		editingProject = undefined;
    		if(e.preventDefault) e.preventDefault();
    	};

    	window.ontouchmove = window.onmousemove = function(e)
    	{
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

                    element.on('touchend', function(event) {
                    	var $event = event; 
                        scope.$apply(function() { 
                            scope.$eval(attr.myTouchend, { $event : event });
                        });
                    });
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

