/**
 * Author: Serj Shevchenko
 * E-mail: serj.shevchenko@gmail.com
 * 
 * 
 **/


;
"use strict";


var defOptions = {
		speed : 150, 		//in msec
		color : '#fff' 		// free cell
	};


var Tetris = function (options) {
        
        if (options.constructor != Object) {
			throw new TypeError('options must be Object type');
		}
		this.options = options;
		for (var k in defOptions) {
			this.options[k] = this.options[k] || defOptions[k];
		}
		//TODO accept/init options
        //~ this.init(options);
        this.prepareLayout().initModels().addListeners();
		
		//IT'S SHOW'S TIME
		this.run();
    };    
    
Tetris.prototype = {
                numVer : 20,
                numHor : 15,
                
                models : [],
                cModel : null,
                
                wrapper : null,
                field   : null,
                panel   : null,
                scoreboard : null,
                
                btnStart : null,
                btnPause : null,
                btnReset  : null,
                
                prepareLayout : function () {
                        this.wrapper = document.createElement('DIV');
                        this.wrapper.className = 'tetris-pro';
                        this.field = document.createElement('DIV');
                        this.field.className = 'field';
                        this.panel = document.createElement('DIV');
                        this.panel.className = 'panel';
                        
                        for (var i = 0; i < this.numVer; i++) {
                                var row = document.createElement('DIV');
                                row.className = 'row r-' + (i+1);
                                for (var j = 0; j < this.numHor; j++) {
                                        // TODO init cell method, if needed
                                        var cell = document.createElement('DIV');
                                        cell.className = 'cell c-'+(j+1);
                                        cell.__busy = false;
										cell.__model = null;
										cell.isFree = function () {											
											return !this.__busy;
										};
										cell.reserve = function (model) {
											this.__busy = true;
											this.__model = model;
											return this;
										};
										cell.release = function () {
											this.__busy = false;
											this.__model = null;
											return this;			
										};
										cell.getModel = function () {
												return this.__model;
										};
										cell.changeColor = function (color) {
											this.style.backgroundColor = color;
											return this;
										};
                                        row.appendChild(cell);
                                }
                                this.field.appendChild(row);
                        }                        
                        this.wrapper.appendChild(this.field);
                        
                        this.btnStart = document.createElement('A')
                        this.btnStart.className = 'btn start';
                        this.btnStart.innerHTML= 'Start';
                        this.btnPause = document.createElement('A');
                        this.btnPause.className = 'btn pause';
                        this.btnPause.innerHTML= 'Pause';
                        this.btnReset = document.createElement('A');
                        this.btnReset.className = 'btn reset';
                        this.btnReset.innerHTML= 'Reset';
                        this.btnReset.href = this.btnPause.href = this.btnReset.href = '#';
                        
                        this.panel.appendChild(this.btnStart);
                        this.panel.appendChild(this.btnPause);
                        this.panel.appendChild(this.btnReset);
                        this.wrapper.appendChild(this.panel);
                        
                        this.options.element.appendChild(this.wrapper);

						return this;
                },
                
                initModels : function () {
						this.models = {
										'Stick'   : Stick, 
										'Square'  : Square, 
										'GLeft'   : GLeft, 
										'GRight'  : GRight,
										'ZedLeft' : ZedLeft, 
										'ZedRigh' : ZedRight, 
										'TetDown' : TetDown, 
										'TetUp'   : TetUp
									  };
									  
						return this;
				},
				
				run : function () {
					this.cModel = this.getRandModel();
					this.cModel.go();
					return this;
				},
                
                getRandModel : function () {
					var models = ['Stick', 'Square', 'GLeft', 'GRight',
									'TetDown', 'TetUp', 'ZedLeft', 'ZedRigh'];
					var len = models.length;
					var idx = Math.floor(Math.random()*(len-1));
					var md1 = models[idx];
					models.splice(idx, 1);
					len = models.length;
					idx = Math.floor(Math.random()*(len-1));
					var md2 = models[idx];
					idx = Math.round(Math.random()) + 1;
					return new this.models[ eval('md'+idx) ] (this);
				},
                
                addListeners : function () {
                        var self = this;
                        //~ this.btnStart.onclick = function (event) {
                        //~ };
                        //~ 
                        //~ this.btnPause.onclick = function (event) {
                        //~ };
//~ 
                        //~ this.btnStop.onclick = function (event) {
                        //~ };
                        window.onkeydown = function (e) {
							//~ console.log(e.keyCode);
							var dict = {
									37 : 'Left',
									39 : 'Right',
									40 : 'Down',
									38 : 'Up'
							};
							var action = 'on'+dict[e.keyCode];
							self.cModel[action] && self.cModel[action]();
						};
                        
                        EventManager.on('model.stop', function () {
							setTimeout(function () {
								self.run();
							}, self.getOption('speed'));
						});
						
						return this;
                },
                
                bind : function (elem, event, handler) { // specify event arg with out prefix 'on'
					if (!event || event in elem || handler.constructor != Function) {
						return;
					}
					if (elem.addEventListener) {
						elem.addEventListener(event, handler, false);
					} else if (elem.attachEvent) {
						elem.attachEvent('on'+event, handler);
					} else {
						elem['on'+event] = handler;
					}
				},
                
                getCell : function (row, cell) {
					if (row == undefined || cell == undefined) {
						throw new Error('Arguments error');
					}
					var row = this.field.getElementsByClassName('r-'+row)[0];
					if (row) {
						var cell = row.getElementsByClassName('c-'+cell)[0];
						if (cell) {
							return cell;
						}
					}
					return null;
				},
				
				getOption : function (key) {
					return this.options[key] || null;
				}
}; 
    
