;(function(window, document, undefined) {
    'use strict';

    /**
     * @todo 分离数据层操作
     * @todo add mime
     */

    /**
     * Ajax
     * @namespace
     */
    var Ajax = {
        /**
         * @todo add timeout and other data format except for json
         */
        get: function(url, success, error){
            if(url){
                var xhr = new XMLHttpRequest();
                xhr.onreadystatechange = function(){
                    if(xhr.readyState === 4){
                        if(xhr.status === 200){
                            var data = JSON.parse(xhr.responseText);
                            for(var i = 0; i < success.length; i++){
                                if(success[i] instanceof Function){
                                    success[i](data);
                                }
                            }
                        }else{
                            if(error instanceof Function){
                                error();
                            }
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

        computedStyle: function(elem, attr) {
            return elem.currentStyle ? elem.currentStyle[attr] :
                getComputedStyle(elem, null)[attr];
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

        deepCopy: deepCopy
    };

    function deepCopy(o) {
        var r = null;
        if (typeof o !== 'object') {
            return o;
        } else if (o instanceof Array) {
            r = [];
            for (var i = 0; i < o.length; i++) {
                r.push(deepCopy(o[i]));
            }
            return r;
        } else if (o instanceof Object) {
            r = {};
            for (var k in o) {
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
                'css': 'css',
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

        getFormat: function(mime) {
            var m = mime.split('/');
            var type = m[0];
            var subtype = m[1];
            var r = this.map[type];
            if (r) {
                return typeof r === 'string' ? r : r[subtype];
            } else {
                return null;
            }
        }
    };

    var mimeclass = {};
    for (var type in Mime.map) {
        var val = Mime.map[type];
        if (typeof val === 'string') {
            mimeclass[val] = 'dt-node__icon--' + val;
        } else {
            for (var subtype in val) {
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
            NODE: 'dt-node',
            NODE_WRAP: 'dt-node__wrap',
            NODE_HEAD: 'dt-node__head',
            NODE_BODY: 'dt-node__body',
            NODE_BODY_OPEN: 'dt-node__body--open',
            NODE_SWITCH: 'dt-node__switch',
            NODE_SWITCH_OPEN: 'dt-node__switch--open',
            NODE_SWITCH_HIDE: 'dt-node__switch--hide',
            NODE_ICON_LOADING: 'dt-node__icon--loading',
            NODE_ICON_FOLDER: 'dt-node__icon--folder',
            NODE_ICON_OPEN: 'dt-node__icon--open',
            NODE_ICON_UNKNOWN: 'dt-node__icon--unknown',
            NODE_TITLE: 'dt-node__title',
            NODE_TITLE_FOUND: 'dt-node__title--found',

            MENU: 'dt-menu',
            SEARCH: 'dt-search',

            COVERED: 'dt-node--covered',
            SELECTED: 'dt-node--sel',
            SELECTED_BLUR: 'dt-node--selblur'
        },

        MENU: {
            TPL: '<div><ul>' +
                    '<li><a name="create">create</a></li>' +
                    '<li><a name="delete">delete</a></li>' +
                    '<li><a name="rename">rename</a></li>' +
                    '<li>' +
                        '<a name="search">search</a>' +
                        '<ul>' +
                            '<li>' +
                                '<input class="dt-search" type="text" placeholder="Input keywords">' +
                            '</li>' +
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
                '</ul></div>',
        },

        TPL: '<div class="dt-node__wrap">' +
                '<div class="dt-node__head">' +
                    '<span class="dt-node__switch"></span>' +
                    '<span></span>' +
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
        currentNode: function(el) {
            if (el.classList.contains(this.CLASS_NAME.NODE_ICON)) {
                return el.parentNode.parentNode.parentNode;
            } else if (el.classList.contains(this.CLASS_NAME.NODE_TITLE)) {
                return el.parentNode.parentNode.parentNode;
            } else if (el.classList.contains(this.CLASS_NAME.NODE_SWITCH)) {
                return el.parentNode.parentNode.parentNode;
            } else {
                return null;
            }
        },

        getSwitch: function(el){
            return el.firstChild.firstChild.firstChild;
        },

        getIcon: function(el) {
            return el.firstChild.firstChild.firstChild.nextElementSibling;
        },

        getHead: function(el) {
            return el.firstChild.firstChild;
        },

        getBody: function(el) {
            return el.firstChild.lastChild;
        },

        getTitle: function(el) {
            return el.firstChild.firstChild.firstChild.nextElementSibling.nextElementSibling;
        },

        appendMenu: function(el, menu) {
            var head = this.getHead(el);
            head.appendChild(menu);
        },

        menuParent: function(menu) {
            return menu.parentNode.parentNode.parentNode;
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
        this._selected = false;
        this._expanded = false;
        this._isEditing = false;

        this._isFolder = false;

        this._init(tokenPool);
    }

    TreeNode.prototype = {

        constructor: TreeNode,

        _init: function() {
            this._render(this._tokenPool);

            var data = this._data;

            var ic = View.getIcon(this._el);

            //add icons
            if (data.type === NODE_TYPE.FILE) {
                var format = null;
                var sw = View.getSwitch(this._el);
                sw.classList.add(CLASS_NAME.NODE_SWITCH_HIDE);
                if (data.mime && (format = Mime.getFormat(data.mime))) {
                    ic.classList.add(Mime.classname[format]);
                } else {
                    ic.classList.add(CLASS_NAME.NODE_ICON_UNKNOWN);
                }
                this._isFolder = false;
            } else if (data.type === NODE_TYPE.FOLDER) {
                ic.classList.add(CLASS_NAME.NODE_ICON_FOLDER);
                this._isFolder = true;
            }

            if (typeof data.children === 'string') {
                this._lazy = true;
            } else if (data.children instanceof Array) {
                //render children
                for (var i = 0; i < data.children.length; i++) {
                    var child = new TreeNode(this._tokenPool, data.children[i], this);
                    this.appendChild(child);
                }
            }
        },

        _render: function() {

            var data = this._data;

            //create element
            this._el = document.createElement('div');
            this._el.classList.add(CLASS_NAME.NODE);
            this._el.draggable = 'true';

            //render template
            this._el.innerHTML = View.TPL.replace('{title}', data.title);

            //bind dom with view model
            var token = this._tokenPool.add(this);
            this._el.dataset.dtToken = token;
            this._token = token;
        },

        _loadSuccess: function(newData){
            if(newData){
                var child = new TreeNode(this._tokenPool, newData, this);
                this.appendChild(child);
                //handle data model
                this._data.children = [newData];
                this._lazy = false;
            }
            this._stopLoad();
        },

        _loadError: function(){
            alert(this._data.title + ' data load error!');
            this._stopLoad();
        },

        _startLoad: function(){
            var ic = View.getIcon(this._el);
            ic.classList.remove(CLASS_NAME.NODE_ICON_FOLDER);
            ic.classList.add(CLASS_NAME.NODE_ICON_LOADING);
        },

        _stopLoad: function(){
            var ic = View.getIcon(this._el);
            ic.classList.remove(CLASS_NAME.NODE_ICON_LOADING);
            ic.classList.add(CLASS_NAME.NODE_ICON_FOLDER);
        },

        /**
         * @param {Function|Function[]} success callback executed when loading succeeds.
         */
        load: function(success){
            /**
             * @todo refine async procedure
             */
            if (this._lazy && typeof this._data.children === 'string') {
                //load the async data
                var url = this._data.children;

                var succ = success instanceof Array ? success : [success];
                succ.unshift(U.setScope(this, this._loadSuccess));

                Ajax.get(url,
                    succ,
                    U.setScope(this, this._loadError));
                this._startLoad();
            }
        },

        /**
         * @public
         * @param {TreeNode} child
         */
        appendChild: function(child) {
            var elBody = View.getBody(this._el);
            elBody.appendChild(child.$element());
            this._children.push(child);
        },

        /**
         * @public
         * @param {TreeNode} child
         * @return {Number} child index before removal
         */
        removeChild: function(child) {
            var id = this._children.indexOf(child);
            child.$element().remove();
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

        _expand: function(){
            if (this._isFolder) {
                var ic = View.getIcon(this._el);
                var sw = View.getSwitch(this._el);
                var bd = View.getBody(this._el);
                sw.classList.add(CLASS_NAME.NODE_SWITCH_OPEN);
                ic.classList.add(CLASS_NAME.NODE_ICON_OPEN);
                bd.classList.add(CLASS_NAME.NODE_BODY_OPEN);
                this._expanded = true;
            }
        },

        /**
         * @param {Function} callback The callback executed when lazy load succeeds.
         */
        expand: function(callback) {
            if (this._lazy && typeof this._data.children === 'string'){
                var url = this._data.children;
                Ajax.get(url,
                    U.setScope(this, this._loadSuccess),
                    U.setScope(this, this._loadError)
                );
                this._startLoad();
            }
        },

        fold: function() {
            if (this._isFolder) {
                var sw = View.getSwitch(this._el);
                var ic = View.getIcon(this._el);
                var bd = View.getBody(this._el);
                sw.classList.remove(CLASS_NAME.NODE_SWITCH_OPEN);
                ic.classList.remove(CLASS_NAME.NODE_ICON_OPEN);
                bd.classList.remove(CLASS_NAME.NODE_BODY_OPEN);
                this._expanded = false;
            }
        },

        toggleChildren: function() {
            if (this._expanded) {
                this.fold();
            } else {
                if(this._lazy){
                    this.load(U.setScope(this, this.expand));
                }else{
                    this.expand();
                }
            }
        },

        /**
         * @param {String} keywords
         */
        search: function(keywords) {
            var r = false;
            var title = View.getTitle(this._el);
            title.classList.remove(CLASS_NAME.NODE_TITLE_FOUND);
            for (var i = 0; i < this._children.length; i++) {
                r = this._children[i].search(keywords) || r;
            }
            if (this._data.title.indexOf(keywords) >= 0) {
                /**
                 * @todo add more flexible searching
                 */
                r = true;
                title.classList.add(CLASS_NAME.NODE_TITLE_FOUND);
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
            var copyData = U.deepCopy(this._data);
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
                this._parent.$data().children.splice(id, 1);
                return this;
            } else {
                return null;
            }
        },

        /** Above are basic functions **/

        selBlur: function(){
            var elTitle = View.getTitle(this._el);
            elTitle.classList.add(CLASS_NAME.SELECTED_BLUR);
        },

        select: function(){
            this._selected = true;
            var elTitle = View.getTitle(this._el);
            elTitle.classList.remove(CLASS_NAME.SELECTED_BLUR);
            elTitle.classList.add(CLASS_NAME.SELECTED);
        },

        unselect: function(){
            this._selected = false;
            var elTitle = View.getTitle(this._el);
            elTitle.classList.remove(CLASS_NAME.SELECTED);
            elTitle.classList.remove(CLASS_NAME.SELECTED_BLUR);
        },

        cover: function(){
            var elTitle = View.getTitle(this._el);
            elTitle.classList.add(CLASS_NAME.COVERED);
        },

        uncover: function(){
            var elTitle = View.getTitle(this._el);
            elTitle.classList.remove(CLASS_NAME.COVERED);
        },

        isSelected: function(){
            return this._selected;
        },

        isFolder: function(){
            return this._isFolder;
        },

        isLazy: function(){
            return this._lazy;
        },

        /**
         * @public
         * @return {HTMLElement}
         */
        $element: function() {
            return this._el;
        },

        /**
         * @public
         * @return {Object}
         */
        $data: function() {
            return this._data;
        }
    };
    /* ================== Above is TreeNode definition ==================*/

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

    /* ================== Following is Tree definition ==================*/
    /**
     * Tree class
     * @constructor
     */

    function Tree(data, el) {
        this._data = U.deepCopy(data) || null;
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
                this._elRoot = root.$element();

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
            /////////////
            U.addHandler(this._el, 'dragstart', U.setScope(this, this._dragStart));
            U.addHandler(this._el, 'dragenter', U.setScope(this, this._dragCover));
            U.addHandler(this._el, 'dragleave', U.setScope(this, this._dragCover));
            U.addHandler(this._el, 'dragover', U.setScope(this, this._dragOver));
            U.addHandler(this._el, 'drop', U.setScope(this, this._dragDrop));
            /////////////
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

        _dragStart: function(e){
            var target = e.target;
            var currNode = this._tokenPool.get(target.dataset.dtToken);
            currNode.fold();
            this._draggedNode = currNode;
            //for firfox, drag image should be triggered by setData?
            e.dataTransfer.setData('text/html', '');
            e.dataTransfer.setDragImage(target, 0, 0);
        },

        _dragCover: function(e){
            var target = e.target;

            //for firfox, this event's target is a #text node
            target = target.nodeType === 3 ? target.parentNode : target;

            if(target.classList.contains(CLASS_NAME.NODE_TITLE)){
                var currNodeEl = View.currentNode(target);
                var currNode = this._tokenPool.get(currNodeEl.dataset.dtToken);
                if(e.type === 'dragenter'){
                    currNode.cover();
                    if(currNode.isLazy()){
                        currNode.load(U.setScope(currNode, currNode.expand));
                    }else{
                        currNode.expand();
                    }
                }else if(e.type === 'dragleave'){
                    currNode.uncover();
                }
            }
        },

        _dragOver: function(e){
            e.preventDefault();
        },

        _dragDrop: function(e){
            var target = e.target;
            if(target.classList.contains(CLASS_NAME.NODE_TITLE)){
                var currNodeEl = View.currentNode(target);
                var currNode = this._tokenPool.get(currNodeEl.dataset.dtToken);
                currNode.uncover();

                if(currNode.isFolder()){
                    var draggedNode = this._draggedNode;
                    draggedNode.cut();
                    currNode.paste(draggedNode);
                }
            }
        },

        _selBlur: function(e){
            //select blur
            if(!e.target.classList.contains(CLASS_NAME.SELECTED) && this._selectedNode){
                this._selectedNode.selBlur();
            }
        },

        _select: function(e){
            var target = e.target;
            var type = e.type;
            if(type === 'click' && target.classList.contains(CLASS_NAME.NODE_TITLE)){
                var currNodeEl = View.currentNode(target);
                if (currNodeEl) {
                    //title is clicked
                    if(this._selectedNode){
                        this._selectedNode.unselect();
                    }
                    this._selectedNode = this._tokenPool.get(currNodeEl.dataset.dtToken);
                    this._selectedNode.select();
                    //if title is marked as found, remove found state when cliked
                    target.classList.remove(CLASS_NAME.NODE_TITLE_FOUND);
                }
            }
        },

        _toggleChildren: function(e) {
            var target = e.target;
            var type = e.type;

            var currNodeEl = null;
            var currNode = null;

            if(type === 'click' && target.classList.contains(CLASS_NAME.NODE_SWITCH) ||
                type === 'dblclick' && target.classList.contains(CLASS_NAME.NODE_TITLE)){
                currNodeEl = View.currentNode(target);
                if (currNodeEl) {
                    //icon is clicked title is dbl clicked
                    currNode = this._tokenPool.get(currNodeEl.dataset.dtToken);
                    currNode.toggleChildren();
                }
            }
        },

        _toggleMenu: function(e) {
            var target = e.target;
            var type = e.type.toLowerCase();

            if(type === 'contextmenu'){
                e.preventDefault();
                if(target.classList.contains(CLASS_NAME.NODE_TITLE)){
                    this._menuEventFlowing = true;
                    if (!this._menuShowing) {
                        this._showMenu(View.currentNode(target));
                    } else {
                        this._hideMenu();
                    }
                }
            }else if(type === 'click'){
                if(e.button === 0){
                    //in case that for ff, click will be triggered after contextmenu
                    if(this._menuShowing && !target.classList.contains(CLASS_NAME.SEARCH)){
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
                //event triggered by editable title
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
                e.target.classList.contains(CLASS_NAME.SEARCH)) {
                //event triggered by searching box
                var keywords = e.target.value.trim();
                var currNodeEl = View.menuParent(this._elMenu);
                var currNode = this._tokenPool.get(currNodeEl.dataset.dtToken);
                if(keywords){
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
        $element: function() {
            return this._el;
        },

        /**
         * @return {Object}
         */
        $data: function(){
            return this._data;
        }

    };
    /* ================== Above is Tree definition ==================*/

    //exports
    window.Tree = Tree;

})(window, document);
