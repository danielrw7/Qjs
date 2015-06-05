//WM History Module.
//Written by Brook
// - 5/26/2015

/*

Use browser's local storage to track pages visited.

*/
(function (Q) {

	//Add to Q
	var module = new Q.module('hist');

	//This listener div should display the history in
	//a list eventually.
	module.listenerDivTargetIDString = 'trew'; //It listens for new content.
	module.listenerDivTarget = '#'+module.listenerDivTargetIDString; //It listens for new content.
	module.listenerDivAttachTarget = '#overDiv';

	//This should trigger the history div to drop down...eventually
	module.activatorTarget = '.search_box';
	module.jQueryRequired = true;

	//Funtions somewhere down here.
	//Main Init Function on 
	module.on('init', function() {
		module.initStorage();
	});
	module.on('ready', function() {
		//console.log("History " + module.history);
		module.listenerDivAttach = $(module.listenerDivAttachTarget);
		module.listenerDivAttach.append($("<div id='"+module.listenerDivTargetIDString+"'><ul></ul></div>"));
		module.listenerDiv = $(module.listenerDivTarget);
		module.listenerDiv.css({
								"height":"600px",
								"width":"300px",
								"background-color":"white",
								"border":"5px solid black",
								"border-bottom":"white",
								"visibility":"visible",
								"position":"fixed",
								"bottom":"0",
								"right":"0",
								"display":"none",
								"font":"italic 30px Verdana",
								});
		
		module.activatorTarget = $(module.activatorTarget);
		module.activatorTarget.on('click','input', module.loadlistenerDiv);
		module.listenerDiv.on('click',module.listenerDiv.slideUp);	
	});
	module.initStorage = function() {
		var title = window.location.href.substr(Q.siteRoot.length);	
	
		if(title == '/mainmenu.html') {
			title = "Main Menu";
		} else if(title.search("\/display_") !==- 1 || title.search("\/edit_") !== -1 || title.search("\/list") !== -1 || title.search("\/delete_") !== -1) {
			title = title.replace("/", "").replace("_"," ").replace(".html"," ").replace("?","");
		}

		var newPage = {"title":title, "href":window.location.href};


		if('localStorage' in window && window.localStorage !== null) {
			if(window.localStorage.pageViews !== null && window.localStorage.pageViews !== undefined) {
				module.pageViews = JSON.parse(localStorage.pageViews);
				module.pageViews.push(newPage);	
				window.localStorage.pageViews = JSON.stringify(module.pageViews);
			} else {
				module.pageViews = [newPage];
				window.localStorage.pageViews = JSON.stringify(module.pageViews);
			}
		} else {
			console.log("There is no localStorage.");
		}
	};
	module.on('jQueryNotIncluded', function() {
		console.log("No jQuery, No hist for you!");
	});
	module.loadlistenerDiv = function() {
		var history = "<ul>"
		var pageHistory = module.pageViews.reverse();;
		$.each(pageHistory, function(index, page) {
			history += "<li><a href = '"+page.href+"'>"+page.title+"</a></li>";
		});
		history += "</ul>";
		module.listenerDiv.find('ul').html(history);
		if(module.listenerDiv.css('display') === 'none') {
			module.listenerDiv.slideDown();
		} else {
			module.listenerDiv.slideUp();
		}
	};
})(Q);
