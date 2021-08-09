tinymce.PluginManager.add("A4PageRuler", function (editor) {

  var domHtml;
  var lastPageBreaks;
  var pagen = tinymce.util.I18n.translate("p.");

  function refreshRuler() {
    try {
      domHtml = $(editor.getDoc().getElementsByTagName('HTML')[0]);
    } catch (e) {
      return setTimeout(refreshRuler, 50);
    }

    var dpi = 96
    var cm = dpi / 2.54;
    var a4px = cm * (29.7); // A4 height in px, -5.5 are my additional margins in my PDF print

    // ruler begins (in px)
    var startMargin = 0;

    // max size (in px) = document size + extra to be sure, idk, the height is too small for some reason
    var imgH = domHtml.height() + a4px * 5;

    var pageBreakHeight = 4; // height of the pagebreak line in tinyMce

    var pageBreaks = [];  // I changed .mce-pagebreak with .page-break !!!
    domHtml.find('.page-break').each(function () {
      pageBreaks[pageBreaks.length] = $(this).offset().top;
    });

    pageBreaks.sort();

    // if pageBreak is too close next page, then ignore it
    if (lastPageBreaks == pageBreaks) {
      return; // no change
    }

    lastPageBreaks = pageBreaks;

    // console.log("Redraw ruler");

    var s = '';
    s += '<svg width="100%" height="' + imgH + '" xmlns="http://www.w3.org/2000/svg">';

    s += '<style>';
    s += '.pageNumber{font-weight:bold;font-size:20px;font-family:verdana;text-shadow:1px 1px 1px rgba(0,0,0,.6);}';
    s += '</style>';

    var pages = Math.ceil(imgH / a4px);

    var i, j, curY = startMargin;
    for (i = 0; i < pages; i++) {
      var blockH = a4px;

      var isPageBreak = 0;
      for (var j = 0; j < pageBreaks.length; j++) {
        if (pageBreaks[j] < curY + blockH) {

          // musime zmensit velikost stranky
          blockH = pageBreaks[j] - curY;

          // pagebreak prijde na konec stranky
          isPageBreak = 1;
          pageBreaks.splice(j, 1);
        }
      }

      curY2 = curY + 38;
      s += '<line x1="0" y1="' + curY2 + '" x2="100%" y2="' + curY2 + '" stroke-width="1" stroke="red"/>';

      // zacneme pravitko
      s += '<pattern id="ruler' + i + '" x="0" y="' + curY + '" width="37.79527559055118" height="37.79527559055118" patternUnits="userSpaceOnUse">';
      s += '<line x1="0" y1="0" x2="100%" y2="0" stroke-width="1" stroke="black"/>';
      s += '<line x1="24" y1="0" x2="0" y2="100%" stroke-width="1" stroke="black"/>';
      s += '</pattern>';
      s += '<rect x="0" y="' + curY + '" width="100%" height="' + blockH + '" fill="url(#ruler' + i + ')" />';

      // napiseme cislo strany
      s += '<text x="10" y="' + (curY2 + 19 + 5) + '" class="pageNumber" fill="#e03e2d">' + pagen + (i + 1) + '.</text>';

      curY += blockH;
      if (isPageBreak) {
        //s+= '<rect x="0" y="'+curY+'" width="100%" height="'+pageBreakHeight+'" fill="#ffffff" />';
        curY += pageBreakHeight;
      }
    }

    s += '</svg>';

    domHtml.css('background-image', 'url("data:image/svg+xml;utf8,' + encodeURIComponent(s) + '")');
  }

  function deleteRuler() {

    domHtml.css('background-image', '');
  }

  var toggleState = false;

  editor.on("NodeChange", function () {
    if (toggleState == true) {
      refreshRuler();
    }
  });


  editor.on("init", function () {
    if (toggleState == true) {
      refreshRuler();
    }
  });

  editor.ui.registry.addIcon("square_foot", '<svg xmlns="http://www.w3.org/2000/svg" enable-background="new 0 0 24 24" height="24" viewBox="0 0 24 24" width="24">' +
    '<g><rect fill="none" height="24" width="24"/></g><g><g><path d="M17.66,17.66l-1.06,1.06l-0.71-0.71l1.06-1.06l-1.94-1.94l-1.06,1.06l-0.71-0.71' +
    'l1.06-1.06l-1.94-1.94l-1.06,1.06 l-0.71-0.71l1.06-1.06L9.7,9.7l-1.06,1.06l-0.71-0.71l1.06-1.06L7.05,7.05L5.99,8.11L5.28,7.4l1.06-1.06L4,4' +
    'v14c0,1.1,0.9,2,2,2 h14L17.66,17.66z M7,17v-5.76L12.76,17H7z"/></g></g></svg>');

  editor.ui.registry.addToggleMenuItem("ruler", {
    text: "Show ruler",
    icon: "square_foot",
    onAction: function () {
      toggleState = !toggleState;
      if (toggleState == false) {
        deleteRuler();
      } else {
        refreshRuler();
      }
    },
    onSetup: function (api) {
      api.setActive(toggleState);
      return function () { };
    }
  });

});
