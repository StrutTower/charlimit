(function ($) {
    var clCount = 0;
    $.fn.charLimit = function (options) {
        if (options === undefined || options.limit === undefined || typeof options.limit !== 'number') {
            $.error('Option limit must be defined and must be a number.');
        }
        if (options === undefined || options.regex === undefined || typeof options.regex !== 'string') {
            options.regex = "";
        }
        if (options === undefined || options.count === undefined || typeof options.count !== 'boolean') {
            options.count = false;
        }

        return this.each(function () {
            var self = $(this);
            var charLimit = options.limit;
            var regExpression = options.regex;
            var showCounter = options.count;

            function _truncate(e) {
                var caretPos;
                if (e.target.selectionStart !== undefined) {
                    caretPos = e.target.selectionEnd;
                } else if (document.selection) {
                    e.target.focus();
                    var range = document.selection.createRange();
                    range.moveStart('character', -e.target.value.length);
                    caretPos = range.text.length;
                }
                self.val(self.val().substring(0, charLimit));
                _setCaretPos(e, caretPos);
            }

            function _setCaretPos(e, pos) {
                if ($(e.target).get(0).setSelectionRange) {
                    $(e.target).get(0).setSelectionRange(pos, pos);
                } else if ($(e.target).get(0).createTextRange) {
                    var range = $(e.target).get(0).createTextRange();
                    range.collapse(true);
                    range.moveEnd('character', pos);
                    range.moveStart('character', pos);
                    range.select();
                }
            }

            self.keypress(function (e) {
                var charCount = self.val().length;
                var selected;
                if (e.target.selectionStart !== undefined) {
                    selected = !(e.target.selectionStart == e.target.selectionEnd);
                } else if (document.selection) {
                    e.target.focus();
                    var range = document.selection.createRange();
                    selected = (range.text.length > 0);
                }
                if (charCount > charLimit - 1 && !selected) {
                    return false;
                }

                if (regExpression != "") {
                    var regExp = new RegExp(regExpression);
                    var str = String.fromCharCode(!e.charCode ? e.which : e.charCode);
                    if (regExp != null && !regExp.test(str)) {
                        return false;
                    }
                }
                setTimeout(function () {
                    _truncate(e);
                }, 1);
            });

            self.bind('paste', function (e) {
                setTimeout(function () {
                    _truncate(e);
                }, 1);
            });

            if (showCounter) {
                var $elem = $(this),
                myId = $elem.attr('id') || ('autogen-cl' + clCount++),
                info = $('<span/>', {
                    id: myId + '-charsleft',
                    css: {
                        width: ($elem.width() - 10),
                        fontSize: '10px',
                        textAlign: 'right',
                        color: '#006600'
                    }
                }),
                chars = (typeof $elem.val === "function") ? $elem.val().length : 0,
                text = ' remaining',
                max = charLimit;

                self.blur(function () {
                    info.hide();
                });

                self.focus(function (e) {
                    info.css({
                        position: 'absolute',
                        top: $elem.position().top + self.height() - 10,
                        left: $elem.position().left - 5,
                        width: $elem.width() - 10
                    }).html((max - chars) + '/' + max + (chars == (max - 1) ? ' character' : ' characters') + text).show();
                });

                self.keyup(function (e) {
                    var content = self.val();
                    chars = content.length;
                    if (chars > max) {
                        chars = max;
                        self.val(content.substr(0, max));
                    }
                    if (max - chars < 10) {
                        info.css({ color: '#990000' });
                    } else {
                        info.css({ color: '#006600' });
                    }
                    info.html((max - chars) + '/' + max + (chars == (max - 1) ? ' character' : ' characters') + text);
                });
                $elem.after(info);
            }
        });
    };
})(jQuery);
