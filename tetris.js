/**
 * 
 * Author: Serj Shevchenko
 * E-mail: serj.shevchenko@gmail.com
 * 
 **/


/* TODO
 * setTimeout with will increase yours score every 5 min
 * sort postion befor first move
 * */

;"use strict";


var defOptions = {
		speed : 400, 		//in msec
		color : '#999' 		// free cell
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
				score : 0,
	
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
						var self = this;
                        this.wrapper = document.createElement('DIV');
                        this.wrapper.className = 'tetris-pro';
                        this.field = document.createElement('DIV');
                        this.field.className = 'field';
                        this.panel = document.createElement('DIV');
                        this.panel.className = 'panel';
						this.scoreBox = document.createElement('DIV');
                        this.scoreBox.className = 'score-box';
                        var temp = document.createElement('SPAN');
                        temp.className = 'lable'; temp.innerHTML = 'Your score:&nbsp;';
                        this.scoreValue = document.createElement('SPAN');
                        this.scoreValue.id = 'score'; this.scoreValue.innerHTML = '0';
                        this.scoreBox.appendChild(temp).appendChild(this.scoreValue);
                        this.preview = document.createElement('DIV');
                        this.preview.className = 'preview';
                        
                        for (var i = 0; i < this.numVer; i++) {
                                var row = document.createElement('DIV');
                                row.__reservedCells = 0;
                                row.className = 'row r-'+(i+1);
                                row.id = 'row-' + (i+1);
                                for (var j = 0; j < this.numHor; j++) {
                                        // TODO init cell method, if needed
                                        var cell = document.createElement('DIV');
                                        cell.className = 'cell c-' + (j+1);
                                        cell.id = 'cell-'+(i+1)+'-'+(j+1);
										cell.__model = null;
										cell.isFree = function () {											
											return this.__model ? false : true;
										};
										cell.reserve = function (model) {
											this.__model = model;
											this.style.backgroundColor = model.color;
											this.parentNode.__reservedCells++;
											return this;
										};
										cell.release = function () {
											this.__model = null;
											this.style.backgroundColor = self.options.color;
											this.parentNode.__reservedCells--;
											return this;
										};
										cell.getModel = function () {
												return this.__model;
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
                        this.panel.appendChild(this.scoreBox);
                        this.panel.appendChild(this.preview);
                        this.wrapper.appendChild(this.panel);
                        
                        this.options.element.appendChild(this.wrapper);
						
						return this;
                },
                
				clearLayout : function () {
					clearNode(this.wrapper);
					this.wrapper.parentNode.removeChild(this.wrapper)
					this.prepareLayout().initModels().addListeners();
				},
                
                initModels : function () {
						this.models = {
										'Stick'   : Stick, 
										'Square'  : Square, 
										'GLeft'   : GLeft, 
										'GRight'  : GRight,
										'ZedLeft' : ZedLeft, 
										'ZedRigh' : ZedRight, 
										'TetDown' : TetDown
									  };
									  
						return this;
				},
				
				run : function () {
					this.cModel = this.nModel || this.getRandModel();
					this.nModel = this.getRandModel();
					this.cModel.go();
					this.nModel.showPreview();
					return this;
				},
                
                getRandModel : function () {
					var models = ['Stick', 
								  'Square', 
								  'GLeft', 
								  'GRight',
								  'TetDown', 
								  'ZedLeft', 
								  'ZedRigh'
								  ];
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
                        self.bind(this.btnPause, 'click', function (e) {
							if (!self.cModel) return false; 
							if (this.innerHTML == 'Resume') {
								self.cModel.resume();
								this.innerHTML = 'Pause';
							} else {
								self.cModel.pause();
								this.innerHTML = 'Resume';
							}
                        });
                        
                        self.bind(this.btnReset, 'click', function (e) {
							if (self.cModel) {
								self.cModel.pause();
								self.cModel = self.nModel = null;
							}
							self.clearLayout();
							self.run();
                        });
//~ 
                        //~ this.btnStop.onclick = function (event) {
                        //~ };
                        //~ document.onkeypress = function (e) {
							//~ console.log(e.keyCode);
							//~ 
						//~ };
						
						self.bind(document, 'keydown', function (e) { // TODO check why chrome don't well work with keypress event
								if (!self.cModel) return false; 
								setTimeout(function () {
									var dict = {
											37 : 'onLeft',
											39 : 'onRight',
											40 : 'onDown',
											38 : 'onRotate'
									};
									var action = dict[e.keyCode];
									self.cModel[action] && self.cModel[action]();
								}, 0);
						});
                        
                        EventManager.on('model.stop', function () {
							//TODO chech IE specifics
							var cells = self.cModel.oldCells;
							self.cModel = null;
							var rows = [];
							var maxIdx = -1;
							for (var i in cells) {
								if (cells[i].parentNode.__reservedCells == self.numHor) { // TODO in another way
									var row = cells[i].parentNode;
									maxIdx = Math.max(maxIdx, [].indexOf.call(row.parentNode.children, row));  // check for IE
									rows.push(row);									
									for (var j = 0; j < row.children.length; j++) {
										row.children[j].release();
									}
								}
							}
							if (maxIdx > -1) {
								var table = rows[0].parentNode;
								for (var i = maxIdx - rows.length; i >= 0; maxIdx--, i--) {
									var row = table.children[maxIdx]; //IE
									var newRow = table.children[i]; //IE
									if (newRow.__reservedCells == 0) {
										break;
									}
									for (var j = 0; j < newRow.children.length; j++) { //IE
										var model = newRow.children[j].getModel();
										if (model) {
											row.children[j].reserve(model); //IE
											newRow.children[j].release(); //IE
										}
									}
								}
								self.score += self.numHor;
								self.scoreValue.innerHTML = self.score; 
							}
							setTimeout(function () {
								self.run();
							}, self.getOption('speed'));
						});
						
						EventManager.on('finish', function () {
							self.cModel = self.nModel = null;
							alert('Game over!');
						});
						
						return this;
                },
                
                bind : function (elem, event, handler) {
					if (!event || !elem || handler.constructor != Function) {
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
					return document.getElementById('cell-'+row+'-'+cell) || null;
				},
				
				getOption : function (key) {
					return this.options[key] || null;
				}
}; 
    
var Model = function (field) {
		this.__timer = null;
		this.position = [];
		this.oldCells = [];
		if (!field) {
			throw new Error('Argument field is empty');
		}
		this.field = field;
		
		this.copyPosition = function (x, y) {
			x = x || 0;
			y = y || 0;
			var clone = [];
			for (var i in this.position) {
				clone.push( { 'x' : this.position[i].x + x, 'y' : this.position[i].y + y } );
			}
			return clone;
		};

		this.draw = function () {
			var cells = [];
			for (var i in this.oldCells) {
				this.oldCells[i].release();
			}
			for (var i = 0; i < this.position.length; i++) {
				var cell = this.field.getCell(	this.position[i].y, this.position[i].x);
				cell.reserve(this);
				cells.push(cell);
			}
			this.oldCells = cells;
		};

		this.isFreeSpace = function (position) {
			position = position || this.position;
			for (var i = 0; i < position.length; i++) {
				var cell = this.field.getCell(	position[i].y, position[i].x);
				if (!cell || (!cell.isFree() && cell.getModel() !== this)) {
					break;
				}
			}
			return i == position.length;
		};
		
		this.flush = function () {
			var atFirst = !this.oldCells.length;
			this.position = atFirst ? this.position : this.copyPosition(0, 1);
			if (this.isFreeSpace()) {
				this.draw();
				var self = this;
				this.__timer = setTimeout(function () {
					self.flush();
				}, this.field.getOption('speed'));
			} else {
				if (atFirst) {
					EventManager.fire('finish');
				} else {
					EventManager.fire('model.stop', this.oldCells);
				}
			}
		};

		this.go = function () {
			this.flush();
			return this;
		};
		
		this.pause = function () {
			this.__timer && clearTimeout(this.__timer);
			return this;
		};
		
		this.resume = function () {
			this.flush();
			return this;
		};
		
		this.onLeft = function () {
			var position = this.copyPosition(-1);
			if (this.isFreeSpace(position)) {
				this.position = position; // TODO check dangerous place
				this.draw();
			}
		};
		
		this.onRight = function () {
			var position = this.copyPosition(1);
			if (this.isFreeSpace(position)) {
				this.position = position; // TODO check dangerous place
				this.draw();
			}
		};
		
		this.onDown = function () {
			this.__timer && clearTimeout(this.__timer);
			this.flush();
		};
		
		this.onRotate = function () {
			console.log('rotate');
		};
		this.rotateStatus = 0;
		this.compare  = function (a, b) {
			var res = 0;
			if ((a.y > b.y) || (a.y == b.y && a.x > b.x)) res = 1;
			else if ((a.y < b.y) || (a.y == b.y && a.x < b.x)) res = -1;
			return res;
		};
		this.showPreview = function () {
				var position = this.copyPosition(-7, -1); // TODO delete dependent from [this.position] 
				var wrapper = document.createElement('DIV');
				wrapper.style.position = 'absolute';
				wrapper.style.top = '25px';
				wrapper.style.left = '50%';
				var width = 0;
				var size = 35;
				var colors = ['#333', '#555', '#777', '#999'];
				for (var i = 0; i < position.length; i++) {
					var x = position[i].x, y = position[i].y;
					var elem = document.createElement('SPAN');
					elem.style.position = 'absolute';
					elem.style.backgroundColor = colors[i];
					elem.style.height = elem.style.width = size + 'px';
					elem.style.top = y * size + 'px'; elem.style.left = x * size + 'px';
					width = Math.max(x*size, width);
					wrapper.appendChild(elem);
				}
				wrapper.style.marginLeft = -1 * width / 2 - size + 'px';
				this.field.preview.innerHTML = '';
				this.field.preview.appendChild(wrapper);
		};
};


var Stick = function () {
		Stick.prototype.superclass.apply(this, arguments);
		this.color = '#0f0';
		this.position = [{x:8,y:1}, {x:8,y:2}, {x:8,y:3}, {x:8,y:4}];
		this.onRotate = function () {
			var pos = {x:this.position[1].x, y:this.position[1].y};
			var position = this.copyPosition();
			if (this.rotateStatus) {
				for (var i in position) {
					var diff = pos.x - this.position[i].x;
					position[i].y += diff;
					position[i].x = pos.x;
				}
			} else {
				for (var i in position) {
					var diff = pos.y - this.position[i].y;
					position[i].x += diff;
					position[i].y = pos.y;						
				}
			}
			if (this.isFreeSpace(position)) {
				this.rotateStatus ^= 1;
				this.position = position;
				this.draw();
			}
		};
	};

var Square = function () {
		Square.prototype.superclass.apply(this, arguments);
		this.color = '#0a0afe';
		this.position = [{x:9,y:2}, {x:9,y:1}, {x:8,y:2}, {x:8,y:1}];
	};
	
var ZedLeft = function () {
		ZedLeft.prototype.superclass.apply(this, arguments);
		this.color = '#0003fe';
		this.position = [{x:7,y:1}, {x:8,y:1}, {x:8,y:2}, {x:9,y:2}];
		this.onRotate = function () {
			var position = this.copyPosition();
			if (this.rotateStatus) {
				position[0].x-=2;
				position[0].y-=2;
			} else {
				position[0].x+=2;
				position[0].y+=2;
			}
			if (this.isFreeSpace(position)) {
				this.rotateStatus ^= 1;
				this.position = position;
				this.draw();
			}
		};
	};
   
var ZedRight = function () {
		ZedRight.prototype.superclass.apply(this, arguments);
		this.color = '#01a3ff';
		this.position = [{x:8,y:1}, {x:9,y:1}, {x:7,y:2}, {x:8,y:2}];
		this.onRotate = function () {
			var position = this.copyPosition();
			if (this.rotateStatus) {
				position[1].x+=2;
				position[1].y-=2;
			} else {
				position[1].x-=2;
				position[1].y+=2;
			}
			if (this.isFreeSpace(position)) {
				this.rotateStatus ^= 1;
				this.position = position;
				this.draw();
			}
		};
	};
	
var TetDown = function () {
		TetDown.prototype.superclass.apply(this, arguments);
		this.color = '#ef4e1f';
		this.position = [{x:7,y:1}, {x:8,y:1}, {x:9,y:1}, {x:8,y:2}];
		this.onRotate = function () {
			var position = this.copyPosition();
			var rotateStatus = this.rotateStatus;
			switch (rotateStatus) {
				case 0 : 
					position[0].x++; position[0].y--;
					position[2].x--; position[2].y++;
					position[3].x--; position[3].y--;
					rotateStatus = 1;
					break;
				case 1 :					
					position[0].x++; position[0].y++;
					position[2].x--; position[2].y--;
					position[3].x++; position[3].y--;
					rotateStatus = 2;
					break;
				case 2 :		
					position[0].x--; position[0].y++;
					position[2].x++; position[2].y--;
					position[3].x++; position[3].y++;
					rotateStatus = 3;
					break;
				case 3 :
					position[0].x--; position[0].y--;
					position[2].x++; position[2].y++;
					position[3].x--; position[3].y++;
					rotateStatus = 0;
					break;
			}
			if (this.isFreeSpace(position)) {
				this.rotateStatus = rotateStatus;
				this.position = position;
				this.draw();
			}
		};
	};
	
var GRight = function () {
		GRight.prototype.superclass.apply(this, arguments);
		this.color = '#aadd1f';
		this.position = [{x:8,y:1}, {x:8,y:2}, {x:8,y:3}, {x:9,y:3}];
		this.onRotate = function () {
			var position = this.copyPosition();
			var rotateStatus = this.rotateStatus;
			switch (rotateStatus) {
				case 0 :
					position[0].x++; position[0].y++;
					position[2].x--; position[2].y--;
					position[3].x-=2;
					rotateStatus = 1;
					break;
				case 1 :
					position[0].x--; position[0].y++;
					position[2].x++; position[2].y--;
					position[3].y-=2;
					rotateStatus = 2;
					break;
				case 2 :
					position[0].x--; position[0].y--;
					position[2].x++; position[2].y++;
					position[3].x+=2;
					rotateStatus = 3;
					break;
				case 3 :
					position[0].x++; position[0].y--;
					position[2].x--; position[2].y++;
					position[3].y+=2;
					rotateStatus = 0;
					break;
			}
			if (this.isFreeSpace(position)) {
				this.rotateStatus = rotateStatus;
				this.position = position;
				this.draw();
			}			
		};
	};

var GLeft = function () {
		GLeft.prototype.superclass.apply(this, arguments);
		this.color = '#521e98';
		this.position = [{x:8,y:1}, {x:8,y:2}, {x:7,y:3}, {x:8,y:3}];
		this.onRotate = function () {
			var position = this.copyPosition();
			var rotateStatus = this.rotateStatus;
			switch (rotateStatus) {
				case 0 :
					position[0].x++; position[0].y++;
					position[2].y-=2;
					position[3].x--; position[3].y--;
					rotateStatus = 1;
					break;
				case 1:
					position[0].x--; position[0].y++;
					position[2].x+=2;
					position[3].x++; position[3].y--;
					rotateStatus = 2;
					break;
				case 2 :
					position[0].x--; position[0].y--;
					position[2].y+=2;
					position[3].x++; position[3].y++;
					rotateStatus = 3;
					break;
				case 3 :
					position[0].x++; position[0].y--;
					position[2].x-=2;
					position[3].x--; position[3].y++;
					rotateStatus = 0;
					break;
			}
			if (this.isFreeSpace(position)) {
				this.rotateStatus = rotateStatus;
				this.position = position;
				this.draw();
			}
		};
	};
Stick.prototype.superclass = Model;
Square.prototype.superclass = Model;
GLeft.prototype.superclass = Model;
GRight.prototype.superclass = Model;
ZedLeft.prototype.superclass = Model;
ZedRight.prototype.superclass = Model;
TetDown.prototype.superclass = Model;

var EventManager = {
		events : {
			'finish' : [],
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
    
var clearNode = function (node) {
	if (!node) return;
	while (node.firstChild) {
		node.removeChild(node.firstChild);
	}
};