var Model = function (foreman) {
		this.rotationRight = function () {};
		this.rotationLeft = function () {};
		this.position = [];
		this.cells = {};
		if (!foreman) {
			throw new Error('Argument foreman is empty');
		}
		this.foreman = foreman;
		
		this.flush = function (arr) { // if mode == false it's means to hide model
			arr = arr || [];
			
			for (var i = 0; i < arr.length; i++) {
				arr[i].changeColor('white').release();
			}
			arr = [];
			for (i = 0; i < this.position.length; i++) {
				var 
					x = this.position[i].x,
					y = this.position[i].y,
					cell = this.foreman.getCell(y, x)
				;
				if (cell && (cell.isFree() || cell.getModel() === this)) {
					arr.push(cell);
					this.position[i].y += 1;
				} else {
					break;
				}
			}
			if (i == this.position.length) {
				for (i = 0; i < arr.length; i++) {
					arr[i].reserve(this).changeColor(this.color);
				}
				var self = this;
				setTimeout(function () {
					self.flush(arr);
				}, this.foreman.getOption('speed'));
			}
		};
		
		this.initCells = function () {
			for (var i = 0; i < this.position.length; i++) {
				var 
					x = this.position[i].x,
					y = this.position[i].y
				;
				var cell = this.foreman.getCell(x, y);
				this.cells[x+':'+y] = cell;
				cell.model = this;
			}
		};
		
		this.go = function () {
			var self = this;
			//~ if (this.isFreeSpace()) {
			this.flush();
				//~ setTimeout(function () {
						//~ self.move();
				//~ }, this.foreman.getOption('speed'));
			//~ }
			return this;
		};
		
		//~ this.move = function () {
			//~ var end = false;
			//~ this.flush(false);
			//~ for (var len = this.position.length, i = 0; i < len; i++) {
				//~ this.position[i].y += 1;
				//~ var cell = this.foreman.getCell(this.position[i].y + 1, this.position[i].x);
				//~ if (!cell || !cell.isFree()) {
					//~ end = true;
				//~ }
			//~ }
			//~ this.flush();
			//~ if (end) {
				//~ EventManager.fire('model.stop');
				//~ return;
			//~ }
			//~ var self = this;
			//~ setTimeout(function () {
				//~ self.move();
			//~ }, this.foreman.getOption('speed')); // TODO get interval from options			
		//~ };
		
		//~ this.isFreeSpace = function () {
			//~ for (var len = this.position.length, i = 0; i < len; i++) {
				//~ var cell = this.foreman.getCell(this.position[i].y, this.position[i].x);
				//~ if (!cell || !cell.isFree()) {
					//~ return false;
				//~ }
			//~ }
			//~ return true;
		//~ };
		
		this.onLeft = function () {
			console.log('left');
		};
		
		this.onRight = function () {
			console.log('right');
		};
		
		this.onDown = function () {
			console.log('down');
		};
		
		this.onUp = function () {
			console.log('up');
		};

    };
    
    
