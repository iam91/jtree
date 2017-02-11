(function(window, document, undefined) {
    'use strict';
    /**
     * Ajax
     * @namespace
     */
    var Ajax = {
        /**
         * @todo add timeout and other data format except for json
         */
        get: function(url, success, error) {
            if (url) {
                var xhr = new XMLHttpRequest();
                xhr.onreadystatechange = function() {
                    if (xhr.readyState === 4) {
                        if (xhr.status === 200) {
                            var data = JSON.parse(xhr.responseText);
                            success(data);
                        } else {
                            error();
                        }
                    }
                };
                xhr.open('GET', url, true);
                xhr.send(null);
            }
        }
    };


    /**
     * U
     * @namespace
     */
    var U = {

        addHandler: function(elem, type, handler, useCapture) {
            if (elem.attachEvent) {
                elem.attachEvent('on' + type, handler);
            } else if (elem.addEventListener) {
                elem.addEventListener(type, handler, useCapture || false);
            } else {
                elem['on' + type] = handler;
            }
        },

        removeHandler: function(element, type, handler, useCapture) {
            if (element.removeEventListener) {
                element.removeEventListener(type, handler, useCapture || false);
            } else if (element.detachEvent) {
                element.detachEvent('on' + type, handler);
            } else {
                element['on' + type] = null;
            }
        },

        setScope: function(scope, fn) {
            return function() {
                fn.call(scope, arguments[0]);
            };
        },

        select: function(elem) {
            var r = document.createRange();
            if (elem) {
                r.selectNodeContents(elem);
            } else {
                r.collapse();
            }

            var sel = getSelection();
            sel.removeAllRanges();
            sel.addRange(r);

            r.detach();
            r = null;
            sel = null;
        },

        copy: function(o){
          var r = null;
          if(typeof o !== 'object'){
            r = o;
          }else if(o instanceof Array){
            r = [];
            for(var i = 0; i < o.length; i++){
              r.push(this.copy(o[i]));
            }
          }else if(o instanceof Object){
            r = {};
            for(var k in o){
              r[k] = this.copy(o[k]);
            }
          }
          return r;
        }
    };

    /**
     * View
     * @namespace
     */
    var View = {

        INDENT: 1,

        CLASS_NAME: {
            NODE: 'dt-node',
            NODE_HEAD: 'dt-node__head',
            NODE_BODY: 'dt-node__body',
            NODE_ICON: {
              FOLDER: 'dt-node__icon--folder',
              FILE: 'dt-node__icon--file'
            },
            NODE_TITLE: 'dt-node__title',
            NODE_SWITCH: {
              FOLDER: 'dt-node__switch--folder',
              FILE: 'dt-node__switch--file'
            },
            MENU: 'dt-menu',
            SEARCH: 'dt-search',

            NODE_OPEN: 'dt-node--open',
            SELECTED: 'dt-node--sel',
            SELECTED_BLUR: 'dt-node--selblur',
            COVERED: 'dt-node--covered',

            NODE_ICON_LOADING: 'dt-node__icon--loading',
            NODE_TITLE_FOUND: 'dt-node__title--found'
        },

        MENU: {
            TPL: [
              '<div><ul>',
                  '<li><a name="create">create</a></li>',
                  '<li><a name="delete">delete</a></li>',
                  '<li><a name="rename">rename</a></li>',
                  '<li>',
                    '<a name="search">search</a>',
                    '<ul>',
                      '<li>',
                        '<input class="dt-search" type="text" placeholder="Input keywords">',
                      '</li>',
                    '</ul>',
                  '</li>',
                  '<li>',
                    '<a>Edit</a>',
                    '<ul>',
                      '<li><a name="cut">cut</a></li>',
                      '<li><a name="copy">copy</a></li>',
                      '<li><a name="paste">paste</a></li>',
                    '</ul>',
                  '</li>',
                '</ul></div>',
            ].join('')
        },

        TPL: [
          '<div class="dt-node__head">',
            '<span class="dt-node__switch"></span>',
            '<span class="dt-node__icon"></span>',
            '<span class="dt-node__title">',
              '{title}',
            '</span>',
          '</div>',
          '<div class="dt-node__body"></div>',
        ].join(''),

        isIcon: function(el) {
            return el.classList.contains(this.CLASS_NAME.NODE_ICON.FOLDER) ||
              el.classList.contains(this.CLASS_NAME.NODE_ICON.FILE);
        },

        isSwitch: function(el) {
            return el.classList.contains(this.CLASS_NAME.NODE_SWITCH.FOLDER) ||
             el.classList.contains(this.CLASS_NAME.NODE_SWITCH.FILE);
        },

        isTitle: function(el) {
            return el.classList.contains(this.CLASS_NAME.NODE_TITLE);
        },

        isHead: function(el) {
            return el.classList.contains(this.CLASS_NAME.NODE_HEAD);
        },

        isSelected: function(el) {
            return el.classList.contains(this.CLASS_NAME.SELECTED);
        },

        isSearch: function(el) {
            return el.classList.contains(this.CLASS_NAME.SEARCH);
        },

        /**
         * Returns the root element of current node when el is icon, title or switcher,
         * otherwise null is returned.
         * @param {HTMLElement} el
         * @return {HTMLElement|null}
         */
        currentNode: function(el) {
            if (this.isIcon(el) || this.isTitle(el) || this.isSwitch(el)) {
                return el.parentNode.parentNode;
            } else if (this.isHead(el)) {
                return el.parentNode;
            } else {
                return null;
            }
        },

        getSwitch: function(el) {
            return el.firstChild.firstChild;
        },

        getIcon: function(el) {
            return el.firstChild.firstChild.nextElementSibling;
        },

        getHead: function(el) {
            return el.firstChild;
        },

        getBody: function(el) {
            return el.lastChild;
        },

        getTitle: function(el) {
            return el.firstChild.firstChild.nextElementSibling.nextElementSibling;
        },

        setIcon: function(el, type) {
            var ic = this.getIcon(el);
            ic.classList.add(type === NODE_TYPE.FILE ?
              this.CLASS_NAME.NODE_ICON.FILE : this.CLASS_NAME.NODE_ICON.FOLDER);
        },

        setSwitch: function(el, type) {
            var sw = this.getSwitch(el);
            sw.classList.add(type === NODE_TYPE.FILE ?
              this.CLASS_NAME.NODE_SWITCH.FILE : this.CLASS_NAME.NODE_SWITCH.FOLDER);
        },

        indent: function(el, depth){
          var head = View.getHead(el);
          head.style.paddingLeft = View.INDENT * depth + 'rem';
        },

        append: function(par, chd){
          var bd = this.getBody(par);
          bd.appendChild(chd);
        },

        detach: function(chd){
          chd.remove();
        },

        expand: function(el) {
            el.classList.add(this.CLASS_NAME.NODE_OPEN);
        },

        fold: function(el) {
            el.classList.remove(this.CLASS_NAME.NODE_OPEN);
        },

        startLoad: function(el) {
            var ic = View.getIcon(el);
            ic.classList.remove(this.CLASS_NAME.NODE_ICON_FOLDER);
            ic.classList.add(this.CLASS_NAME.NODE_ICON_LOADING);
        },

        stopLoad: function(el) {
            var ic = View.getIcon(el);
            ic.classList.remove(this.CLASS_NAME.NODE_ICON_LOADING);
            ic.classList.add(this.CLASS_NAME.NODE_ICON_FOLDER);
        },

        select: function(el) {
            el.classList.add(this.CLASS_NAME.SELECTED);
            el.classList.remove(this.CLASS_NAME.SELECTED_BLUR);
        },

        selblur: function(el) {
            el.classList.add(this.CLASS_NAME.SELECTED_BLUR);
            el.classList.remove(this.CLASS_NAME.SELECTED);
        },

        unselect: function(el) {
            el.classList.remove(this.CLASS_NAME.SELECTED);
            el.classList.remove(this.CLASS_NAME.SELECTED_BLUR);
        },

        cover: function(el) {
            el.classList.add(this.CLASS_NAME.COVERED);
        },

        uncover: function(el) {
            el.classList.remove(this.CLASS_NAME.COVERED);
        },

        setFound: function(el) {
            var title = View.getTitle(el);
            title.classList.add(this.CLASS_NAME.NODE_TITLE_FOUND);
        },

        clearFound: function(el) {
            var title = View.getTitle(el);
            title.classList.remove(this.CLASS_NAME.NODE_TITLE_FOUND);
        },

        appendMenu: function(el, menu) {
            var head = this.getHead(el);
            head.appendChild(menu);
        },

        menuParent: function(menu) {
            return menu.parentNode.parentNode;
        }

    };

    /**
     * Enum for directory node type.
     * @readonly
     * @enum {number}
     */
    var NODE_TYPE = {
        FOLDER: 0,
        FILE: 1
    };

    var CLASS_NAME = View.CLASS_NAME;

    var ENTER = 13;

    /* ================== Following is Tokens definition ==================*/
    function Tokens() {
        this._tokens = [];
    }

    Tokens.prototype = {

        constructor: Tokens,

        get: function(token) {
            return this._tokens[token];
        },

        add: function(node) {
            var token = this._tokens.length;
            this._tokens.push(node);
            return token;
        }

    };
    /* ================== Above is Tokens definition ==================*/

    /* ================== Following is TreeNode definition ==================*/
    /**
     * TreeNode class
     * @constructor
     * @param {Tokens} tokenPool
     * @param {Object} data
     * @param {TreeNode|undefined} parent
     */
    function TreeNode(tokenPool, data, parent) {

        this._data = data;
        this._token = null;
        this._tokenPool = tokenPool;
        //for indent computation
        this._depth = parent && (parent.getDepth() + 1) || 0;

        this._el = null;

        this._children = [];
        /**
         * @type {TreeNode}
         */
        this._parent = parent || null;

        this._lazy = false;
        this._selected = false;
        this._expanded = false;
        this._isEditing = false;
        this._isFolder = false;

        this._init(tokenPool);
    }

    TreeNode.prototype = {

        constructor: TreeNode,

        _init: function() {
            this._render();
            //bind dom with view model
            this._setToken();
            //add icons
            this._setIcon();
            //set children nodes
            var data = this._data;
            if (typeof data.children === 'string') {
                this._lazy = true;
            } else if (data.children instanceof Array) {
                for (var i = 0; i < data.children.length; i++) {
                    var child = new TreeNode(this._tokenPool, data.children[i], this);
                    this.appendChild(child);
                }
            }
        },

        _render: function() {
            //create element
            this._el = document.createElement('div');
            this._el.classList.add(CLASS_NAME.NODE);
            this._el.draggable = 'true';
            //render template
            this._el.innerHTML = View.TPL.replace('{title}', this._data.title);
        },

        _setToken: function() {
            var token = this._tokenPool.add(this);
            this._el.dataset.dtToken = token;
            this._token = token;
        },

        _setIcon: function() {
            var data = this._data;
            View.setIcon(this._el, data.type);
            View.setSwitch(this._el, data.type);
            this._isFolder = data.type === NODE_TYPE.FOLDER;
        },

        _loadSuccess: function(newData) {
            if (newData) {
                var child = new TreeNode(this._tokenPool, newData, this);
                this.appendChild(child);
                //handle data model
                this._data.children = [newData];
                this._lazy = false;
            }
            View.stopLoad(this._el);
            this._expand();
        },

        _loadError: function() {
            alert(this._data.title + ' data load error!');
            View.stopLoad(this._el);
        },

        _expand: function() {
            if (this._isFolder) {
                View.expand(this._el);
                this._expanded = true;
            }
        },

        /**
         * @public
         * @param {TreeNode} child
         */
        appendChild: function(child) {
            View.append(this._el, child.getElem());
            this._children.push(child);
            child.setDepth(this.getDepth() + 1);
        },

        /**
         * @public
         * @param {TreeNode} child
         * @return {Number} child index before removal
         */
        removeChild: function(child) {
            View.detach(child.getElem());
            var id = this._children.indexOf(child);
            this._children.splice(id, 1);
            return id;
        },

        enableEdit: function() {
            var title = View.getTitle(this._el);
            U.select(title);
        },

        disableEdit: function() {
            var title = View.getTitle(this._el);
            title.contentEditable = 'false';
            U.select();
        },

        expand: function() {
            if (this._lazy && typeof this._data.children === 'string') {
                var url = this._data.children;
                Ajax.get(url,
                    U.setScope(this, this._loadSuccess),
                    U.setScope(this, this._loadError)
                );
                View.startLoad(this._el);
            } else {
                View.stopLoad(this._el);
                this._expand();
            }
        },

        fold: function() {
            if (this._isFolder) {
                View.fold(this._el);
                this._expanded = false;
            }
        },

        toggleChildren: function() {
            if (this._expanded) {
                this.fold();
            } else {
                this.expand();
            }
        },

        /**
         * @param {String} keywords
         */
        search: function(keywords) {
            var r = false;
            var title = View.getTitle(this._el);
            View.clearFound(this._el);
            for (var i = 0; i < this._children.length; i++) {
                r = this._children[i].search(keywords) || r;
            }
            if (this._data.title.indexOf(keywords) >= 0) {
                /**
                 * @todo add more flexible searching
                 */
                r = true;
                View.setFound(this._el);
            }
            if (r) {
                this.expand();
            }
            return r;
        },

        /** Following are basic function (related to data model) **/

        delete: function() {
            var parent = this._parent;
            if (parent) {
                var id = parent.removeChild(this);
                //handle model
                this._data.splice(id, 1);
            }
        },

        create: function() {
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

        rename: function() {
            var title = View.getTitle(this._el);
            //!this method is coupled with dom
            if (this._isEditing) {
                var newTitle = title.innerHTML.trim();
                this._isEditing = false;
                //handle model
                this._data.title = newTitle;
            } else {
                title.contentEditable = 'true';
                title.focus();
                this._isEditing = true;
            }
        },

        /**
         * @public
         * @param {TreeNode} node
         */
        paste: function(node) {
            if (node && this._isFolder) {
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
        copy: function() {
            var copyData = U.copy(this._data);
            return new TreeNode(this._tokenPool, copyData);
        },

        /**
         * @public
         * @return {TreeNode|null}
         */
        cut: function() {
            if (this._parent) {
                var id = this._parent.removeChild(this);
                //handle model
                this._parent.getData().children.splice(id, 1);
                return this;
            } else {
                return null;
            }
        },

        /** Above are basic functions **/

        selBlur: function() {
            View.selblur(this._el);
        },

        select: function() {
            this._selected = true;
            View.select(this._el);
        },

        unselect: function() {
            this._selected = false;
            View.unselect(this._el);
        },

        cover: function() {
            View.cover(this._el);
        },

        uncover: function() {
            View.uncover(this._el);
        },

        isSelected: function() {
            return this._selected;
        },

        isFolder: function() {
            return this._isFolder;
        },

        isLazy: function() {
            return this._lazy;
        },

        /**
         * @public
         * @return {HTMLElement}
         */
        getElem: function() {
            return this._el;
        },

        /**
         * @public
         * @return {Object}
         */
        getData: function() {
            return this._data;
        },

        /**
         * @public
         * @return {Number}
         */
        getDepth: function() {
            return this._depth;
        },

        /**
         * @public
         * @param {Number} dep
         */
        setDepth: function(dep) {
            View.indent(this._el, dep);
            //reset children's depths
            for (var i = 0; i < this._children.length; i++) {
                this._children[i].setDepth(dep + 1);
            }
            this._depth = dep;
        }
    };
    /* ================== Above is TreeNode definition ==================*/

    /* ================== Following is Tree definition ==================*/
    /**
     * Tree class
     * @constructor
     */

    function Tree(data, el) {
        this._data = U.copy(data) || null;
        this._tokenPool = new Tokens();

        this._el = el || null;
        this._elRoot = null;
        this._elMenu = null;

        this._menuShowing = false;
        this._clipBoard = null;
        this._selectedNode = null;
        this._draggedNode = null;

        this._init();
    }

    Tree.prototype = {

        constructor: Tree,

        _init: function() {
            if (this._data) {
                var root = new TreeNode(this._tokenPool, this._data);
                this._elRoot = root.getElem();

                if (this._el) {
                    this._el.appendChild(this._elRoot);
                } else {
                    this._el = this._elRoot;
                }

                this._renderMenu();
                this._bind();
            }
        },

        _renderMenu: function() {
            this._elMenu = document.createElement('div');
            this._elMenu.innerHTML = View.MENU.TPL;
            this._elMenu.classList.add(CLASS_NAME.MENU);
        },

        _bind: function() {
            //Select
            U.addHandler(this._el, 'click', U.setScope(this, this._select));
            //Toggle children
            U.addHandler(this._el, 'click', U.setScope(this, this._toggleChildren));
            U.addHandler(this._el, 'dblclick', U.setScope(this, this._toggleChildren));
            //Toggle menu
            U.addHandler(this._el, 'contextmenu', U.setScope(this, this._toggleMenu));
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
            //outer click
            U.addHandler(window, 'click', U.setScope(this, this._selBlur));
            //drag
            U.addHandler(this._el, 'dragstart', U.setScope(this, this._dragStart));
            U.addHandler(this._el, 'dragenter', U.setScope(this, this._dragCover));
            U.addHandler(this._el, 'dragleave', U.setScope(this, this._dragCover));
            U.addHandler(this._el, 'dragover', U.setScope(this, this._dragOver));
            U.addHandler(this._el, 'drop', U.setScope(this, this._dragDrop));
        },


        _showMenu: function(el) {
            View.appendMenu(el, this._elMenu);
            this._menuShowing = true;
        },

        _hideMenu: function() {
            try {
                this._elMenu.remove();
            } catch (ex) {} finally {
                this._menuShowing = false;
            }
        },

        /** Following are event handlers **/

        _dragStart: function(e) {
            var target = e.target;
            var currNode = this._tokenPool.get(target.dataset.dtToken);
            currNode.fold();
            this._draggedNode = currNode;
            //for firefox, drag image should be triggered by setData?
            e.dataTransfer.setData('text/html', '');
            e.dataTransfer.setDragImage(target, 0, 0);
        },

        _dragCover: function(e) {
            var target = e.target;
            //for firefox, this event's target is a #text node
            target = target.nodeType === 3 ? target.parentNode : target;

            if (View.isTitle(target)) {
                var currNodeEl = View.currentNode(target);
                var currNode = this._tokenPool.get(currNodeEl.dataset.dtToken);
                if (e.type === 'dragenter') {
                    currNode.cover();
                    currNode.expand();
                } else if (e.type === 'dragleave') {
                    currNode.uncover();
                }
            }
        },

        _dragOver: function(e) {
            e.preventDefault();
        },

        _dragDrop: function(e) {
            var target = e.target;
            if (View.isTitle(target)) {
                var currNodeEl = View.currentNode(target);
                var currNode = this._tokenPool.get(currNodeEl.dataset.dtToken);
                currNode.uncover();

                if (currNode.isFolder()) {
                    var draggedNode = this._draggedNode;
                    draggedNode.cut();
                    currNode.paste(draggedNode);
                }
            }
        },

        _selBlur: function(e) {
            //select blur
            var el = View.currentNode(e.target);
            if (!el && this._selectedNode) {
                this._selectedNode.selBlur();
            }
        },

        _select: function(e) {
            var target = e.target;
            var type = e.type;
            if (type === 'click' && View.isTitle(target) ||
                type === 'click' && View.isHead(target)) {
                var currNodeEl = View.currentNode(target);
                if (currNodeEl) {
                    //title is clicked
                    if (this._selectedNode) {
                        this._selectedNode.unselect();
                    }
                    this._selectedNode = this._tokenPool.get(currNodeEl.dataset.dtToken);
                    this._selectedNode.select();
                    //if title is marked as found, remove found state when cliked
                    View.clearFound(currNodeEl);
                }
            }
        },

        _toggleChildren: function(e) {
            var target = e.target;
            var type = e.type;

            var currNodeEl = null;
            var currNode = null;

            if (type === 'click' && View.isSwitch(target) ||
                type === 'dblclick' && View.isHead(target) ||
                type === 'dblclick' && View.isTitle(target)) {
                currNodeEl = View.currentNode(target);
                if (currNodeEl) {
                    //icon is clicked or title is dbl clicked
                    currNode = this._tokenPool.get(currNodeEl.dataset.dtToken);
                    currNode.toggleChildren();
                }
            }
        },

        _toggleMenu: function(e) {
            var target = e.target;
            var type = e.type.toLowerCase();

            if (type === 'contextmenu') {
                e.preventDefault();
                if (View.isHead(target)) {
                    this._menuEventFlowing = true;
                    if (!this._menuShowing) {
                        this._showMenu(View.currentNode(target));
                    } else {
                        this._hideMenu();
                    }
                }
            } else if (type === 'click') {
                if (e.button === 0) {
                    //in case that for ff, click will be triggered after contextmenu
                    if (this._menuShowing && !View.isSearch(target)) {
                        this._hideMenu();
                    }
                }
            }
        },

        _clickMenu: function(e) {
            var target = e.target;
            var command = target.name;

            var currNodeEl = View.menuParent(this._elMenu);
            var currNode = this._tokenPool.get(currNodeEl.dataset.dtToken);
            if (command) {
                var r = currNode[command](this._clipBoard);
                this._clipBoard = r || this._clipBoard;
            }
        },

        _enableEdit: function(e) {
            var title = e.target;
            var currNodeEl = View.currentNode(title);
            if (currNodeEl) {
                //title focused
                var currNode = this._tokenPool.get(currNodeEl.dataset.dtToken);
                currNode.enableEdit();
            }
        },

        _disableEdit: function(e) {
            if ((e.type === 'blur' ||
                    e.type === 'keydown' && e.keyCode == ENTER) &&
                e.target.contentEditable === 'true') {
                var title = e.target;
                var currNodeEl = View.currentNode(title);
                var currNode = this._tokenPool.get(currNodeEl.dataset.dtToken);
                currNode.disableEdit();
                currNode.rename();
            }
        },

        _search: function(e) {
            if ((e.type === 'blur' ||
                    e.type === 'keydown' && e.keyCode == ENTER) &&
                View.isSearch(e.target)) {
                //event triggered by searching box
                var keywords = e.target.value.trim();
                var currNodeEl = View.menuParent(this._elMenu);
                var currNode = this._tokenPool.get(currNodeEl.dataset.dtToken);
                if (keywords) {
                    //if keywords exists
                    var r = currNode.search(keywords);
                    this._hideMenu();
                }
            }
        },

        /** Above are event handlers **/

        /**
         * @return {HTMLElement}
         */
        getElem: function() {
            return this._el;
        },

        /**
         * @return {Object}
         */
        getData: function() {
            return this._data;
        }

    };
    /* ================== Above is Tree definition ==================*/

    //exports
    window.Tree = Tree;

})(window, document);
