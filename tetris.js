/**
 * Author: Serj Shevchenko
 * E-mail: serj.shevchenko@gmail.com
 * 
 * 
 **/


;
"use strict";


var defOptions = {
		speed : 200, 		//in msec
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
		this.finish = false;
		this.run();
    };    
    
Tetris.prototype = {
                numVer : 20,
                numHor : 15,
                
                finish : true,
                
                models : [],
                
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
										cell.__isFree = function () {											
											return !this.__busy;
										};
										cell.__reserve = function (cell) {
											this.__busy = true;
										};
										cell.__release = function () {
											this.__busy = false;				
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
					if (!this.finish) {
						var model = this.getRandModel();
						model.go();
					}
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
                        
                        
                        EventManager.on('model.stop', function () {
							setTimeout(function () {
								self.run();
							}, self.getOption('speed'));
						});

						return this;
                },
                
                getCell : function (row, cell) {
					if (row == undefined || cell == undefined) {
						throw new Error('Arguments error');
					}
					var row = this.field.getElementsByClassName ('r-'+row)[0];
					if (row) {
						var cell = row.getElementsByClassName ('c-'+cell)[0];
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
		if (!foreman) {
			throw new Error('Argument foreman is empty');
		}
		this.foreman = foreman;
		this.flush = function (mode) { // if mode == false it's means to hide model
			for (var len = this.position.length, i = 0; i < len; i++) {
				x = this.position[i].x;
				y = this.position[i].y;
				var cell = this.foreman.getCell(y, x);
				if (cell) {
					if (mode === false) {
						cell.style.backgroundColor = this.foreman.getOption('color');
						cell.__release();
					} else {
						cell.style.backgroundColor = this.color;
						cell.__reserve();
					}
				}
			}
			return this;
		};
		
		this.go = function () {
			var self = this;
			if (this.isFreeSpace()) {
				this.flush();
				setTimeout(function () {
						self.move();
				}, this.foreman.getOption('speed'));
			}
			return this;
		};
		
		this.move = function () {
			var end = false;
			this.flush(false);
			for (var len = this.position.length, i = 0; i < len; i++) {
				this.position[i].y += 1;
				var cell = this.foreman.getCell(this.position[i].y + 1, this.position[i].x);
				if (!cell || !cell.__isFree()) {
					end = true;
				}
			}
			this.flush();
			if (end) {
				EventManager.fire('model.stop');
				return;
			}
			var self = this;
			setTimeout(function () {
				self.move();
			}, this.foreman.getOption('speed')); // TODO get interval from options			
		};
		
		this.isFreeSpace = function () {
			for (var len = this.position.length, i = 0; i < len; i++) {
				var cell = this.foreman.getCell(this.position[i].y, this.position[i].x);
				if (!cell || !cell.__isFree()) {
					return false;
				}
			}
			return true;
		};
		

    };
    
    
var Stick = function () {
		Stick.prototype.superclass.apply(this, arguments);
		this.color = '#0f0';
		this.position = [{x:8,y:4}, {x:8,y:3}, {x:8,y:2}, {x:8,y:1}];
	};

var Square = function () {
		Square.prototype.superclass.apply(this, arguments);
		this.color = '#00f';
		this.position = [{x:9,y:2}, {x:9,y:1}, {x:8,y:2}, {x:8,y:1}];
	};
	
var ZedLeft = function () {
		ZedLeft.prototype.superclass.apply(this, arguments);
		this.color = '#0003fe';
		this.position = [{x:9,y:2}, {x:8,y:2}, {x:8,y:1}, {x:7,y:1}];
	};
   
var ZedRight = function () {
		ZedRight.prototype.superclass.apply(this, arguments);
		this.color = '#01a3ff';
		this.position = [{x:7,y:2}, {x:8,y:2}, {x:8,y:1}, {x:9,y:1}];
	};
	
var TetUp = function () {
		TetUp.prototype.superclass.apply(this, arguments);
		this.color = '#af48da';
		this.position = [{x:7,y:2}, {x:9,y:2}, {x:8,y:2}, {x:8,y:1}];
	};
	
var TetDown = function () {
		TetDown.prototype.superclass.apply(this, arguments);
		this.color = '#ef4e1f';
		this.position = [{x:7,y:1}, {x:9,y:1}, {x:8,y:2}, {x:8,y:1}];
	};
	
var GRight = function () {
		GRight.prototype.superclass.apply(this, arguments);
		this.color = '#aadd1f';
		this.position = [{x:9,y:3}, {x:8,y:3}, {x:8,y:2}, {x:8,y:1}];
	};

var GLeft = function () {
		GLeft.prototype.superclass.apply(this, arguments);
		this.color = '#521e98';
		this.position = [{x:7,y:3}, {x:8,y:3}, {x:8,y:2}, {x:8,y:1}];
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
			//~ 'finish' : [],
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
