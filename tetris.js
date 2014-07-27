/**
 * Author: Serj Shevchenko
 * E-mail: serj.shevchenko@gmail.com
 * 
 * 
 **/


;
"use strict";


var defOptions = {
		speed : 1000, //in msec
	};


var Tetris = function (options) {
        //~ parentObj.apply(this, arguments);
        
        if (options.constructor != Object) {
			throw new TypeError('options must be Object type');
		}
		this.options = options;
		for (var k in defOptions) {
			this.options[k] = this.options[k] || defOptions[k];
		}
		//TODO accept/init options
        //~ this.init(options);
        this.prepareLayout();
        
		this.initModels();
		
		//IT'S SHOW'S TIME
		this.run();
    };    
    
Tetris.prototype = {
                numVer : 20,
                numHor : 15,
                
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
                                        var cell = document.createElement('DIV');
                                        cell.className = 'cell c-'+(j+1);
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
                        
                },
                
                initModels : function () {
						this.models.push(new Stick(this));
						this.models.push(new Square(this));
						this.models.push(new GLeft(this));
						this.models.push(new GRight(this));
						this.models.push(new ZedLeft(this));
						this.models.push(new ZedRight(this));
						this.models.push(new TetDown(this));
						this.models.push(new TetUp(this));
				},
				
				run : function () {
					var model = this.getRandModel();
					model.flush();
					model.go();
				},
                
                getRandModel : function () {
					var models = this.models;
					var len = models.length;
					var idx = Math.floor(Math.random()*(len-1));
					var md1 = models[idx];
					models.splice(idx, 1);
					len = models.length;
					idx = Math.floor(Math.random()*(len-1));
					var md2 = models[idx];
					idx = Math.round(Math.random()) + 1;
					return eval('md'+idx);
				},
                
                addListeners : function () {
                        var selt = this;

                        this.btnStart.onclick = function (event) {
                        };
                        
                        this.btnPause.onclick = function (event) {
                        };

                        this.btnStop.onclick = function (event) {
                        };
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
						cell.style.backgroundColor = '#fff';
					} else {
						cell.style.backgroundColor = this.color;
					}
				}
			}
			return this;
		};
		
		this.go = function () {
			var self = this;
			setTimeout(function () {
					self.move();
			}, this.foreman.getOption('speed'));
		};
		
		this.move = function () {
			var end = false;
			this.flush(false);
			for (var len = this.position.length, i = 0; i < len; i++) {
				this.position[i].y += 1;
				if (this.foreman.numVer == this.position[i].y) {
					end = true;
				}
			}
			this.flush();
			if (end) {
				return;
			}
			var self = this;
			setTimeout(function () {
				self.move();
			}, this.foreman.getOption('speed')); // TODO get interval from options			
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

var EventsLst = function () {
    
    };
        