var Stick = function () {
		Stick.prototype.superclass.apply(this, arguments);
		this.color = '#0f0';
		this.position = [{x:8,y:4}, {x:8,y:3}, {x:8,y:2}, {x:8,y:1}];
		this.initCells();
	};

var Square = function () {
		Square.prototype.superclass.apply(this, arguments);
		this.color = '#0a0afe';
		this.position = [{x:9,y:2}, {x:9,y:1}, {x:8,y:2}, {x:8,y:1}];
		this.initCells();
	};
	
var ZedLeft = function () {
		ZedLeft.prototype.superclass.apply(this, arguments);
		this.color = '#0003fe';
		this.position = [{x:9,y:2}, {x:8,y:2}, {x:8,y:1}, {x:7,y:1}];
		this.initCells();
	};
   
var ZedRight = function () {
		ZedRight.prototype.superclass.apply(this, arguments);
		this.color = '#01a3ff';
		this.position = [{x:7,y:2}, {x:8,y:2}, {x:8,y:1}, {x:9,y:1}];
		this.initCells();
	};
	
var TetUp = function () {
		TetUp.prototype.superclass.apply(this, arguments);
		this.color = '#af48da';
		this.position = [{x:7,y:2}, {x:9,y:2}, {x:8,y:2}, {x:8,y:1}];
		this.initCells();
	};
	
var TetDown = function () {
		TetDown.prototype.superclass.apply(this, arguments);
		this.color = '#ef4e1f';
		this.position = [{x:7,y:1}, {x:9,y:1}, {x:8,y:2}, {x:8,y:1}];
		this.initCells();
	};
	
var GRight = function () {
		GRight.prototype.superclass.apply(this, arguments);
		this.color = '#aadd1f';
		this.position = [{x:9,y:3}, {x:8,y:3}, {x:8,y:2}, {x:8,y:1}];
		this.initCells();
	};

var GLeft = function () {
		GLeft.prototype.superclass.apply(this, arguments);
		this.color = '#521e98';
		this.position = [{x:7,y:3}, {x:8,y:3}, {x:8,y:2}, {x:8,y:1}];
		this.initCells();
	};

Stick.prototype.superclass = Model;
Square.prototype.superclass = Model;
GLeft.prototype.superclass = Model;
GRight.prototype.superclass = Model;
ZedLeft.prototype.superclass = Model;
ZedRight.prototype.superclass = Model;
TetUp.prototype.superclass = Model;
TetDown.prototype.superclass = Model;

var EventManager = {
		events : {
			//~ 'model.prestart' : [],
			//~ 'model.start' : [],
			//~ 'model.move' : [],
			'model.stop' : []
		},
		
		on : function (event, callback) {
			if (!this.events[event] || callback.constructor != Function) {
				throw new Error('Arguments error');
			}
			var listeners = this.events[event];
			for (var i = 0, len = listeners.length; i < len; i++) {
				if (listeners[i] == callback) {
					break;
				}
			}
			if (i == len) {
				this.events[event].push(callback);
			}
			return this;
		},
		
		fire : function (event, data) {
			if (!this.events[event]) {
				throw new Error('Arguments error');
			}
			var listeners = this.events[event];
			for (var i = 0, len = listeners.length; i < len; i++) {
				listeners[i].call(this, data);
			}
			return this;
		}
    };       
