/*
Script: modalwindow.js
	modalwindow - Simple javascript popup overlay to replace builtin alert, prompt and confirm.

License:
	PHP-style license.

Copyright:
	Copyright (c) 2009 [Kieron Wilson](http://kieronwilson.co.uk/).

Code & Documentation:
	https://github.com/rwarasaurus/modalwindow

*/

var modalwindow = (function(win, doc, und) {

	var elements = {'box': false, 'overlay': false, 'input': false};

	var element = function(tag) {
		var el = document.createElement(tag),
			options = arguments[1] || {},
			attributes = {
				'html': 'innerHTML',
				'class': 'className',
				'for': 'htmlFor',
				'text': 'innerText',
				'z-index': 'zIndex'
			};

		for(var key in options) {
			var value = options[key];
			
			if(key == 'styles') {
				css(el, value);
			} else if(attributes[key]) { 
				el[attributes[key]] = value; 
			} else { 
				el.setAttribute(key, value); 
			}
		}
		
		return el;
	};

	var css = function(element, styles) {
		for(var property in styles) {
			var value = styles[property];

			if (property == 'opacity') {
				if(win.ActiveXObject) {
					element.style.filter = 'alpha(opacity=' + (v * 100) + ')';
				}
				element.style.opacity = value;
			} else {
				element.style[property] = value;
			}
		}
	};

	var inject = function(element) {
		doc.body.appendChild(element);
	};
	
	var remove = function(element) {
		doc.body.removeChild(element);
	};
		
	var bind = function(element, type, func) {
		if(element.addEventListener) {
			element.addEventListener(type, func, false);
		} else if(element.attachEvent) {
			element.attachEvent('on' + type, func);
		}
	};
		
	var unbind = function(element, type, func) {
		if(element.removeEventListener) {
			element.removeEventListener(type, func, false);
		} else if(element.detachEvent) {
			element.detachEvent('on' + type, func);
		}
	};

	var scroll = function() {
		return doc.body.scrollTop || win.pageYOffset;
	};

	var overlay = function(options) {
		elements.overlay = element('div', {
			'styles': {
				'background': '#000',
				'opacity': options.opacity,
				'position': 'fixed',
				'top': 0,
				'left': 0,
				'bottom': 0,
				'right': 0,
				'z-index': 1000
			}
		});

		inject(elements.overlay);
	};

	var _alert = function(options, container, buttonContainer) {
		var a = element('a', {
			'html': options.yes_button,
			'href': '#close'
		});
		
		bind(a, 'click', function(event) {
			win.modalwindow.close();
			event.stopPropagation();
			event.preventDefault();
		});

		buttonContainer.appendChild(a);
		container.appendChild(buttonContainer);
	};

	var _confirm = function(options, container, buttonContainer) {
		if(options.yes) {
			var a = element('a', {
				'html': options.yes_button,
				'href': '#yes',
				'style': 'font-weight: bold;'
			});
			
			bind(a, 'click', function(event) {
				options.yes();
				modalwindow.close();
				event.stopPropagation();
				event.preventDefault();
			});
			
			buttonContainer.appendChild(a);
		}
		
		if(options.no) {
			var a = element('a', {
				'html': options.no_button,
				'href': '#no'
			});
			
			bind(a, 'click', function(event) {
				options.no();
				modalwindow.close();
				event.stopPropagation();
				event.preventDefault();
			});
			
			buttonContainer.appendChild(a);
		}
		
		var a = element('a', {
			'html': options.cancel_button,
			'href': '#close'
		});
		
		bind(a, 'click', function(event) {
			modalwindow.close();
			event.stopPropagation();
			event.preventDefault();
		});
		
		buttonContainer.appendChild(a);
		container.appendChild(buttonContainer);
	};

	var _prompt = function(options, container, buttonContainer) {
		elements.input = element('input', {
			'name': 'prompt',
			'type': 'text'
		});
		container.appendChild(elements.input);
		
		if(options.yes) {
			var a = element('a', {
				'html': options.yes_button,
				'href': '#yes'
			});
			
			bind(a, 'click', function(event) {
				options.yes(elements.input.value);
				modalwindow.close();
				event.stopPropagation();
				event.preventDefault();
			});
			
			buttonContainer.appendChild(a);
		}
		
		var a = element('a', {
			'html': options.cancel_button,
			'href': '#close'
		});

		bind(a, 'click', function(event) {
			modalwindow.close();
			event.stopPropagation();
			event.preventDefault();
		});
		
		buttonContainer.appendChild(a);
		container.appendChild(buttonContainer);
	};

	var box = function(options) {

		elements.box = element('div', {
			'class': 'modalwindow_box',
			'styles' : {
				'width': '50%',
				'position': 'fixed',
				'top': '25%',
				'left': '25%',
				'z-index': 1000
			}
		});

		inject(elements.box);

		var container = element('div', {
			'class': 'modalwindow_container'
		});

		var title = element('h3', {
			'html': options.title
		});
		container.appendChild(title);

		var text = element('p', {
			'html': options.text
		});
		container.appendChild(text);
		
		var buttonContainer = element('div', {
			'class': 'modalwindow_buttons'
		});

		if(options.type == 'alert') {
			_alert(options, container, buttonContainer);
		} else if(options.type == 'confirm') {
			_confirm(options, container, buttonContainer);
		} else if(options.type == 'prompt') {
			_prompt(options, container, buttonContainer);
		}

		elements.box.appendChild(container);
		
		window.scrollTo(0, scroll());
	};
	
	return {

		open: function() {
			var params = arguments[0] || {}, options = {};
			var defaults = {
				'type': 'alert',
				'opacity': 0.5,
				'title': 'Popup',
				'text': '',
				'yes_button': 'Yes',
				'no_button': 'No',
				'cancel_button': 'Cancel',
				'yes': false,
				'no': false
			};

			for(var key in defaults) {
				options[key] = (params[key] !== undefined) ? params[key] : defaults[key];
			}
			
			overlay(options);
			box(options);
		},
		
		close: function() {
			remove(elements.overlay);
			remove(elements.box);
		}
		
	};

}(window, document));
