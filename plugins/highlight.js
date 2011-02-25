
  (function(){ 
    
    var namespace = 'Basis.Plugin.SyntaxHighlight';

    var DOM = Basis.DOM;
    var nsWrappers = Basis.DOM.Wrapper;
    var Template = Basis.Html.Template;

    //Function.getter = Basis.Data;

    var keywords = 
      'break case catch continue ' +
      'default delete do else false ' +
      'for function if in instanceof ' +
      'new null return super switch ' +
      'this throw true try typeof var while with';


    var regexps = [
      {
        kind: 'string',
        rx: /\'(?:\\[\'\n\r]|[^\'\n\r])*\'/g
      },
      {
        kind: 'string',
        rx: /\"(?:\\[\"\n\r]|[^\"\n\r])*\"/g
      },
      {
        kind: 'comment',
        rx: /\/\/.*/gm
      },
      {
        kind: 'comment',
        rx: /\/\*[\s\S]*?\*\//g
      },
      {
        kind: 'keyword',
        rx: new RegExp('\\b(?:' + keywords.qw().join('|') + ')\\b', 'g')
      }
    ];

    var keywordRegExp = new RegExp('\\b(' + keywords.qw().join('|') + ')\\b', 'g');

//        '<span class="lineNumber"><input value{numberText}="001"/></span>' +  // 
    var lineTemplate = new Template(
      '<div{element} class="line">' +
        '<span{content} class="lineContent">' +
          '<input class="lineNumber" value{numberText}="" type="none" unselectable="on" readonly tabindex="-1" /><span class="over"></span>' +
        '</span>' +
      '</div>'
    );

    var template = document.createElement('div');
    template.innerHTML = 
      '<div>' +
        '<span class="lineContent"></span>' +
      '</div>';
    template = template.firstChild;

    function highlight(code){

      function normalize(code){
        code = code
                 .trimRight()
                 .replace(/\r\n|\n\r|\r/g, '\n')
                 .replace(/^(?:\s*[\n]+)+?([ \t]*)/, '$1');

        // fix empty strings
        code = code.replace(/\n[ \t]+/g, function(m){ return m.replace(/\t/g, '  '); }).replace(/\n[ \t]+\n/g, '\n\n');

        // normalize code offset
        var minOffset = 1000;
        var lines = code.split(/\n+/);
        var startLine = Number(code.match(/^function/) != null); // hotfix for function.toString()
        for (var i = startLine; i < lines.length; i++)
        {
          var m = lines[i].match(/^\s*/);
          if (m[0].length < minOffset)
            minOffset = m[0].length;
          if (minOffset == 0)
            break;
        }

        if (minOffset > 0)
          code = code.replace(new RegExp('(^|\\n) {' + minOffset + '}', 'g'), '$1');

        code = code.replace(new RegExp('(^|\\n)( +)', 'g'), function(m, a, b){ return a + '\xA0'.repeat(b.length)});

        return code; 
      }

      function getMatches(code){
        function addMatch(kind, start, end){
          if (lastMatchPos != start)
            result.push(code.substring(lastMatchPos, start).replace(keywordRegExp, '<span class="token-keyword">$1</span>'));

          lastMatchPos = end + 1;

          result.push('<span class="token-' + kind + '">' + code.substring(start, end + 1) + '</span>');
        }

        var result = [];
        var sym = code.toArray();
        var start;
        var lastMatchPos = 0;

        for (var i = 0; i < sym.length; i++)
        {
          if (sym[i] == '\'')
          {
            start = i;
            while (++i < sym.length)
            {
              if (sym[i] == '\'')
              {
                addMatch('string', start, i);
                break;
              }

              if (sym[i] == '\n')
                break;

              if (sym[i] == '\\')
              {
                i++;
                if (sym[i] == '\n')
                {
                  addMatch('string', start, i - 1);
                  start = i + 1;
                }
              }
            }
          }
          else if (sym[i] == '\"')
          {
            start = i;
            while (++i < sym.length)
            {
              if (sym[i] == '\"')
              {
                addMatch('string', start, i);
                break;
              }

              if (sym[i] == '\n')
                break;

              if (sym[i] == '\\')
              {
                i++;
                if (sym[i] == '\n')
                {
                  addMatch('string', start, i - 1);
                  start = i;
                }
              }
            }
          }
          else if (sym[i] == '/')
          {
            start = i;
            i++;

            if (sym[i] == '/')
            {
              while (++i < sym.length)
              {
                if (sym[i] == '\n')
                  break;
              }

              addMatch('comment', start, i - 1);
            }

            if (sym[i] == '*')
            {
              while (++i < sym.length)
              {
                if (sym[i] == '*' && sym[i + 1] == '/')
                {
                  addMatch('comment', start, ++i);
                  break;
                }
                else if (sym[i] == '\n')
                {
                  addMatch('comment', start, i);
                  start = i;
                }
              }
            }
          }
        }

        result.push(code.substr(lastMatchPos, start).replace(keywordRegExp, '<span class="token-keyword">$1</span>'));
        //console.log(html.join(''));

        return result;
      }

      //  MAIN PART

      var html = getMatches(normalize(code)/*.replace(/\&/g, '&amp;')*/.replace(/</g, '&lt;'));

      //console.log('getmatches ' + (new Date - t));

      var lines = html.join('').split('\n');
      var numberWidth = String(lines.length >> 1).length;
      var res = [];
      for (var i = 0; i < lines.length; i++)
      {
        res.push(
          '<div class="line ' + (i % 2 ? 'odd' : 'even') + '">' +
            '<span class="lineContent">' + 
              '<input class="lineNumber" value="' + (i + 1).lead(numberWidth) + '" type="none" unselectable="on" readonly="readonly" tabindex="-1" />' +
              '<span class="over"></span>' +
              (lines[i] + '\r\n') + 
            '</span>' +
          '</div>'
        )
      }
      //console.log('build html ' + (new Date - t));
      return res.join('');
    }

   /**
    * @class
    */
    var SourceCodeNode = Basis.Class(nsWrappers.HtmlNode, {
      template: new Template(
        '<pre{element|codeElement} class="Basis-SyntaxHighlight"/>'
      ),
      behaviour: {
        update: function(object, delta){
          this.inherit(object, delta);

          var code = this.codeGetter(this);
          if (code != this.code_)
          {
            this.code_ = code;
            //DOM.insert(DOM.clear(this.codeElement), highlight(code));
            this.codeElement.innerHTML = highlight(code);
            //DOM.insert(this.codeElement, DOM.createElement('TEXTAREA', Basis.DOM.outerHTML(highlight(code))));
          }
        }
      },
      codeGetter: Function.getter('info.code')
    });

    Basis.namespace(namespace).extend({
      // functions
      highlight: highlight,

      // classes
      SourceCodeNode: SourceCodeNode
    });

  })();