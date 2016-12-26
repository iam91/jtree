;(function(window, document, undefined){
    'use strict';

    /**
     * @todo 分离数据层操作
     */

    /**
     * U
     * @namespace
     */
    var U = {

    	addHandler: function(elem, type, handler, useCapture){
    		if(elem.attachEvent){
    			elem.attachEvent('on' + type, handler);
    		}
    		else if(elem.addEventListener){
    			elem.addEventListener(type, handler, useCapture || false);
    		}
    		else{
    			elem['on' + type] = handler;
    		}
    	},

    	removeHandler: function(element, type, handler, useCapture){
    		if(element.removeEventListener){
    			element.removeEventListener(type, handler, useCapture || false);
    		}
    		else if(element.detachEvent){
    			element.detachEvent('on' + type, handler);
    		}
    		else{
    			element['on' + type] = null;
    		}
    	},

    	setScope: function(scope, fn){
    		return function(){
    			fn.call(scope, arguments[0]);
    		};
    	},

    	computedStyle: function(elem, attr){
    		return elem.currentStyle ? elem.currentStyle[attr]
    			: getComputedStyle(elem, null)[attr];
    	},

    	select: function(elem){
    		var r = document.createRange();
    		if(elem){
    			r.selectNodeContents(elem);
    		}else{
    			r.collapse();
    		}

    		var sel = getSelection();
    		sel.removeAllRanges();
    		sel.addRange(r);

    		r.detach();
    		r = null;
    		sel = null;
    	},

    	deepCopy: deepCopy
    };

    function deepCopy(o){
        var r = null;
    	if(typeof o !== 'object'){
    		return o;
    	}else if(o instanceof Array){
    		r = [];
    		for(var i = 0; i < o.length; i++){
    			r.push(deepCopy(o[i]));
    		}
    		return r;
    	}else if(o instanceof Object){
    		r = {};
    		for(var k in o){
    			r[k] = deepCopy(o[k]);
    		}
    		return r;
    	}
    }

    /**
     * Mime
     * @namespace
     */
     var Mime = {
         map: {
             'text': {
                 'html': 'html',
                 'css' : 'css',
                 'plain': 'txt'
             },

             'application': {
                 'js': 'js',
                 'pdf': 'pdf',
                 'vnd.ms-powerpoint': 'ppt',
                 'msword': 'word',
                 'vnd.ms-excel': 'xls',
                 'zip': 'zip'
             },

             'image': 'pic',
             'video': 'video',
             'audio': 'audio'
         },

         getFormat: function(mime){
             var m = mime.split('/');
             var type = m[0];
             var subtype = m[1];
             var r = this.map[type];
             if(r){
                 return typeof r === 'string' ? r : r[subtype];
             }else{
                 return null;
             }
         }
     };

     var mimeclass = {};
     for(var type in Mime.map){
         var val = Mime.map[type];
         if(typeof val === 'string'){
             mimeclass[val] = 'dt-node__icon--' + val;
         }else{
             for(var subtype in val){
                 var subval = val[subtype];
                 mimeclass[subval] = 'dt-node__icon--' + subval;
             }
         }
     }

     Mime.classname = mimeclass;

    /**
     * View
     * @namespace
     */
    var View = {

        CLASS_NAME: {
            NODE                : 'dt-node',
            NODE_WRAP           : 'dt-node__wrap',
            NODE_HEAD           : 'dt-node__head',
            NODE_BODY           : 'dt-node__body',
            NODE_BODY_OPEN      : 'dt-node__body--open',
            NODE_ICON_FOLDER    : 'dt-node__icon--folder',
            NODE_ICON_OPEN      : 'dt-node__icon--open',
            NODE_TITLE          : 'dt-node__title',
            NODE_TITLE_FOUND    : 'dt-node__title--found',

            MENU                : 'dt-menu',
            SEARCH              : 'dt-search'
        },

        MENU : {
            TPL:
            '<ul class="dt-menu">' +
        		'<li><a name="create">create</a></li>' +
        		'<li><a name="delete">delete</a></li>' +
        		'<li><a name="rename">rename</a></li>' +
            	'<li>' +
                    '<a name="search">search</a>' +
                    '<ul>' +
                        '<li><input class="dt-search" type="text" placeholder="Keywords"></li>' +
                    '</ul>' +
                '</li>' +
        		'<li>' +
        			'<a>Edit</a>' +
        			'<ul>' +
        				'<li><a name="cut">cut</a></li>' +
        				'<li><a name="copy">copy</a></li>' +
        				'<li><a name="paste">paste</a></li>' +
        			'</ul>' +
        		'</li>' +
            '</ul>',
        },

        TPL:
            '<div class="dt-node__wrap">' +
                '<div class="dt-node__head">' +
                    '<span>' +
                    '</span>' +
                    '<span class="dt-node__title">' +
                    '{title}' +
                    '</span>' +
                '</div>' +
                '<div class="dt-node__body"></div>' +
            '</div>',

        /**
         * Returns the root element of current node when el is icon or title,
         * otherwise null is returned.
         * @param {HTMLElement} el
         * @param {HTMLElement|null}
         */
        currentNode: function(el){
            if(el.classList.contains(this.CLASS_NAME.NODE_ICON)){
                return el.parentNode.parentNode.parentNode;
            }else if(el.classList.contains(this.CLASS_NAME.NODE_TITLE)){
                return el.parentNode.parentNode.parentNode;
            }else{
                return null;
            }
        },

        getIcon: function(el){
            return el.firstChild.firstChild.firstChild;
        },

        getHead: function(el){
            return el.firstChild.firstChild;
        },

        getBody: function(el){
            return el.firstChild.lastChild;
        },

        getTitle: function(el){
            return el.firstChild.firstChild.firstChild.nextElementSibling;
        },

        appendMenu: function(el, menu){
            var head = this.getHead(el);
            head.appendChild(menu);
        },

        menuParent: function(menu){
            return menu.parentNode.parentNode.parentNode;
        }

    };

    /**
     * Enum for directory node type.
     * @readonly
     * @enum {number}
     */
    var NODE_TYPE = {
    	FOLDER : 0,
    	FILE   : 1
    };

    var CLASS_NAME = View.CLASS_NAME;

    var ENTER = 13;

    /* ================== Following is TreeNode definition ==================*/
    /**
     * TreeNode class
     * @constructor
     * @param {Tokens} tokenPool
     * @param {Object} data
     * @param {TreeNode|undefined} parent
     * @param {Number|undefined} id
     */
    function TreeNode(tokenPool, data, parent){

        this._data = data;
        this._token = null;
        this._tokenPool = tokenPool;

        this._el = null;

        /**
         * @type {TreeNode[]}
         */
        this._children = [];
        /**
         * @type {TreeNode}
         */
        this._parent = parent || null;

        this._lazy = false;
        this._expanded = false;
        this._isEditing = false;

        this._init(tokenPool);
    }

    TreeNode.prototype = {

         constructor: TreeNode,

         _init: function(){
             this._render(this._tokenPool);

             var data = this._data;

    		 var ic = View.getIcon(this._el);

            if(data.type == NODE_TYPE.FILE){
                var format = Mime.getFormat(data.mime);
                ic.classList.add(Mime.classname[format]);
            }else if(data.type === NODE_TYPE.FOLDER){
                ic.classList.add(CLASS_NAME.NODE_ICON_FOLDER);
            }

             if(typeof data.children === 'string'){
                 /**
                  * @todo lazy load children
                  */
                 this._lazy = true;
             }else if(data.children instanceof Array){
                 //render children
                 for(var i = 0; i < data.children.length; i++){
                     var child = new TreeNode(this._tokenPool, data.children[i], this);
                     this.appendChild(child);
                 }
             }
         },

         _render: function(){

            var data = this._data;

            //create element
            this._el = document.createElement('div');
            this._el.classList.add(CLASS_NAME.NODE);

            //render template
            this._el.innerHTML =  View.TPL.replace('{title}', data.title);

            //bind dom with view model
            var token = this._tokenPool.add(this);
            this._el.dataset.dtToken = token;
            this._token = token;
        },

        /**
         * @public
         * @param {TreeNode} child
         */
        appendChild: function(child){
            var elBody = View.getBody(this._el);
            elBody.appendChild(child.$element());
            this._children.push(child);
        },

    	/**
    	 * @public
    	 * @param {TreeNode} child
    	 * @return {Number} child index before removal
    	 */
        removeChild: function(child){
            var id = this._children.indexOf(child);
    		child.$element().remove();
            this._children.splice(id, 1);
    		return id;
        },



        enableEdit: function(){
            var title = View.getTitle(this._el);
            U.select(title);
        },

        disableEdit: function(){
            var title = View.getTitle(this._el);
            title.contentEditable = 'false';
            U.select();
        },

        expand: function(){
            if(this._data.type == NODE_TYPE.FOLDER){
                var ic = View.getIcon(this._el);
                var bd = View.getBody(this._el);

                ic.classList.add(CLASS_NAME.NODE_ICON_OPEN);
                bd.classList.add(CLASS_NAME.NODE_BODY_OPEN);
                this._expanded = true;
            }
        },

        fold: function(){
            if(this._data.type == NODE_TYPE.FOLDER){
                var ic = View.getIcon(this._el);
                var bd = View.getBody(this._el);

                ic.classList.remove(CLASS_NAME.NODE_ICON_OPEN);
                bd.classList.remove(CLASS_NAME.NODE_BODY_OPEN);
                this._expanded = false;
            }
        },

        toggleChildren: function(){
            if(this._expanded){
                this.fold();
            }else{
                this.expand();
            }
        },

        /**
         * @param {String} keywords
         */
        search: function(keywords){
            var r = false;
            var title = View.getTitle(this._el);
            title.classList.remove(CLASS_NAME.NODE_TITLE_FOUND);
            for(var i = 0; i < this._children.length; i++){
                r = this._children[i].search(keywords) || r;
            }
            if(this._data.title.indexOf(keywords) >= 0){
                /**
                 * @todo add more flexible searching
                 */
                r = true;
                title.classList.add(CLASS_NAME.NODE_TITLE_FOUND);
            }
            if(r){
                this.expand();
            }
            return r;
        },

    	/** Following are basic function (related to data model) **/

        delete: function(){
            var parent = this._parent;
            if(parent){
                var id = parent.removeChild(this);
        		//handle model
        		this._data.splice(id, 1);
            }
        },

        create: function(){
            var newData = {
                title: 'new',
                type: NODE_TYPE.FOLDER,
                children: []
            };
            var newNode = new TreeNode(this._tokenPool, newData);

    		this.appendChild(newNode);
            this.expand();
            newNode.rename();
    		//handle model
            this._data.children.push(newData);
        },

        rename: function(){
            var title = View.getTitle(this._el);
            if(this._isEditing){
                var newTitle = title.innerHTML.trim();
                this._isEditing = false;
    			//handle model
                this._data.title = newTitle;
            }else{
                title.contentEditable = 'true';
                title.focus();
                this._isEditing = true;
            }
        },

    	/**
    	 * @public
    	 * @param {TreeNode} node
    	 */
    	paste: function(node){
    		if(node && this._data.type == NODE_TYPE.FOLDER){
    			this.appendChild(node);
    			this.expand();
    			//handle model
    			this._data.children.push(node._data);
    		}
    	},

    	/**
    	 * @public
    	 * @return {TreeNode}
    	 */
    	copy: function(){
    		var copyData = U.deepCopy(this._data);
    		return new TreeNode(this._tokenPool, copyData);
    	},

    	/**
    	 * @public
    	 * @return {TreeNode|null}
    	 */
    	cut: function(){
    		if(this._parent){
    			var id = this._parent.removeChild(this);
    			//handle model
    			this._parent.$data().children.splice(id, 1);
    			return this;
    		}else{
    			return null;
    		}
    	},

    	/** Above are basic functions **/

    	/**
    	 * @public
         * @return {HTMLElement}
         */
        $element: function(){
            return this._el;
        },

    	/**
    	 * @public
    	 * @return {Object}
    	 */
    	$data: function(){
    		return this._data;
    	}
     };
     /* ================== Above is TreeNode definition ==================*/

     /* ================== Following is Tokens definition ==================*/
     function Tokens(){
         this._tokens = [];
     }

     Tokens.prototype = {

         constructor: Tokens,

         get: function(token){
             return this._tokens[token];
         },

         add: function(node){
             var token = this._tokens.length;
             this._tokens.push(node);
             return token;
         }

     };
     /* ================== Above is Tokens definition ==================*/

     /* ================== Following is Tree definition ==================*/
     /**
      * Tree class
      * @constructor
      */

      function Tree(data, el){
        this._data = data || null;
        this._tokenPool = new Tokens();

        this._el = el || null;
        this._elRoot = null;
        this._elMenu = null;

        this._menuShowing = false;
        this._clipBoard = null;

        this._init();
      }

     Tree.prototype = {

         constructor: Tree,

         _init: function(){
            if(this._data){
                var root = new TreeNode(this._tokenPool, this._data);
                this._elRoot = root.$element();

                if(this._el){
                    this._el.appendChild(this._elRoot);
                }else{
                    this._el = this._elRoot;
                }

                this._renderMenu();
                this._bind();
            }
         },

         _renderMenu: function(){
             this._elMenu = document.createElement('div');
             this._elMenu.innerHTML = View.MENU.TPL;
             this._elMenu.classList.add(CLASS_NAME.MENU);
         },

         _bind: function(){
            //Toggle children
            U.addHandler(this._el, 'click', U.setScope(this, this._toggleChildren));
            //Toggle menu
            U.addHandler(window, 'contextmenu', U.setScope(this, this._toggleMenu));
            U.addHandler(window, 'click', U.setScope(this, this._toggleMenu));
            //Click menu
            U.addHandler(this._elMenu, 'click', U.setScope(this, this._clickMenu));
            //Enable edit
            U.addHandler(this._el, 'focus', U.setScope(this, this._enableEdit), true);
            //Disable edit
            U.addHandler(this._el, 'blur', U.setScope(this, this._disableEdit), true);
            U.addHandler(this._el, 'keydown', U.setScope(this, this._disableEdit));
            //Search
            U.addHandler(this._elMenu, 'blur', U.setScope(this, this._search), true);
            U.addHandler(this._elMenu, 'keydown', U.setScope(this, this._search));
         },

         _showMenu: function(el){
             View.appendMenu(el, this._elMenu);
             this._menuShowing = true;
         },

         _hideMenu: function(){
             try{
                 this._elMenu.remove();
             }catch(ex){
             }finally{
                 this._menuShowing = false;
             }
         },

         /** Following are event handlers **/

         _toggleChildren: function(e){
             var target = e.target;
             var currNodeEl = View.currentNode(target);
             if(currNodeEl){
                //icon or title is clicked
                var currNode = this._tokenPool.get(currNodeEl.dataset.dtToken);
                currNode.toggleChildren();
             }
             //if title is marked as found, remove found state when cliked
             target.classList.remove(CLASS_NAME.NODE_TITLE_FOUND);
         },

         _toggleMenu: function(e){
             var target = e.target;
             var type = e.type.toLowerCase();

             if(type === 'contextmenu' && target.classList.contains(CLASS_NAME.NODE_TITLE)){
                 e.preventDefault();
                 if(!this._menuShowing){
                     this._showMenu(View.currentNode(target));
                 }else{
                     this._hideMenu();
                 }
             }else if(!target.classList.contains(CLASS_NAME.SEARCH)){
                 //not the searching box clicked
                 if(this._menuShowing){
                     this._hideMenu();
                 }
             }
         },

         _clickMenu: function(e){
             var target = e.target;
             var command = target.name;

             var currNodeEl = View.menuParent(this._elMenu);
             var currNode = this._tokenPool.get(currNodeEl.dataset.dtToken);
             if(command){
                 var r = currNode[command](this._clipBoard);
                 this._clipBoard = r || this._clipBoard;
             }
         },

         _enableEdit: function(e){
     		var title = e.target;
             var currNodeEl = View.currentNode(title);
             if(currNodeEl){
                 //title focused
                 var currNode = this._tokenPool.get(currNodeEl.dataset.dtToken);
                 currNode.enableEdit();
             }
         },

         _disableEdit: function(e){
     		if((e.type === 'blur' ||
     		   e.type === 'keydown' && e.keyCode == ENTER) &&
               e.target.contentEditable === 'true'){
                 //event triggered by editable title
         		 var title = e.target;
                 var currNodeEl = View.currentNode(title);
                 var currNode = this._tokenPool.get(currNodeEl.dataset.dtToken);
                 currNode.disableEdit();
                 currNode.rename();
             }
         },

         _search: function(e){
             if((e.type === 'blur' ||
                e.type === 'keydown' && e.keyCode == ENTER) &&
                e.target.classList.contains(CLASS_NAME.SEARCH)){
                //event triggered by searching box
                var keywords = e.target.value;
                var currNodeEl = View.menuParent(this._elMenu);
                var currNode = this._tokenPool.get(currNodeEl.dataset.dtToken);
                currNode.search(keywords);
                this._hideMenu();
            }
         },

         /** Above are event handlers **/

         /**
          * @return {HTMLElement}
          */
         $element: function(){
            return this._el;
         }

     };
     /* ================== Above is Tree definition ==================*/

     //exports
     window.Tree = Tree;

})(window, document);
