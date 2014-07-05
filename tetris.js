


;
"use strict";


var parentObj = function () {
    
        this.options = {};
        
        this.init = function (options) {
                for (var k in options) {
                    this.options[k] = options[k];
                }
        };
    };


var Tetris = function (options) {
        parentObj.call(this);
        
        this.init(options);
        this.prepareLayout();
        
    };    
    
Tetris.prototype = {
                numVer : 20,
                numHor : 15,
                
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
                
                addListeners : function () {
                        var selt = this;

                        this.btnStart.onclick = function (event) {
                        };
                        
                        this.btnPause.onclick = function (event) {
                        };

                        this.btnStop.onclick = function (event) {
                        };
                }
        }; 
    
var Model = function () {
        
    };
    
var EventsLst = function () {
    
    };
    
    
    
    
