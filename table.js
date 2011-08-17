/*!
 * Basis javasript library 
 * http://code.google.com/p/basis-js/
 *
 * @copyright
 * Copyright (c) 2006-2011 Roman Dvornov.
 *
 * @license
 * GNU General Public License v2.0 <http://www.gnu.org/licenses/gpl-2.0.html>
 */

  (function(){

   /**
    * Table namespace
    *
    * @link ./test/speed-table.html
    * @link ./demo/common/match.html
    * @link ./demo/common/grouping.html
    *
    * @namespace Basis.Controls.Table
    */

    var namespace = 'Basis.Controls.Table';

    // import names

    var Class = Basis.Class;
    var Event = Basis.Event;
    var DOM = Basis.DOM;
    var CSS = Basis.CSS;
    var Template = Basis.Html.Template;

    var getter = Function.getter;
    var extend = Object.extend;
    var classList = Basis.CSS.classList;

    var nsWrappers = DOM.Wrapper;
    var TmplNode = nsWrappers.TmplNode;
    var TmplContainer = nsWrappers.TmplContainer;
    var TmplControl = nsWrappers.TmplControl;
    var TmplPartitionNode = nsWrappers.TmplPartitionNode;
    var TmplGroupingNode = nsWrappers.TmplGroupingNode;
    var GroupingNode = nsWrappers.GroupingNode;
    var PartitionNode = nsWrappers.PartitionNode;

    //
    // Main part
    //

    //
    // Table Header
    //

    var HEADERCELL_CSS_SORTABLE = 'sortable';
    var HEADERCELL_CSS_SORTDESC = 'sort-order-desc';

    //
    // Table Header Grouping
    //

    var HeaderPartitionNode = Basis.Class(nsWrappers.TmplNode, {
      template: new Template(
        '<th{element|selected} class="Basis-Table-Header-Cell">' +
          '<div class="Basis-Table-Sort-Direction"></div>' +
          '<div class="Basis-Table-Header-Cell-Content">' + 
            '<span{content} class="Basis-Table-Header-Cell-Title">{titleText}</span>' +
          '</div>' +
        '</th>'
      ),
      event_update: function(object, delta){
        nsWrappers.TmplNode.prototype.event_update.call(this, object, delta);
        this.tmpl.titleText.nodeValue = this.titleGetter(this);
      }
    });

    var HeaderGroupingNode = Basis.Class(GroupingNode, {
      event_ownerChanged: function(node, oldOwner){
        if (oldOwner)
          DOM.remove(this.headerRow);

        if (this.owner && this.owner.element)
        {
          var cursor = this;
          var element = this.owner.element;
          do
          {
            DOM.insert(element, cursor.headerRow, DOM.INSERT_BEGIN);
          } while (cursor = cursor.localGrouping);
        }
        
        GroupingNode.prototype.event_ownerChanged.call(this, node, oldOwner);
      },

      childClass: {
        init: function(config){
          PartitionNode.prototype.init.call(this, config);
          this.cell = new HeaderPartitionNode({ titleGetter: this.titleGetter, delegate: this });
        },
        event_childNodesModified: function(object, delta){
          var colSpan = 0;
          if (this.nodes[0] && this.nodes[0] instanceof this.constructor)
          {
            for (var i = 0, node; node = this.nodes[i]; i++)
              colSpan += node.cell.element.colSpan;
          }
          else
            colSpan = this.nodes.length;

          this.cell.element.colSpan = colSpan;

          if (this.groupNode)
            this.groupNode.event_childNodesModified.call(this.groupNode, this.groupNode, {});
        },
        destroy: function(){
          PartitionNode.prototype.destroy.call(this);
          
          this.cell.destroy();
        }
      },

      init: function(config){
        GroupingNode.prototype.init.call(this, config);
        this.element = this.childNodesElement = this.headerRow = DOM.createElement('tr.Basis-Table-Header-GroupContent');
      },
      insertBefore: function(newChild, refChild){
        var newChild = GroupingNode.prototype.insertBefore.call(this, newChild, refChild);

        var refElement = newChild.nextSibling && newChild.nextSibling.cell.element;
        DOM.insert(this.headerRow, newChild.cell.element, DOM.INSERT_BEFORE, refElement);

        return newChild;
      },
      removeChild: function(oldChild){
        DOM.remove(oldChild.cell.element);
        GroupingNode.prototype.removeChild.call(oldChild);
      },
      destroy: function(){
        GroupingNode.prototype.destroy.call(this);
        this.headerRow = null;
      }
    });
    HeaderGroupingNode.prototype.localGroupingClass = HeaderGroupingNode;

   /**
    * @class
    */

    var HeaderCell = Class(TmplNode, {
      className: namespace + '.HeaderCell',

      sorting: null,
      defaultOrder: false,
      groupId: 0,

      template: new Template(
        '<th{element|selected} class="Basis-Table-Header-Cell" event-click="click">' +
          '<div class="Basis-Table-Sort-Direction"/>' +
          '<div class="Basis-Table-Header-Cell-Content">' + 
            '<span{content} class="Basis-Table-Header-Cell-Title"/>' +
          '</div>' +
        '</th>'
      ),

      action: {
        click: function(event){
          if (this.selected)
          {
            var owner = this.parentNode && this.parentNode.owner;
            if (owner)
              owner.setLocalSorting(owner.localSorting, !owner.localSortingDesc);
          }
          else
            this.select();         
        }
      },

      init: function(config){
        TmplNode.prototype.init.call(this, config);

        //DOM.insert(this.content, config.content || '');

        this.selectable = !!this.sorting;
        if (this.sorting)
        {
          this.sorting = Function.getter(this.sorting);
          this.defaultOrder = this.defaultOrder == 'desc';
          classList(this.element).add(HEADERCELL_CSS_SORTABLE);
        }
      },
      select: function(){
        if (!this.selected)
          this.order = this.defaultOrder;

        TmplNode.prototype.select.call(this);
      }
    });

   /**
    * @class
    */
    var Header = Class(TmplContainer, {
      className: namespace + '.Header',

      childClass: HeaderCell,

      localGroupingClass: HeaderGroupingNode,

      template: new Template(
        '<thead{element} class="Basis-Table-Header">' +
          '<tr{groupsElement} class="Basis-Table-Header-GroupContent" />' +
          '<tr{childNodesElement|content} />' +
        '</thead>'
      ),

      listen: {
        owner: {
          localSortingChanged: function(owner){
            var cell = this.childNodes.search(owner.localSorting, 'sorting');
            if (cell)
            {
              cell.select();
              cell.order = owner.localSortingDesc;
              classList(this.tmpl.content).bool(HEADERCELL_CSS_SORTDESC, cell.order);
            }
            else
              this.selection.clear();
          }
        }
      },

      init: function(config){
        this.selection = {
          owner: this,
          handlerContext: this,
          handler: {
            datasetChanged: function(dataset, delta){
              var cell = dataset.pick();
              if (cell && this.owner)
                this.owner.setLocalSorting(cell.sorting, cell.order);
            }
          }
        };

        TmplContainer.prototype.init.call(this, config);

        this.applyConfig_(this.structure)
      },
      applyConfig_: function(structure){
        if (structure)
        {
          this.setChildNodes(structure.map(function(colConfig){
            var headerConfig = colConfig.header;
            var config = Object.slice(colConfig, ['sorting', 'defaultOrder', 'groupId']);

            config.content = (headerConfig == null || typeof headerConfig != 'object'
              ? headerConfig 
              : headerConfig.content) || String.Entity.nbsp;

            if (typeof config.content == 'function')
              config.content = config.content.call(this);

            config.cssClassName = (headerConfig.cssClassName || '') + ' ' + (colConfig.cssClassName || '');

            return config;
          }, this));
        }
      }
    });

    //
    // Table Footer
    //

   /**
    * @class
    */
    var FooterCell = Class(TmplNode, {
      className: namespace + '.FooterCell',

      colSpan: 1,

      template: new Template(
        '<td{element} class="Basis-Table-Footer-Cell">' +
          '<div{content}>\xA0</div>' +
        '</td>'
      ),

      setColSpan: function(colSpan){
        this.element.colSpan = this.colSpan = colSpan || 1;
      }
    });

   /**
    * @class
    */
    var Footer = Class(TmplContainer, {
      className: namespace + '.Footer',

      childClass: FooterCell,
      childFactory: function(config){
        return new this.childClass(config);
      },

      template: new Template(
        '<tfoot{element} class="Basis-Table-Footer">' +
          '<tr{content|childNodesElement}></tr>' +
        '</tfoot>'
      ),

      init: function(config){
        TmplContainer.prototype.init.call(this, config);

        this.applyConfig_(this.structure);

        if (this.useFooter)
          DOM.insert(this.container || this.owner.element, this.element, 1);
      },

      applyConfig_: function(structure){
        //console.dir(this);
        if (structure)
        {
          var prevCell = null;

          this.clear();
          this.useFooter = false;

          for (var i = 0; i < structure.length; i++)
          {
            var colConfig = structure[i];
            var cell;

            if (colConfig.footer)
            {
              var content = colConfig.footer.content;

              if (typeof content == 'function')
                content = content.call(this);
                
              this.useFooter = true;
              
              cell = this.appendChild({
                cssClassName: (colConfig.cssClassName || '') + ' ' + (colConfig.footer.cssClassName || ''),
                content: content,
                template: colConfig.footer.template || FooterCell.prototype.template
              });
            }
            else
            {
              if (prevCell)
                prevCell.setColSpan(prevCell.colSpan + 1);
              else
                cell = this.appendChild({});
            }
  
            if (cell)
              prevCell = cell;
          }
        }
      }
    });

    //
    // Table
    //

   /**
    * Base row class
    * @class
    */
    var Row = Class(TmplNode, {
      className: namespace + '.Row',
      
      canHaveChildren: false,

      repaintCount: 0,
      getters: [],
      classNames: [],

      template:
        '<tr class="Basis-Table-Row" event-click="select">' +
          '<!--{cells}-->' +
        '</tr>',

      action: { 
        select: function(event){
          this.select(Event(event).ctrlKey);
        }
      },

      event_update: function(object, delta){
        TmplNode.prototype.event_update.call(this, object, delta);

        // update template
        this.repaintCount += 1;  // WARN: don't use this.repaintCount++
                                 // on first call repaintCount is prototype member

        for (var i = 0, updater; updater = this.updaters[i]; i++)
        {
          var cell = this.element.childNodes[updater.cellIndex];
          var content = updater.getter.call(this, this, cell);

          if (this.repaintCount > 1)
            cell.innerHTML = '';
         
          if (!content || !Array.isArray(content))
            content = [content];

          for (var j = 0; j < content.length; j++)
          {
            var ins = content[j];
            cell.appendChild(
              ins && ins.nodeType
                ? ins
                : DOM.createText(ins != null && (typeof ins != 'string' || ins != '') ? ins : ' ')
            );
          }
        }
      }
    });

   /**
    * @class
    */
    var Body = Class(TmplPartitionNode, {
      className: namespace + '.Body',

      template:
        '<tbody class="Basis-Table-Body" event-click="click">' +
          '<tr class="Basis-Table-GroupHeader">' +
            '<td{content} colspan="100"><span class="expander"/>{titleText}</td>'+ 
          '</tr>' +
          '<!-- {childNodesHere} -->' +
        '</tbody>',

      action: {
        click: function(){
          classList(this.element).toggle('collapsed');
        }
      }
    });
    
   /**
    * @class
    */
    var Table = Class(TmplControl, {
      className: namespace + '.Table',
      
      canHaveChildren: true,
      childClass: Row,

      localGroupingClass: Class(TmplGroupingNode, {
        className: namespace + '.TableGroupingNode',
        childClass: Body
      }),

      template: new Template(
        '<table{element|groupsElement} class="Basis-Table" cellspacing="0" event-click="click">' +
          '<!-- {headerElement} -->' +
          '<tbody{content|childNodesElement} class="Basis-Table-Body"></tbody>' +
          '<!-- {footerElement} -->' +
        '</table>'
      ),

      templateAction: function(actionName, event){
        TmplControl.prototype.templateAction.call(this, actionName, event);
      },

      //canHaveChildren: false,

      init: function(config){

        this.applyConfig_(this.structure);

        TmplControl.prototype.init.call(this, config);

        this.headerConfig = this.header;
        this.footerConfig = this.footer;

        this.header = new Header(Object.extend({ owner: this, structure: this.structure }, this.header));
        this.footer = new Footer(Object.extend({ owner: this, structure: this.structure }, this.footer));

        DOM.replace(this.tmpl.headerElement, this.header.element);
      
        if (!this.localSorting && this.structure && this.structure.search(true, function(item){ return item.sorting && ('autosorting' in item) }))
        {
          var col = this.structure[Array.lastSearchIndex];
          this.setLocalSorting(col.sorting, col.defaultOrder == 'desc');
        }

        // add event handlers
        /*this.addEventListener('click');
        this.addEventListener('contextmenu', 'contextmenu', true);*/
      },

      applyConfig_: function(structure){
        if (structure)
        {
          var updaters = new Array();
          var template = '';

          if (this.firstChild)
            this.clear();

          for (var i = 0; i < structure.length; i++)
          {
            var col = structure[i];
            var cell = col.body || {};

            if (typeof cell == 'function' || typeof cell == 'string')
              cell = {
                content: cell
              };

            var className = [col.cssClassName || '', cell.cssClassName || ''].join(' ').trim();
            var content = cell.content;
            template += 
              '<td' + (cell.templateRef ? cell.templateRef.quote('{') : '') + (className ? ' class="' + className + '"' : '') + '>' + 
                (typeof content == 'string' ? cell.content : '') +
              '</td>';

            if (typeof content == 'function')
            {
              updaters.push({
                cellIndex: i,
                getter: content
              });
            }
          }

          this.childClass = this.childClass.subclass({
            //behaviour: config.rowBehaviour,
            satelliteConfig: this.rowSatellite,
            template: new Template(this.childClass.prototype.template.source.replace('<!--{cells}-->', template)),
            updaters: updaters
          });

          if (this.rowBehaviour)
          {
            var rowBehaviour = this.rowBehaviour;
            for (var eventName in rowBehaviour){
              this.childClass.prototype[eventName] = function(){
                rowBehaviour[eventName].apply(this, arguments);
                Row.prototype[eventName].apply(this, arguments);
              }
            }
          }

        }
      },

      loadData: function(items){
        this.setChildNodes(items.map(Function.wrapper('data')))
      },

      destroy: function(){
        TmplControl.prototype.destroy.call(this);

        this.header.destroy();
        this.header = null;

        this.footer.destroy();
        this.footer = null;
      }
    });    

    //
    // export names
    //

    Basis.namespace(namespace).extend({
      Table: Table,
      Body: Body,
      Header: Header,
      HeaderCell: HeaderCell,
      Row: Row,
      Footer: Footer
    });

    // new naming

    Basis.namespace('basis.ui').extend({
      Table: Table
    });

    Basis.namespace('basis.ui.table').extend({
      Table: Table,
      Body: Body,
      Header: Header,
      HeaderCell: HeaderCell,
      Row: Row,
      Footer: Footer
    });

  })();
