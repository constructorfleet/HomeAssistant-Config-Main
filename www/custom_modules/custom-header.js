function _defineProperty(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }

  return obj;
}

function ownKeys(object, enumerableOnly) {
  var keys = Object.keys(object);

  if (Object.getOwnPropertySymbols) {
    var symbols = Object.getOwnPropertySymbols(object);
    if (enumerableOnly) symbols = symbols.filter(function (sym) {
      return Object.getOwnPropertyDescriptor(object, sym).enumerable;
    });
    keys.push.apply(keys, symbols);
  }

  return keys;
}

function _objectSpread2(target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i] != null ? arguments[i] : {};

    if (i % 2) {
      ownKeys(Object(source), true).forEach(function (key) {
        _defineProperty(target, key, source[key]);
      });
    } else if (Object.getOwnPropertyDescriptors) {
      Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));
    } else {
      ownKeys(Object(source)).forEach(function (key) {
        Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
      });
    }
  }

  return target;
}

function _taggedTemplateLiteral(strings, raw) {
  if (!raw) {
    raw = strings.slice(0);
  }

  return Object.freeze(Object.defineProperties(strings, {
    raw: {
      value: Object.freeze(raw)
    }
  }));
}

const defaultVariables = locale => {
  const d = new Date();
  return {
    time: d.toLocaleTimeString(locale, {
      hour: '2-digit',
      minute: '2-digit'
    }),
    date: d.toLocaleDateString(locale, {}),
    monthNum: d.getMonth() + 1,
    monthNumLZ: String(d.getMonth() + 1).padStart(2, 0),
    monthNameShort: d.toLocaleDateString(locale, {
      month: 'short'
    }),
    monthNameLong: d.toLocaleDateString(locale, {
      month: 'long'
    }),
    dayNum: d.getDate(),
    dayNumLZ: String(d.getDate()).padStart(2, 0),
    dayNameShort: d.toLocaleDateString(locale, {
      weekday: 'short'
    }),
    dayNameLong: d.toLocaleDateString(locale, {
      weekday: 'long'
    }),
    hours12: String((d.getHours() + 24) % 12 || 12),
    hours12LZ: String((d.getHours() + 24) % 12 || 12).padStart(2, 0),
    hours24: d.getHours(),
    hours24LZ: String(d.getHours()).padStart(2, 0),
    minutes: d.getMinutes(),
    minutesLZ: String(d.getMinutes()).padStart(2, 0),
    year2d: String(d.getFullYear()).substr(-2),
    year4d: d.getFullYear(),
    AMPM: d.getHours() >= 12 ? 'PM' : 'AM',
    ampm: d.getHours() >= 12 ? 'pm' : 'am'
  };
};

/**
 * Parse or format dates
 * @class fecha
 */
var fecha = {};
var token = /d{1,4}|M{1,4}|YY(?:YY)?|S{1,3}|Do|ZZ|([HhMsDm])\1?|[aA]|"[^"]*"|'[^']*'/g;
var twoDigits = '\\d\\d?';
var threeDigits = '\\d{3}';
var fourDigits = '\\d{4}';
var word = '[^\\s]+';
var literal = /\[([^]*?)\]/gm;

var noop = function () {};

function regexEscape(str) {
  return str.replace(/[|\\{()[^$+*?.-]/g, '\\$&');
}

function shorten(arr, sLen) {
  var newArr = [];

  for (var i = 0, len = arr.length; i < len; i++) {
    newArr.push(arr[i].substr(0, sLen));
  }

  return newArr;
}

function monthUpdate(arrName) {
  return function (d, v, i18n) {
    var index = i18n[arrName].indexOf(v.charAt(0).toUpperCase() + v.substr(1).toLowerCase());

    if (~index) {
      d.month = index;
    }
  };
}

function pad(val, len) {
  val = String(val);
  len = len || 2;

  while (val.length < len) {
    val = '0' + val;
  }

  return val;
}

var dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
var monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
var monthNamesShort = shorten(monthNames, 3);
var dayNamesShort = shorten(dayNames, 3);
fecha.i18n = {
  dayNamesShort: dayNamesShort,
  dayNames: dayNames,
  monthNamesShort: monthNamesShort,
  monthNames: monthNames,
  amPm: ['am', 'pm'],
  DoFn: function DoFn(D) {
    return D + ['th', 'st', 'nd', 'rd'][D % 10 > 3 ? 0 : (D - D % 10 !== 10) * D % 10];
  }
};
var formatFlags = {
  D: function (dateObj) {
    return dateObj.getDate();
  },
  DD: function (dateObj) {
    return pad(dateObj.getDate());
  },
  Do: function (dateObj, i18n) {
    return i18n.DoFn(dateObj.getDate());
  },
  d: function (dateObj) {
    return dateObj.getDay();
  },
  dd: function (dateObj) {
    return pad(dateObj.getDay());
  },
  ddd: function (dateObj, i18n) {
    return i18n.dayNamesShort[dateObj.getDay()];
  },
  dddd: function (dateObj, i18n) {
    return i18n.dayNames[dateObj.getDay()];
  },
  M: function (dateObj) {
    return dateObj.getMonth() + 1;
  },
  MM: function (dateObj) {
    return pad(dateObj.getMonth() + 1);
  },
  MMM: function (dateObj, i18n) {
    return i18n.monthNamesShort[dateObj.getMonth()];
  },
  MMMM: function (dateObj, i18n) {
    return i18n.monthNames[dateObj.getMonth()];
  },
  YY: function (dateObj) {
    return pad(String(dateObj.getFullYear()), 4).substr(2);
  },
  YYYY: function (dateObj) {
    return pad(dateObj.getFullYear(), 4);
  },
  h: function (dateObj) {
    return dateObj.getHours() % 12 || 12;
  },
  hh: function (dateObj) {
    return pad(dateObj.getHours() % 12 || 12);
  },
  H: function (dateObj) {
    return dateObj.getHours();
  },
  HH: function (dateObj) {
    return pad(dateObj.getHours());
  },
  m: function (dateObj) {
    return dateObj.getMinutes();
  },
  mm: function (dateObj) {
    return pad(dateObj.getMinutes());
  },
  s: function (dateObj) {
    return dateObj.getSeconds();
  },
  ss: function (dateObj) {
    return pad(dateObj.getSeconds());
  },
  S: function (dateObj) {
    return Math.round(dateObj.getMilliseconds() / 100);
  },
  SS: function (dateObj) {
    return pad(Math.round(dateObj.getMilliseconds() / 10), 2);
  },
  SSS: function (dateObj) {
    return pad(dateObj.getMilliseconds(), 3);
  },
  a: function (dateObj, i18n) {
    return dateObj.getHours() < 12 ? i18n.amPm[0] : i18n.amPm[1];
  },
  A: function (dateObj, i18n) {
    return dateObj.getHours() < 12 ? i18n.amPm[0].toUpperCase() : i18n.amPm[1].toUpperCase();
  },
  ZZ: function (dateObj) {
    var o = dateObj.getTimezoneOffset();
    return (o > 0 ? '-' : '+') + pad(Math.floor(Math.abs(o) / 60) * 100 + Math.abs(o) % 60, 4);
  }
};
var parseFlags = {
  D: [twoDigits, function (d, v) {
    d.day = v;
  }],
  Do: [twoDigits + word, function (d, v) {
    d.day = parseInt(v, 10);
  }],
  M: [twoDigits, function (d, v) {
    d.month = v - 1;
  }],
  YY: [twoDigits, function (d, v) {
    var da = new Date(),
        cent = +('' + da.getFullYear()).substr(0, 2);
    d.year = '' + (v > 68 ? cent - 1 : cent) + v;
  }],
  h: [twoDigits, function (d, v) {
    d.hour = v;
  }],
  m: [twoDigits, function (d, v) {
    d.minute = v;
  }],
  s: [twoDigits, function (d, v) {
    d.second = v;
  }],
  YYYY: [fourDigits, function (d, v) {
    d.year = v;
  }],
  S: ['\\d', function (d, v) {
    d.millisecond = v * 100;
  }],
  SS: ['\\d{2}', function (d, v) {
    d.millisecond = v * 10;
  }],
  SSS: [threeDigits, function (d, v) {
    d.millisecond = v;
  }],
  d: [twoDigits, noop],
  ddd: [word, noop],
  MMM: [word, monthUpdate('monthNamesShort')],
  MMMM: [word, monthUpdate('monthNames')],
  a: [word, function (d, v, i18n) {
    var val = v.toLowerCase();

    if (val === i18n.amPm[0]) {
      d.isPm = false;
    } else if (val === i18n.amPm[1]) {
      d.isPm = true;
    }
  }],
  ZZ: ['[^\\s]*?[\\+\\-]\\d\\d:?\\d\\d|[^\\s]*?Z', function (d, v) {
    var parts = (v + '').match(/([+-]|\d\d)/gi),
        minutes;

    if (parts) {
      minutes = +(parts[1] * 60) + parseInt(parts[2], 10);
      d.timezoneOffset = parts[0] === '+' ? minutes : -minutes;
    }
  }]
};
parseFlags.dd = parseFlags.d;
parseFlags.dddd = parseFlags.ddd;
parseFlags.DD = parseFlags.D;
parseFlags.mm = parseFlags.m;
parseFlags.hh = parseFlags.H = parseFlags.HH = parseFlags.h;
parseFlags.MM = parseFlags.M;
parseFlags.ss = parseFlags.s;
parseFlags.A = parseFlags.a; // Some common format strings

fecha.masks = {
  default: 'ddd MMM DD YYYY HH:mm:ss',
  shortDate: 'M/D/YY',
  mediumDate: 'MMM D, YYYY',
  longDate: 'MMMM D, YYYY',
  fullDate: 'dddd, MMMM D, YYYY',
  shortTime: 'HH:mm',
  mediumTime: 'HH:mm:ss',
  longTime: 'HH:mm:ss.SSS'
};
/***
 * Format a date
 * @method format
 * @param {Date|number} dateObj
 * @param {string} mask Format of the date, i.e. 'mm-dd-yy' or 'shortDate'
 */

fecha.format = function (dateObj, mask, i18nSettings) {
  var i18n = i18nSettings || fecha.i18n;

  if (typeof dateObj === 'number') {
    dateObj = new Date(dateObj);
  }

  if (Object.prototype.toString.call(dateObj) !== '[object Date]' || isNaN(dateObj.getTime())) {
    throw new Error('Invalid Date in fecha.format');
  }

  mask = fecha.masks[mask] || mask || fecha.masks['default'];
  var literals = []; // Make literals inactive by replacing them with ??

  mask = mask.replace(literal, function ($0, $1) {
    literals.push($1);
    return '@@@';
  }); // Apply formatting rules

  mask = mask.replace(token, function ($0) {
    return $0 in formatFlags ? formatFlags[$0](dateObj, i18n) : $0.slice(1, $0.length - 1);
  }); // Inline literal values back into the formatted value

  return mask.replace(/@@@/g, function () {
    return literals.shift();
  });
};
/**
 * Parse a date string into an object, changes - into /
 * @method parse
 * @param {string} dateStr Date string
 * @param {string} format Date parse format
 * @returns {Date|boolean}
 */


fecha.parse = function (dateStr, format, i18nSettings) {
  var i18n = i18nSettings || fecha.i18n;

  if (typeof format !== 'string') {
    throw new Error('Invalid format in fecha.parse');
  }

  format = fecha.masks[format] || format; // Avoid regular expression denial of service, fail early for really long strings
  // https://www.owasp.org/index.php/Regular_expression_Denial_of_Service_-_ReDoS

  if (dateStr.length > 1000) {
    return null;
  }

  var dateInfo = {};
  var parseInfo = [];
  var literals = [];
  format = format.replace(literal, function ($0, $1) {
    literals.push($1);
    return '@@@';
  });
  var newFormat = regexEscape(format).replace(token, function ($0) {
    if (parseFlags[$0]) {
      var info = parseFlags[$0];
      parseInfo.push(info[1]);
      return '(' + info[0] + ')';
    }

    return $0;
  });
  newFormat = newFormat.replace(/@@@/g, function () {
    return literals.shift();
  });
  var matches = dateStr.match(new RegExp(newFormat, 'i'));

  if (!matches) {
    return null;
  }

  for (var i = 1; i < matches.length; i++) {
    parseInfo[i - 1](dateInfo, matches[i], i18n);
  }

  var today = new Date();

  if (dateInfo.isPm === true && dateInfo.hour != null && +dateInfo.hour !== 12) {
    dateInfo.hour = +dateInfo.hour + 12;
  } else if (dateInfo.isPm === false && +dateInfo.hour === 12) {
    dateInfo.hour = 0;
  }

  var date;

  if (dateInfo.timezoneOffset != null) {
    dateInfo.minute = +(dateInfo.minute || 0) - +dateInfo.timezoneOffset;
    date = new Date(Date.UTC(dateInfo.year || today.getFullYear(), dateInfo.month || 0, dateInfo.day || 1, dateInfo.hour || 0, dateInfo.minute || 0, dateInfo.second || 0, dateInfo.millisecond || 0));
  } else {
    date = new Date(dateInfo.year || today.getFullYear(), dateInfo.month || 0, dateInfo.day || 1, dateInfo.hour || 0, dateInfo.minute || 0, dateInfo.second || 0, dateInfo.millisecond || 0);
  }

  return date;
};

var a = function () {
  try {
    new Date().toLocaleDateString("i");
  } catch (e) {
    return "RangeError" === e.name;
  }

  return !1;
}() ? function (e, t) {
  return e.toLocaleDateString(t, {
    year: "numeric",
    month: "long",
    day: "numeric"
  });
} : function (t) {
  return fecha.format(t, "mediumDate");
},
    n = function () {
  try {
    new Date().toLocaleString("i");
  } catch (e) {
    return "RangeError" === e.name;
  }

  return !1;
}() ? function (e, t) {
  return e.toLocaleString(t, {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit"
  });
} : function (t) {
  return fecha.format(t, "haDateTime");
},
    r = function () {
  try {
    new Date().toLocaleTimeString("i");
  } catch (e) {
    return "RangeError" === e.name;
  }

  return !1;
}() ? function (e, t) {
  return e.toLocaleTimeString(t, {
    hour: "numeric",
    minute: "2-digit"
  });
} : function (t) {
  return fecha.format(t, "shortTime");
};

var A = function (e, t, a, n) {
  n = n || {}, a = null == a ? {} : a;
  var r = new Event(t, {
    bubbles: void 0 === n.bubbles || n.bubbles,
    cancelable: Boolean(n.cancelable),
    composed: void 0 === n.composed || n.composed
  });
  return r.detail = a, e.dispatchEvent(r), r;
};

var F = function () {
  var e = document.querySelector("home-assistant");

  if (e = (e = (e = (e = (e = (e = (e = (e = e && e.shadowRoot) && e.querySelector("home-assistant-main")) && e.shadowRoot) && e.querySelector("app-drawer-layout partial-panel-resolver")) && e.shadowRoot || e) && e.querySelector("ha-panel-lovelace")) && e.shadowRoot) && e.querySelector("hui-root")) {
    var t = e.lovelace;
    return t.current_view = e.___curView, t;
  }

  return null;
},
    B = function () {
  var e = document.querySelector("home-assistant");
  if (e = (e = (e = (e = (e = (e = (e = (e = e && e.shadowRoot) && e.querySelector("home-assistant-main")) && e.shadowRoot) && e.querySelector("app-drawer-layout partial-panel-resolver")) && e.shadowRoot || e) && e.querySelector("ha-panel-lovelace")) && e.shadowRoot) && e.querySelector("hui-root")) return e.shadowRoot;
};

const homeAssistant = document.querySelector('home-assistant');
const hass = homeAssistant.hass;
const lovelace = F();
const root = B();
const haElem = {};
haElem.main = homeAssistant.shadowRoot.querySelector('home-assistant-main');
haElem.tabs = Array.from((root.querySelector('paper-tabs') || root).querySelectorAll('paper-tab'));
haElem.tabContainer = root.querySelector('paper-tabs');
haElem.menu = root.querySelector('ha-menu-button');
haElem.options = root.querySelector('paper-menu-button');
haElem.voice = root.querySelector('ha-start-voice-button') || root.querySelector('paper-icon-button[icon="hass:microphone"]');
haElem.drawer = haElem.main.shadowRoot.querySelector('#drawer');
haElem.sidebar = {};
haElem.sidebar.main = haElem.main.shadowRoot.querySelector('ha-sidebar');
haElem.sidebar.menu = haElem.sidebar.main.shadowRoot.querySelector('.menu');
haElem.sidebar.listbox = haElem.sidebar.main.shadowRoot.querySelector('paper-listbox');
haElem.sidebar.divider = haElem.sidebar.main.shadowRoot.querySelector('div.divider');
haElem.appHeader = root.querySelector('app-header');
haElem.appLayout = root.querySelector('ha-app-layout');
haElem.partialPanelResolver = haElem.main.shadowRoot.querySelector('partial-panel-resolver');
const missing = [];

for (const item in haElem) {
  if (item == 'voice') {
    continue;
  } else if (!haElem[item]) {
    missing.push(item);
  } else if (typeof haElem[item] === 'object' && !haElem[item].nodeName) {
    for (const nested in haElem[item]) {
      if (!haElem[item][nested]) missing.push("".concat(item, "[").concat(nested, "]"));
    }
  }
}

if (missing.length) {
  console.log("[CUSTOM HEADER] The following HA element".concat(missing.length > 1 ? 's' : '', " could not be found: ").concat(missing.join(', ')));
}

Object.defineProperty(Array.prototype, 'flat', {
  value: function value() {
    let depth = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 1;
    return this.reduce(function (flat, toFlatten) {
      return flat.concat(Array.isArray(toFlatten) && depth - 1 ? toFlatten.flat(depth - 1) : toFlatten);
    }, []);
  }
}); // Get tab index number from view's title or path

const tabIndexByName = tab => {
  let index;
  const {
    views
  } = lovelace.config;

  if (isNaN(tab)) {
    views.forEach(view => {
      if (view.title === tab || view.path === tab) index = views.indexOf(view);
    });
  } else {
    index = parseInt(tab, 10);
  }

  return index;
}; // Invert show_tabs to hide_tabs

const invertNumArray = show_tabs => {
  if (show_tabs && show_tabs.length) {
    const total_tabs = [];

    for (let i = 0; i < haElem.tabs.length; i += 1) total_tabs.push(i);

    return total_tabs.filter(el => !show_tabs.includes(el));
  }
}; // Subscribe and render Jinja templates.

const subscribeRenderTemplate = (onChange, params, locale) => {
  const conn = hass.connection;

  const variables = _objectSpread2({
    user: hass.user.name,
    browser: navigator.userAgent
  }, params.variables, {}, defaultVariables(locale));

  const template = params.template;
  const entity_ids = params.entity_ids;
  return conn.subscribeMessage(msg => onChange(msg.result), {
    type: 'render_template',
    template,
    variables,
    entity_ids
  });
}; // Builds range from single range string "5 to 9" and returns array [5,6,7,8,9].

const buildRange = string => {
  const ranges = [];

  const range = (start, end) => new Array(end - start + 1).fill(undefined).map((_, i) => i + start);

  if (string.includes('to')) {
    const split = string.split('to');
    if (parseInt(split[1]) > parseInt(split[0])) ranges.push(range(parseInt(split[0]), parseInt(split[1])));else ranges.push(range(parseInt(split[1]), parseInt(split[0])));
  }

  return ranges.flat();
}; // Takes in array of tab names/paths, numbers, and ranges.
// Builds array of tab indexes with the results.

const processTabArray = array => {
  let ranges = [];

  const sortNumber = (a, b) => a - b;

  array = typeof array === 'string' ? array.replace(/\s+/g, '').split(',') : array;

  for (const i in array) {
    if (typeof array[i] == 'string' && array[i].includes('to')) {
      const rangeTest = array[i].replace(/ /g, '').split('to');
      if (!(rangeTest[0].match(/[a-z]/g) || rangeTest[1].match(/[a-z]/g))) ranges.push(buildRange(array[i]));else ranges.push(array[i]);
    } else {
      ranges.push(array[i]);
    }
  }

  ranges = ranges.flat();

  for (const i in ranges) {
    if (isNaN(ranges[i])) ranges[i] = tabIndexByName(ranges[i]);else ranges[i] = parseInt(ranges[i]);
  }

  return ranges.sort(sortNumber);
};

const conditionalConfig = config => {
  const countMatches = conditions => {
    const userVars = {
      user: hass.user.name,
      user_agent: navigator.userAgent
    };
    let count = 0;

    for (const cond in conditions) {
      if (cond == 'user' && conditions[cond].includes(',')) {
        conditions[cond].split(/,+/).forEach(user => {
          if (userVars[cond] == user.trim()) count++;
        });
      } else {
        if (userVars[cond] == conditions[cond] || cond == 'query_string' && window.location.search.includes(conditions[cond]) || cond == 'user_agent' && userVars[cond].includes(conditions[cond]) || cond == 'media_query' && window.matchMedia(conditions[cond]).matches) {
          count++;
        } else {
          return 0;
        }
      }
    }

    return count;
  };

  let exceptionConfig = {};
  let highestMatch = 0; // Count number of matching conditions and choose config with most matches.

  if (config.exceptions) {
    config.exceptions.forEach(exception => {
      const matches = countMatches(exception.conditions);

      if (matches > highestMatch) {
        highestMatch = matches;
        exceptionConfig = exception.config;
      }
    });
  } // If exception config uses hide_tabs and main config uses show_tabs,
  // delete show_tabs and vice versa.


  if (exceptionConfig.hide_tabs && config.show_tabs && exceptionConfig.hide_tabs.length && config.show_tabs.length) {
    delete config.show_tabs;
  } else if (exceptionConfig.show_tabs && config.hide_tabs && exceptionConfig.show_tabs.length && config.hide_tabs.length) {
    delete config.hide_tabs;
  }

  return _objectSpread2({}, config, {}, exceptionConfig);
};

const buildHeader = () => {
  if (root.querySelector('ch-header')) return;
  const header = {};
  header.bottom = document.createElement('ch-header-bottom');
  header.tabContainer = document.createElement('paper-tabs');
  header.tabContainer.setAttribute('scrollable', '');
  header.tabContainer.setAttribute('dir', 'ltr');
  header.tabContainer.style.width = '100%';
  header.tabContainer.style.marginLeft = '0';
  haElem.tabs.forEach(tab => {
    const index = haElem.tabs.indexOf(tab);
    const tabClone = tab.cloneNode(true);
    const haIcon = tabClone.querySelector('ha-icon');

    if (haIcon) {
      haIcon.setAttribute('icon', lovelace.config.views[index].icon);
    }

    tabClone.addEventListener('click', () => {
      haElem.tabs[index].dispatchEvent(new MouseEvent('click', {
        bubbles: false,
        cancelable: false
      }));
    });
    header.tabContainer.appendChild(tabClone);
  });
  header.tabs = header.tabContainer.querySelectorAll('paper-tab');

  const buildButton = (button, icon) => {
    if (button === 'options') {
      header[button] = haElem[button].cloneNode(true);
      header[button].removeAttribute('horizontal-offset');
      header[button].querySelector('paper-icon-button').style.height = '48px';
      const items = Array.from(header[button].querySelectorAll('paper-item'));
      items.forEach(item => {
        const index = items.indexOf(item);
        item.addEventListener('click', () => {
          haElem[button].querySelectorAll('paper-item')[index].dispatchEvent(new MouseEvent('click', {
            bubbles: false,
            cancelable: false
          }));
        });
      });
    } else {
      if (!haElem[button]) return;
      header[button] = document.createElement('paper-icon-button');
      header[button].addEventListener('click', () => {
        (haElem[button].shadowRoot.querySelector('paper-icon-button') || haElem[button]).dispatchEvent(new MouseEvent('click', {
          bubbles: false,
          cancelable: false
        }));
      });
    }

    header[button].setAttribute('icon', icon);
    header[button].setAttribute('buttonElem', button);
    header[button].style.flexShrink = '0';
    header[button].style.height = '48px';
  };

  buildButton('menu', 'mdi:menu');
  buildButton('voice', 'mdi:microphone');
  buildButton('options', 'mdi:dots-vertical');
  const stack = document.createElement('ch-stack');
  const contentContainer = document.createElement('div');
  contentContainer.setAttribute('id', 'contentContainer');
  header.container = document.createElement('ch-header');
  if (header.menu) header.container.appendChild(header.menu);
  header.container.appendChild(stack);
  header.stack = header.container.querySelector('ch-stack');
  header.stack.appendChild(contentContainer);
  header.stack.appendChild(header.tabContainer);
  if (header.voice && header.voice.style.visibility != 'hidden') header.container.appendChild(header.voice);
  if (header.options) header.container.appendChild(header.options);
  haElem.appLayout.appendChild(header.container);
  haElem.appLayout.appendChild(header.bottom);
  return header;
};
const header = buildHeader();

/**
 * @license
 * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at
 * http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at
 * http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */
const directives = new WeakMap();
const isDirective = o => {
  return typeof o === 'function' && directives.has(o);
};

/**
 * @license
 * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at
 * http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at
 * http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */

/**
 * True if the custom elements polyfill is in use.
 */
const isCEPolyfill = window.customElements !== undefined && window.customElements.polyfillWrapFlushCallback !== undefined;
/**
 * Removes nodes, starting from `start` (inclusive) to `end` (exclusive), from
 * `container`.
 */

const removeNodes = (container, start, end = null) => {
  while (start !== end) {
    const n = start.nextSibling;
    container.removeChild(start);
    start = n;
  }
};

/**
 * @license
 * Copyright (c) 2018 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at
 * http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at
 * http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */

/**
 * A sentinel value that signals that a value was handled by a directive and
 * should not be written to the DOM.
 */
const noChange = {};
/**
 * A sentinel value that signals a NodePart to fully clear its content.
 */

const nothing = {};

/**
 * @license
 * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at
 * http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at
 * http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */

/**
 * An expression marker with embedded unique key to avoid collision with
 * possible text in templates.
 */
const marker = `{{lit-${String(Math.random()).slice(2)}}}`;
/**
 * An expression marker used text-positions, multi-binding attributes, and
 * attributes with markup-like text values.
 */

const nodeMarker = `<!--${marker}-->`;
const markerRegex = new RegExp(`${marker}|${nodeMarker}`);
/**
 * Suffix appended to all bound attribute names.
 */

const boundAttributeSuffix = '$lit$';
/**
 * An updateable Template that tracks the location of dynamic parts.
 */

class Template {
  constructor(result, element) {
    this.parts = [];
    this.element = element;
    const nodesToRemove = [];
    const stack = []; // Edge needs all 4 parameters present; IE11 needs 3rd parameter to be null

    const walker = document.createTreeWalker(element.content, 133
    /* NodeFilter.SHOW_{ELEMENT|COMMENT|TEXT} */
    , null, false); // Keeps track of the last index associated with a part. We try to delete
    // unnecessary nodes, but we never want to associate two different parts
    // to the same index. They must have a constant node between.

    let lastPartIndex = 0;
    let index = -1;
    let partIndex = 0;
    const {
      strings,
      values: {
        length
      }
    } = result;

    while (partIndex < length) {
      const node = walker.nextNode();

      if (node === null) {
        // We've exhausted the content inside a nested template element.
        // Because we still have parts (the outer for-loop), we know:
        // - There is a template in the stack
        // - The walker will find a nextNode outside the template
        walker.currentNode = stack.pop();
        continue;
      }

      index++;

      if (node.nodeType === 1
      /* Node.ELEMENT_NODE */
      ) {
          if (node.hasAttributes()) {
            const attributes = node.attributes;
            const {
              length
            } = attributes; // Per
            // https://developer.mozilla.org/en-US/docs/Web/API/NamedNodeMap,
            // attributes are not guaranteed to be returned in document order.
            // In particular, Edge/IE can return them out of order, so we cannot
            // assume a correspondence between part index and attribute index.

            let count = 0;

            for (let i = 0; i < length; i++) {
              if (endsWith(attributes[i].name, boundAttributeSuffix)) {
                count++;
              }
            }

            while (count-- > 0) {
              // Get the template literal section leading up to the first
              // expression in this attribute
              const stringForPart = strings[partIndex]; // Find the attribute name

              const name = lastAttributeNameRegex.exec(stringForPart)[2]; // Find the corresponding attribute
              // All bound attributes have had a suffix added in
              // TemplateResult#getHTML to opt out of special attribute
              // handling. To look up the attribute value we also need to add
              // the suffix.

              const attributeLookupName = name.toLowerCase() + boundAttributeSuffix;
              const attributeValue = node.getAttribute(attributeLookupName);
              node.removeAttribute(attributeLookupName);
              const statics = attributeValue.split(markerRegex);
              this.parts.push({
                type: 'attribute',
                index,
                name,
                strings: statics
              });
              partIndex += statics.length - 1;
            }
          }

          if (node.tagName === 'TEMPLATE') {
            stack.push(node);
            walker.currentNode = node.content;
          }
        } else if (node.nodeType === 3
      /* Node.TEXT_NODE */
      ) {
          const data = node.data;

          if (data.indexOf(marker) >= 0) {
            const parent = node.parentNode;
            const strings = data.split(markerRegex);
            const lastIndex = strings.length - 1; // Generate a new text node for each literal section
            // These nodes are also used as the markers for node parts

            for (let i = 0; i < lastIndex; i++) {
              let insert;
              let s = strings[i];

              if (s === '') {
                insert = createMarker();
              } else {
                const match = lastAttributeNameRegex.exec(s);

                if (match !== null && endsWith(match[2], boundAttributeSuffix)) {
                  s = s.slice(0, match.index) + match[1] + match[2].slice(0, -boundAttributeSuffix.length) + match[3];
                }

                insert = document.createTextNode(s);
              }

              parent.insertBefore(insert, node);
              this.parts.push({
                type: 'node',
                index: ++index
              });
            } // If there's no text, we must insert a comment to mark our place.
            // Else, we can trust it will stick around after cloning.


            if (strings[lastIndex] === '') {
              parent.insertBefore(createMarker(), node);
              nodesToRemove.push(node);
            } else {
              node.data = strings[lastIndex];
            } // We have a part for each match found


            partIndex += lastIndex;
          }
        } else if (node.nodeType === 8
      /* Node.COMMENT_NODE */
      ) {
          if (node.data === marker) {
            const parent = node.parentNode; // Add a new marker node to be the startNode of the Part if any of
            // the following are true:
            //  * We don't have a previousSibling
            //  * The previousSibling is already the start of a previous part

            if (node.previousSibling === null || index === lastPartIndex) {
              index++;
              parent.insertBefore(createMarker(), node);
            }

            lastPartIndex = index;
            this.parts.push({
              type: 'node',
              index
            }); // If we don't have a nextSibling, keep this node so we have an end.
            // Else, we can remove it to save future costs.

            if (node.nextSibling === null) {
              node.data = '';
            } else {
              nodesToRemove.push(node);
              index--;
            }

            partIndex++;
          } else {
            let i = -1;

            while ((i = node.data.indexOf(marker, i + 1)) !== -1) {
              // Comment node has a binding marker inside, make an inactive part
              // The binding won't work, but subsequent bindings will
              // TODO (justinfagnani): consider whether it's even worth it to
              // make bindings in comments work
              this.parts.push({
                type: 'node',
                index: -1
              });
              partIndex++;
            }
          }
        }
    } // Remove text binding nodes after the walk to not disturb the TreeWalker


    for (const n of nodesToRemove) {
      n.parentNode.removeChild(n);
    }
  }

}

const endsWith = (str, suffix) => {
  const index = str.length - suffix.length;
  return index >= 0 && str.slice(index) === suffix;
};

const isTemplatePartActive = part => part.index !== -1; // Allows `document.createComment('')` to be renamed for a
// small manual size-savings.

const createMarker = () => document.createComment('');
/**
 * This regex extracts the attribute name preceding an attribute-position
 * expression. It does this by matching the syntax allowed for attributes
 * against the string literal directly preceding the expression, assuming that
 * the expression is in an attribute-value position.
 *
 * See attributes in the HTML spec:
 * https://www.w3.org/TR/html5/syntax.html#elements-attributes
 *
 * " \x09\x0a\x0c\x0d" are HTML space characters:
 * https://www.w3.org/TR/html5/infrastructure.html#space-characters
 *
 * "\0-\x1F\x7F-\x9F" are Unicode control characters, which includes every
 * space character except " ".
 *
 * So an attribute is:
 *  * The name: any character except a control character, space character, ('),
 *    ("), ">", "=", or "/"
 *  * Followed by zero or more space characters
 *  * Followed by "="
 *  * Followed by zero or more space characters
 *  * Followed by:
 *    * Any character except space, ('), ("), "<", ">", "=", (`), or
 *    * (") then any non-("), or
 *    * (') then any non-(')
 */

const lastAttributeNameRegex = /([ \x09\x0a\x0c\x0d])([^\0-\x1F\x7F-\x9F "'>=/]+)([ \x09\x0a\x0c\x0d]*=[ \x09\x0a\x0c\x0d]*(?:[^ \x09\x0a\x0c\x0d"'`<>=]*|"[^"]*|'[^']*))$/;

/**
 * @license
 * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at
 * http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at
 * http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */
/**
 * An instance of a `Template` that can be attached to the DOM and updated
 * with new values.
 */

class TemplateInstance {
  constructor(template, processor, options) {
    this.__parts = [];
    this.template = template;
    this.processor = processor;
    this.options = options;
  }

  update(values) {
    let i = 0;

    for (const part of this.__parts) {
      if (part !== undefined) {
        part.setValue(values[i]);
      }

      i++;
    }

    for (const part of this.__parts) {
      if (part !== undefined) {
        part.commit();
      }
    }
  }

  _clone() {
    // There are a number of steps in the lifecycle of a template instance's
    // DOM fragment:
    //  1. Clone - create the instance fragment
    //  2. Adopt - adopt into the main document
    //  3. Process - find part markers and create parts
    //  4. Upgrade - upgrade custom elements
    //  5. Update - set node, attribute, property, etc., values
    //  6. Connect - connect to the document. Optional and outside of this
    //     method.
    //
    // We have a few constraints on the ordering of these steps:
    //  * We need to upgrade before updating, so that property values will pass
    //    through any property setters.
    //  * We would like to process before upgrading so that we're sure that the
    //    cloned fragment is inert and not disturbed by self-modifying DOM.
    //  * We want custom elements to upgrade even in disconnected fragments.
    //
    // Given these constraints, with full custom elements support we would
    // prefer the order: Clone, Process, Adopt, Upgrade, Update, Connect
    //
    // But Safari dooes not implement CustomElementRegistry#upgrade, so we
    // can not implement that order and still have upgrade-before-update and
    // upgrade disconnected fragments. So we instead sacrifice the
    // process-before-upgrade constraint, since in Custom Elements v1 elements
    // must not modify their light DOM in the constructor. We still have issues
    // when co-existing with CEv0 elements like Polymer 1, and with polyfills
    // that don't strictly adhere to the no-modification rule because shadow
    // DOM, which may be created in the constructor, is emulated by being placed
    // in the light DOM.
    //
    // The resulting order is on native is: Clone, Adopt, Upgrade, Process,
    // Update, Connect. document.importNode() performs Clone, Adopt, and Upgrade
    // in one step.
    //
    // The Custom Elements v1 polyfill supports upgrade(), so the order when
    // polyfilled is the more ideal: Clone, Process, Adopt, Upgrade, Update,
    // Connect.
    const fragment = isCEPolyfill ? this.template.element.content.cloneNode(true) : document.importNode(this.template.element.content, true);
    const stack = [];
    const parts = this.template.parts; // Edge needs all 4 parameters present; IE11 needs 3rd parameter to be null

    const walker = document.createTreeWalker(fragment, 133
    /* NodeFilter.SHOW_{ELEMENT|COMMENT|TEXT} */
    , null, false);
    let partIndex = 0;
    let nodeIndex = 0;
    let part;
    let node = walker.nextNode(); // Loop through all the nodes and parts of a template

    while (partIndex < parts.length) {
      part = parts[partIndex];

      if (!isTemplatePartActive(part)) {
        this.__parts.push(undefined);

        partIndex++;
        continue;
      } // Progress the tree walker until we find our next part's node.
      // Note that multiple parts may share the same node (attribute parts
      // on a single element), so this loop may not run at all.


      while (nodeIndex < part.index) {
        nodeIndex++;

        if (node.nodeName === 'TEMPLATE') {
          stack.push(node);
          walker.currentNode = node.content;
        }

        if ((node = walker.nextNode()) === null) {
          // We've exhausted the content inside a nested template element.
          // Because we still have parts (the outer for-loop), we know:
          // - There is a template in the stack
          // - The walker will find a nextNode outside the template
          walker.currentNode = stack.pop();
          node = walker.nextNode();
        }
      } // We've arrived at our part's node.


      if (part.type === 'node') {
        const part = this.processor.handleTextExpression(this.options);
        part.insertAfterNode(node.previousSibling);

        this.__parts.push(part);
      } else {
        this.__parts.push(...this.processor.handleAttributeExpressions(node, part.name, part.strings, this.options));
      }

      partIndex++;
    }

    if (isCEPolyfill) {
      document.adoptNode(fragment);
      customElements.upgrade(fragment);
    }

    return fragment;
  }

}

/**
 * @license
 * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at
 * http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at
 * http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */
const commentMarker = ` ${marker} `;
/**
 * The return type of `html`, which holds a Template and the values from
 * interpolated expressions.
 */

class TemplateResult {
  constructor(strings, values, type, processor) {
    this.strings = strings;
    this.values = values;
    this.type = type;
    this.processor = processor;
  }
  /**
   * Returns a string of HTML used to create a `<template>` element.
   */


  getHTML() {
    const l = this.strings.length - 1;
    let html = '';
    let isCommentBinding = false;

    for (let i = 0; i < l; i++) {
      const s = this.strings[i]; // For each binding we want to determine the kind of marker to insert
      // into the template source before it's parsed by the browser's HTML
      // parser. The marker type is based on whether the expression is in an
      // attribute, text, or comment poisition.
      //   * For node-position bindings we insert a comment with the marker
      //     sentinel as its text content, like <!--{{lit-guid}}-->.
      //   * For attribute bindings we insert just the marker sentinel for the
      //     first binding, so that we support unquoted attribute bindings.
      //     Subsequent bindings can use a comment marker because multi-binding
      //     attributes must be quoted.
      //   * For comment bindings we insert just the marker sentinel so we don't
      //     close the comment.
      //
      // The following code scans the template source, but is *not* an HTML
      // parser. We don't need to track the tree structure of the HTML, only
      // whether a binding is inside a comment, and if not, if it appears to be
      // the first binding in an attribute.

      const commentOpen = s.lastIndexOf('<!--'); // We're in comment position if we have a comment open with no following
      // comment close. Because <-- can appear in an attribute value there can
      // be false positives.

      isCommentBinding = (commentOpen > -1 || isCommentBinding) && s.indexOf('-->', commentOpen + 1) === -1; // Check to see if we have an attribute-like sequence preceeding the
      // expression. This can match "name=value" like structures in text,
      // comments, and attribute values, so there can be false-positives.

      const attributeMatch = lastAttributeNameRegex.exec(s);

      if (attributeMatch === null) {
        // We're only in this branch if we don't have a attribute-like
        // preceeding sequence. For comments, this guards against unusual
        // attribute values like <div foo="<!--${'bar'}">. Cases like
        // <!-- foo=${'bar'}--> are handled correctly in the attribute branch
        // below.
        html += s + (isCommentBinding ? commentMarker : nodeMarker);
      } else {
        // For attributes we use just a marker sentinel, and also append a
        // $lit$ suffix to the name to opt-out of attribute-specific parsing
        // that IE and Edge do for style and certain SVG attributes.
        html += s.substr(0, attributeMatch.index) + attributeMatch[1] + attributeMatch[2] + boundAttributeSuffix + attributeMatch[3] + marker;
      }
    }

    html += this.strings[l];
    return html;
  }

  getTemplateElement() {
    const template = document.createElement('template');
    template.innerHTML = this.getHTML();
    return template;
  }

}

/**
 * @license
 * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at
 * http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at
 * http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */
const isPrimitive = value => {
  return value === null || !(typeof value === 'object' || typeof value === 'function');
};
const isIterable = value => {
  return Array.isArray(value) || // tslint:disable-next-line:no-any
  !!(value && value[Symbol.iterator]);
};
/**
 * Writes attribute values to the DOM for a group of AttributeParts bound to a
 * single attibute. The value is only set once even if there are multiple parts
 * for an attribute.
 */

class AttributeCommitter {
  constructor(element, name, strings) {
    this.dirty = true;
    this.element = element;
    this.name = name;
    this.strings = strings;
    this.parts = [];

    for (let i = 0; i < strings.length - 1; i++) {
      this.parts[i] = this._createPart();
    }
  }
  /**
   * Creates a single part. Override this to create a differnt type of part.
   */


  _createPart() {
    return new AttributePart(this);
  }

  _getValue() {
    const strings = this.strings;
    const l = strings.length - 1;
    let text = '';

    for (let i = 0; i < l; i++) {
      text += strings[i];
      const part = this.parts[i];

      if (part !== undefined) {
        const v = part.value;

        if (isPrimitive(v) || !isIterable(v)) {
          text += typeof v === 'string' ? v : String(v);
        } else {
          for (const t of v) {
            text += typeof t === 'string' ? t : String(t);
          }
        }
      }
    }

    text += strings[l];
    return text;
  }

  commit() {
    if (this.dirty) {
      this.dirty = false;
      this.element.setAttribute(this.name, this._getValue());
    }
  }

}
/**
 * A Part that controls all or part of an attribute value.
 */

class AttributePart {
  constructor(committer) {
    this.value = undefined;
    this.committer = committer;
  }

  setValue(value) {
    if (value !== noChange && (!isPrimitive(value) || value !== this.value)) {
      this.value = value; // If the value is a not a directive, dirty the committer so that it'll
      // call setAttribute. If the value is a directive, it'll dirty the
      // committer if it calls setValue().

      if (!isDirective(value)) {
        this.committer.dirty = true;
      }
    }
  }

  commit() {
    while (isDirective(this.value)) {
      const directive = this.value;
      this.value = noChange;
      directive(this);
    }

    if (this.value === noChange) {
      return;
    }

    this.committer.commit();
  }

}
/**
 * A Part that controls a location within a Node tree. Like a Range, NodePart
 * has start and end locations and can set and update the Nodes between those
 * locations.
 *
 * NodeParts support several value types: primitives, Nodes, TemplateResults,
 * as well as arrays and iterables of those types.
 */

class NodePart {
  constructor(options) {
    this.value = undefined;
    this.__pendingValue = undefined;
    this.options = options;
  }
  /**
   * Appends this part into a container.
   *
   * This part must be empty, as its contents are not automatically moved.
   */


  appendInto(container) {
    this.startNode = container.appendChild(createMarker());
    this.endNode = container.appendChild(createMarker());
  }
  /**
   * Inserts this part after the `ref` node (between `ref` and `ref`'s next
   * sibling). Both `ref` and its next sibling must be static, unchanging nodes
   * such as those that appear in a literal section of a template.
   *
   * This part must be empty, as its contents are not automatically moved.
   */


  insertAfterNode(ref) {
    this.startNode = ref;
    this.endNode = ref.nextSibling;
  }
  /**
   * Appends this part into a parent part.
   *
   * This part must be empty, as its contents are not automatically moved.
   */


  appendIntoPart(part) {
    part.__insert(this.startNode = createMarker());

    part.__insert(this.endNode = createMarker());
  }
  /**
   * Inserts this part after the `ref` part.
   *
   * This part must be empty, as its contents are not automatically moved.
   */


  insertAfterPart(ref) {
    ref.__insert(this.startNode = createMarker());

    this.endNode = ref.endNode;
    ref.endNode = this.startNode;
  }

  setValue(value) {
    this.__pendingValue = value;
  }

  commit() {
    while (isDirective(this.__pendingValue)) {
      const directive = this.__pendingValue;
      this.__pendingValue = noChange;
      directive(this);
    }

    const value = this.__pendingValue;

    if (value === noChange) {
      return;
    }

    if (isPrimitive(value)) {
      if (value !== this.value) {
        this.__commitText(value);
      }
    } else if (value instanceof TemplateResult) {
      this.__commitTemplateResult(value);
    } else if (value instanceof Node) {
      this.__commitNode(value);
    } else if (isIterable(value)) {
      this.__commitIterable(value);
    } else if (value === nothing) {
      this.value = nothing;
      this.clear();
    } else {
      // Fallback, will render the string representation
      this.__commitText(value);
    }
  }

  __insert(node) {
    this.endNode.parentNode.insertBefore(node, this.endNode);
  }

  __commitNode(value) {
    if (this.value === value) {
      return;
    }

    this.clear();

    this.__insert(value);

    this.value = value;
  }

  __commitText(value) {
    const node = this.startNode.nextSibling;
    value = value == null ? '' : value; // If `value` isn't already a string, we explicitly convert it here in case
    // it can't be implicitly converted - i.e. it's a symbol.

    const valueAsString = typeof value === 'string' ? value : String(value);

    if (node === this.endNode.previousSibling && node.nodeType === 3
    /* Node.TEXT_NODE */
    ) {
        // If we only have a single text node between the markers, we can just
        // set its value, rather than replacing it.
        // TODO(justinfagnani): Can we just check if this.value is primitive?
        node.data = valueAsString;
      } else {
      this.__commitNode(document.createTextNode(valueAsString));
    }

    this.value = value;
  }

  __commitTemplateResult(value) {
    const template = this.options.templateFactory(value);

    if (this.value instanceof TemplateInstance && this.value.template === template) {
      this.value.update(value.values);
    } else {
      // Make sure we propagate the template processor from the TemplateResult
      // so that we use its syntax extension, etc. The template factory comes
      // from the render function options so that it can control template
      // caching and preprocessing.
      const instance = new TemplateInstance(template, value.processor, this.options);

      const fragment = instance._clone();

      instance.update(value.values);

      this.__commitNode(fragment);

      this.value = instance;
    }
  }

  __commitIterable(value) {
    // For an Iterable, we create a new InstancePart per item, then set its
    // value to the item. This is a little bit of overhead for every item in
    // an Iterable, but it lets us recurse easily and efficiently update Arrays
    // of TemplateResults that will be commonly returned from expressions like:
    // array.map((i) => html`${i}`), by reusing existing TemplateInstances.
    // If _value is an array, then the previous render was of an
    // iterable and _value will contain the NodeParts from the previous
    // render. If _value is not an array, clear this part and make a new
    // array for NodeParts.
    if (!Array.isArray(this.value)) {
      this.value = [];
      this.clear();
    } // Lets us keep track of how many items we stamped so we can clear leftover
    // items from a previous render


    const itemParts = this.value;
    let partIndex = 0;
    let itemPart;

    for (const item of value) {
      // Try to reuse an existing part
      itemPart = itemParts[partIndex]; // If no existing part, create a new one

      if (itemPart === undefined) {
        itemPart = new NodePart(this.options);
        itemParts.push(itemPart);

        if (partIndex === 0) {
          itemPart.appendIntoPart(this);
        } else {
          itemPart.insertAfterPart(itemParts[partIndex - 1]);
        }
      }

      itemPart.setValue(item);
      itemPart.commit();
      partIndex++;
    }

    if (partIndex < itemParts.length) {
      // Truncate the parts array so _value reflects the current state
      itemParts.length = partIndex;
      this.clear(itemPart && itemPart.endNode);
    }
  }

  clear(startNode = this.startNode) {
    removeNodes(this.startNode.parentNode, startNode.nextSibling, this.endNode);
  }

}
/**
 * Implements a boolean attribute, roughly as defined in the HTML
 * specification.
 *
 * If the value is truthy, then the attribute is present with a value of
 * ''. If the value is falsey, the attribute is removed.
 */

class BooleanAttributePart {
  constructor(element, name, strings) {
    this.value = undefined;
    this.__pendingValue = undefined;

    if (strings.length !== 2 || strings[0] !== '' || strings[1] !== '') {
      throw new Error('Boolean attributes can only contain a single expression');
    }

    this.element = element;
    this.name = name;
    this.strings = strings;
  }

  setValue(value) {
    this.__pendingValue = value;
  }

  commit() {
    while (isDirective(this.__pendingValue)) {
      const directive = this.__pendingValue;
      this.__pendingValue = noChange;
      directive(this);
    }

    if (this.__pendingValue === noChange) {
      return;
    }

    const value = !!this.__pendingValue;

    if (this.value !== value) {
      if (value) {
        this.element.setAttribute(this.name, '');
      } else {
        this.element.removeAttribute(this.name);
      }

      this.value = value;
    }

    this.__pendingValue = noChange;
  }

}
/**
 * Sets attribute values for PropertyParts, so that the value is only set once
 * even if there are multiple parts for a property.
 *
 * If an expression controls the whole property value, then the value is simply
 * assigned to the property under control. If there are string literals or
 * multiple expressions, then the strings are expressions are interpolated into
 * a string first.
 */

class PropertyCommitter extends AttributeCommitter {
  constructor(element, name, strings) {
    super(element, name, strings);
    this.single = strings.length === 2 && strings[0] === '' && strings[1] === '';
  }

  _createPart() {
    return new PropertyPart(this);
  }

  _getValue() {
    if (this.single) {
      return this.parts[0].value;
    }

    return super._getValue();
  }

  commit() {
    if (this.dirty) {
      this.dirty = false; // tslint:disable-next-line:no-any

      this.element[this.name] = this._getValue();
    }
  }

}
class PropertyPart extends AttributePart {} // Detect event listener options support. If the `capture` property is read
// from the options object, then options are supported. If not, then the thrid
// argument to add/removeEventListener is interpreted as the boolean capture
// value so we should only pass the `capture` property.

let eventOptionsSupported = false;

try {
  const options = {
    get capture() {
      eventOptionsSupported = true;
      return false;
    }

  }; // tslint:disable-next-line:no-any

  window.addEventListener('test', options, options); // tslint:disable-next-line:no-any

  window.removeEventListener('test', options, options);
} catch (_e) {}

class EventPart {
  constructor(element, eventName, eventContext) {
    this.value = undefined;
    this.__pendingValue = undefined;
    this.element = element;
    this.eventName = eventName;
    this.eventContext = eventContext;

    this.__boundHandleEvent = e => this.handleEvent(e);
  }

  setValue(value) {
    this.__pendingValue = value;
  }

  commit() {
    while (isDirective(this.__pendingValue)) {
      const directive = this.__pendingValue;
      this.__pendingValue = noChange;
      directive(this);
    }

    if (this.__pendingValue === noChange) {
      return;
    }

    const newListener = this.__pendingValue;
    const oldListener = this.value;
    const shouldRemoveListener = newListener == null || oldListener != null && (newListener.capture !== oldListener.capture || newListener.once !== oldListener.once || newListener.passive !== oldListener.passive);
    const shouldAddListener = newListener != null && (oldListener == null || shouldRemoveListener);

    if (shouldRemoveListener) {
      this.element.removeEventListener(this.eventName, this.__boundHandleEvent, this.__options);
    }

    if (shouldAddListener) {
      this.__options = getOptions(newListener);
      this.element.addEventListener(this.eventName, this.__boundHandleEvent, this.__options);
    }

    this.value = newListener;
    this.__pendingValue = noChange;
  }

  handleEvent(event) {
    if (typeof this.value === 'function') {
      this.value.call(this.eventContext || this.element, event);
    } else {
      this.value.handleEvent(event);
    }
  }

} // We copy options because of the inconsistent behavior of browsers when reading
// the third argument of add/removeEventListener. IE11 doesn't support options
// at all. Chrome 41 only reads `capture` if the argument is an object.

const getOptions = o => o && (eventOptionsSupported ? {
  capture: o.capture,
  passive: o.passive,
  once: o.once
} : o.capture);

/**
 * @license
 * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at
 * http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at
 * http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */
/**
 * Creates Parts when a template is instantiated.
 */

class DefaultTemplateProcessor {
  /**
   * Create parts for an attribute-position binding, given the event, attribute
   * name, and string literals.
   *
   * @param element The element containing the binding
   * @param name  The attribute name
   * @param strings The string literals. There are always at least two strings,
   *   event for fully-controlled bindings with a single expression.
   */
  handleAttributeExpressions(element, name, strings, options) {
    const prefix = name[0];

    if (prefix === '.') {
      const committer = new PropertyCommitter(element, name.slice(1), strings);
      return committer.parts;
    }

    if (prefix === '@') {
      return [new EventPart(element, name.slice(1), options.eventContext)];
    }

    if (prefix === '?') {
      return [new BooleanAttributePart(element, name.slice(1), strings)];
    }

    const committer = new AttributeCommitter(element, name, strings);
    return committer.parts;
  }
  /**
   * Create parts for a text-position binding.
   * @param templateFactory
   */


  handleTextExpression(options) {
    return new NodePart(options);
  }

}
const defaultTemplateProcessor = new DefaultTemplateProcessor();

/**
 * @license
 * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at
 * http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at
 * http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */
/**
 * The default TemplateFactory which caches Templates keyed on
 * result.type and result.strings.
 */

function templateFactory(result) {
  let templateCache = templateCaches.get(result.type);

  if (templateCache === undefined) {
    templateCache = {
      stringsArray: new WeakMap(),
      keyString: new Map()
    };
    templateCaches.set(result.type, templateCache);
  }

  let template = templateCache.stringsArray.get(result.strings);

  if (template !== undefined) {
    return template;
  } // If the TemplateStringsArray is new, generate a key from the strings
  // This key is shared between all templates with identical content


  const key = result.strings.join(marker); // Check if we already have a Template for this key

  template = templateCache.keyString.get(key);

  if (template === undefined) {
    // If we have not seen this key before, create a new Template
    template = new Template(result, result.getTemplateElement()); // Cache the Template for this key

    templateCache.keyString.set(key, template);
  } // Cache all future queries for this TemplateStringsArray


  templateCache.stringsArray.set(result.strings, template);
  return template;
}
const templateCaches = new Map();

/**
 * @license
 * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at
 * http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at
 * http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */
const parts = new WeakMap();
/**
 * Renders a template result or other value to a container.
 *
 * To update a container with new values, reevaluate the template literal and
 * call `render` with the new result.
 *
 * @param result Any value renderable by NodePart - typically a TemplateResult
 *     created by evaluating a template tag like `html` or `svg`.
 * @param container A DOM parent to render to. The entire contents are either
 *     replaced, or efficiently updated if the same result type was previous
 *     rendered there.
 * @param options RenderOptions for the entire render tree rendered to this
 *     container. Render options must *not* change between renders to the same
 *     container, as those changes will not effect previously rendered DOM.
 */

const render = (result, container, options) => {
  let part = parts.get(container);

  if (part === undefined) {
    removeNodes(container, container.firstChild);
    parts.set(container, part = new NodePart(Object.assign({
      templateFactory
    }, options)));
    part.appendInto(container);
  }

  part.setValue(result);
  part.commit();
};

/**
 * @license
 * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at
 * http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at
 * http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */
// This line will be used in regexes to search for lit-html usage.
// TODO(justinfagnani): inject version number at build time

(window['litHtmlVersions'] || (window['litHtmlVersions'] = [])).push('1.1.2');
/**
 * Interprets a template literal as an HTML template that can efficiently
 * render to and update a container.
 */

const html = (strings, ...values) => new TemplateResult(strings, values, 'html', defaultTemplateProcessor);

/**
 * @license
 * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at
 * http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at
 * http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */
const walkerNodeFilter = 133
/* NodeFilter.SHOW_{ELEMENT|COMMENT|TEXT} */
;
/**
 * Removes the list of nodes from a Template safely. In addition to removing
 * nodes from the Template, the Template part indices are updated to match
 * the mutated Template DOM.
 *
 * As the template is walked the removal state is tracked and
 * part indices are adjusted as needed.
 *
 * div
 *   div#1 (remove) <-- start removing (removing node is div#1)
 *     div
 *       div#2 (remove)  <-- continue removing (removing node is still div#1)
 *         div
 * div <-- stop removing since previous sibling is the removing node (div#1,
 * removed 4 nodes)
 */

function removeNodesFromTemplate(template, nodesToRemove) {
  const {
    element: {
      content
    },
    parts
  } = template;
  const walker = document.createTreeWalker(content, walkerNodeFilter, null, false);
  let partIndex = nextActiveIndexInTemplateParts(parts);
  let part = parts[partIndex];
  let nodeIndex = -1;
  let removeCount = 0;
  const nodesToRemoveInTemplate = [];
  let currentRemovingNode = null;

  while (walker.nextNode()) {
    nodeIndex++;
    const node = walker.currentNode; // End removal if stepped past the removing node

    if (node.previousSibling === currentRemovingNode) {
      currentRemovingNode = null;
    } // A node to remove was found in the template


    if (nodesToRemove.has(node)) {
      nodesToRemoveInTemplate.push(node); // Track node we're removing

      if (currentRemovingNode === null) {
        currentRemovingNode = node;
      }
    } // When removing, increment count by which to adjust subsequent part indices


    if (currentRemovingNode !== null) {
      removeCount++;
    }

    while (part !== undefined && part.index === nodeIndex) {
      // If part is in a removed node deactivate it by setting index to -1 or
      // adjust the index as needed.
      part.index = currentRemovingNode !== null ? -1 : part.index - removeCount; // go to the next active part.

      partIndex = nextActiveIndexInTemplateParts(parts, partIndex);
      part = parts[partIndex];
    }
  }

  nodesToRemoveInTemplate.forEach(n => n.parentNode.removeChild(n));
}

const countNodes = node => {
  let count = node.nodeType === 11
  /* Node.DOCUMENT_FRAGMENT_NODE */
  ? 0 : 1;
  const walker = document.createTreeWalker(node, walkerNodeFilter, null, false);

  while (walker.nextNode()) {
    count++;
  }

  return count;
};

const nextActiveIndexInTemplateParts = (parts, startIndex = -1) => {
  for (let i = startIndex + 1; i < parts.length; i++) {
    const part = parts[i];

    if (isTemplatePartActive(part)) {
      return i;
    }
  }

  return -1;
};
/**
 * Inserts the given node into the Template, optionally before the given
 * refNode. In addition to inserting the node into the Template, the Template
 * part indices are updated to match the mutated Template DOM.
 */


function insertNodeIntoTemplate(template, node, refNode = null) {
  const {
    element: {
      content
    },
    parts
  } = template; // If there's no refNode, then put node at end of template.
  // No part indices need to be shifted in this case.

  if (refNode === null || refNode === undefined) {
    content.appendChild(node);
    return;
  }

  const walker = document.createTreeWalker(content, walkerNodeFilter, null, false);
  let partIndex = nextActiveIndexInTemplateParts(parts);
  let insertCount = 0;
  let walkerIndex = -1;

  while (walker.nextNode()) {
    walkerIndex++;
    const walkerNode = walker.currentNode;

    if (walkerNode === refNode) {
      insertCount = countNodes(node);
      refNode.parentNode.insertBefore(node, refNode);
    }

    while (partIndex !== -1 && parts[partIndex].index === walkerIndex) {
      // If we've inserted the node, simply adjust all subsequent parts
      if (insertCount > 0) {
        while (partIndex !== -1) {
          parts[partIndex].index += insertCount;
          partIndex = nextActiveIndexInTemplateParts(parts, partIndex);
        }

        return;
      }

      partIndex = nextActiveIndexInTemplateParts(parts, partIndex);
    }
  }
}

/**
 * @license
 * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at
 * http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at
 * http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */

const getTemplateCacheKey = (type, scopeName) => `${type}--${scopeName}`;

let compatibleShadyCSSVersion = true;

if (typeof window.ShadyCSS === 'undefined') {
  compatibleShadyCSSVersion = false;
} else if (typeof window.ShadyCSS.prepareTemplateDom === 'undefined') {
  console.warn(`Incompatible ShadyCSS version detected. ` + `Please update to at least @webcomponents/webcomponentsjs@2.0.2 and ` + `@webcomponents/shadycss@1.3.1.`);
  compatibleShadyCSSVersion = false;
}
/**
 * Template factory which scopes template DOM using ShadyCSS.
 * @param scopeName {string}
 */


const shadyTemplateFactory = scopeName => result => {
  const cacheKey = getTemplateCacheKey(result.type, scopeName);
  let templateCache = templateCaches.get(cacheKey);

  if (templateCache === undefined) {
    templateCache = {
      stringsArray: new WeakMap(),
      keyString: new Map()
    };
    templateCaches.set(cacheKey, templateCache);
  }

  let template = templateCache.stringsArray.get(result.strings);

  if (template !== undefined) {
    return template;
  }

  const key = result.strings.join(marker);
  template = templateCache.keyString.get(key);

  if (template === undefined) {
    const element = result.getTemplateElement();

    if (compatibleShadyCSSVersion) {
      window.ShadyCSS.prepareTemplateDom(element, scopeName);
    }

    template = new Template(result, element);
    templateCache.keyString.set(key, template);
  }

  templateCache.stringsArray.set(result.strings, template);
  return template;
};

const TEMPLATE_TYPES = ['html', 'svg'];
/**
 * Removes all style elements from Templates for the given scopeName.
 */

const removeStylesFromLitTemplates = scopeName => {
  TEMPLATE_TYPES.forEach(type => {
    const templates = templateCaches.get(getTemplateCacheKey(type, scopeName));

    if (templates !== undefined) {
      templates.keyString.forEach(template => {
        const {
          element: {
            content
          }
        } = template; // IE 11 doesn't support the iterable param Set constructor

        const styles = new Set();
        Array.from(content.querySelectorAll('style')).forEach(s => {
          styles.add(s);
        });
        removeNodesFromTemplate(template, styles);
      });
    }
  });
};

const shadyRenderSet = new Set();
/**
 * For the given scope name, ensures that ShadyCSS style scoping is performed.
 * This is done just once per scope name so the fragment and template cannot
 * be modified.
 * (1) extracts styles from the rendered fragment and hands them to ShadyCSS
 * to be scoped and appended to the document
 * (2) removes style elements from all lit-html Templates for this scope name.
 *
 * Note, <style> elements can only be placed into templates for the
 * initial rendering of the scope. If <style> elements are included in templates
 * dynamically rendered to the scope (after the first scope render), they will
 * not be scoped and the <style> will be left in the template and rendered
 * output.
 */

const prepareTemplateStyles = (scopeName, renderedDOM, template) => {
  shadyRenderSet.add(scopeName); // If `renderedDOM` is stamped from a Template, then we need to edit that
  // Template's underlying template element. Otherwise, we create one here
  // to give to ShadyCSS, which still requires one while scoping.

  const templateElement = !!template ? template.element : document.createElement('template'); // Move styles out of rendered DOM and store.

  const styles = renderedDOM.querySelectorAll('style');
  const {
    length
  } = styles; // If there are no styles, skip unnecessary work

  if (length === 0) {
    // Ensure prepareTemplateStyles is called to support adding
    // styles via `prepareAdoptedCssText` since that requires that
    // `prepareTemplateStyles` is called.
    //
    // ShadyCSS will only update styles containing @apply in the template
    // given to `prepareTemplateStyles`. If no lit Template was given,
    // ShadyCSS will not be able to update uses of @apply in any relevant
    // template. However, this is not a problem because we only create the
    // template for the purpose of supporting `prepareAdoptedCssText`,
    // which doesn't support @apply at all.
    window.ShadyCSS.prepareTemplateStyles(templateElement, scopeName);
    return;
  }

  const condensedStyle = document.createElement('style'); // Collect styles into a single style. This helps us make sure ShadyCSS
  // manipulations will not prevent us from being able to fix up template
  // part indices.
  // NOTE: collecting styles is inefficient for browsers but ShadyCSS
  // currently does this anyway. When it does not, this should be changed.

  for (let i = 0; i < length; i++) {
    const style = styles[i];
    style.parentNode.removeChild(style);
    condensedStyle.textContent += style.textContent;
  } // Remove styles from nested templates in this scope.


  removeStylesFromLitTemplates(scopeName); // And then put the condensed style into the "root" template passed in as
  // `template`.

  const content = templateElement.content;

  if (!!template) {
    insertNodeIntoTemplate(template, condensedStyle, content.firstChild);
  } else {
    content.insertBefore(condensedStyle, content.firstChild);
  } // Note, it's important that ShadyCSS gets the template that `lit-html`
  // will actually render so that it can update the style inside when
  // needed (e.g. @apply native Shadow DOM case).


  window.ShadyCSS.prepareTemplateStyles(templateElement, scopeName);
  const style = content.querySelector('style');

  if (window.ShadyCSS.nativeShadow && style !== null) {
    // When in native Shadow DOM, ensure the style created by ShadyCSS is
    // included in initially rendered output (`renderedDOM`).
    renderedDOM.insertBefore(style.cloneNode(true), renderedDOM.firstChild);
  } else if (!!template) {
    // When no style is left in the template, parts will be broken as a
    // result. To fix this, we put back the style node ShadyCSS removed
    // and then tell lit to remove that node from the template.
    // There can be no style in the template in 2 cases (1) when Shady DOM
    // is in use, ShadyCSS removes all styles, (2) when native Shadow DOM
    // is in use ShadyCSS removes the style if it contains no content.
    // NOTE, ShadyCSS creates its own style so we can safely add/remove
    // `condensedStyle` here.
    content.insertBefore(condensedStyle, content.firstChild);
    const removes = new Set();
    removes.add(condensedStyle);
    removeNodesFromTemplate(template, removes);
  }
};
/**
 * Extension to the standard `render` method which supports rendering
 * to ShadowRoots when the ShadyDOM (https://github.com/webcomponents/shadydom)
 * and ShadyCSS (https://github.com/webcomponents/shadycss) polyfills are used
 * or when the webcomponentsjs
 * (https://github.com/webcomponents/webcomponentsjs) polyfill is used.
 *
 * Adds a `scopeName` option which is used to scope element DOM and stylesheets
 * when native ShadowDOM is unavailable. The `scopeName` will be added to
 * the class attribute of all rendered DOM. In addition, any style elements will
 * be automatically re-written with this `scopeName` selector and moved out
 * of the rendered DOM and into the document `<head>`.
 *
 * It is common to use this render method in conjunction with a custom element
 * which renders a shadowRoot. When this is done, typically the element's
 * `localName` should be used as the `scopeName`.
 *
 * In addition to DOM scoping, ShadyCSS also supports a basic shim for css
 * custom properties (needed only on older browsers like IE11) and a shim for
 * a deprecated feature called `@apply` that supports applying a set of css
 * custom properties to a given location.
 *
 * Usage considerations:
 *
 * * Part values in `<style>` elements are only applied the first time a given
 * `scopeName` renders. Subsequent changes to parts in style elements will have
 * no effect. Because of this, parts in style elements should only be used for
 * values that will never change, for example parts that set scope-wide theme
 * values or parts which render shared style elements.
 *
 * * Note, due to a limitation of the ShadyDOM polyfill, rendering in a
 * custom element's `constructor` is not supported. Instead rendering should
 * either done asynchronously, for example at microtask timing (for example
 * `Promise.resolve()`), or be deferred until the first time the element's
 * `connectedCallback` runs.
 *
 * Usage considerations when using shimmed custom properties or `@apply`:
 *
 * * Whenever any dynamic changes are made which affect
 * css custom properties, `ShadyCSS.styleElement(element)` must be called
 * to update the element. There are two cases when this is needed:
 * (1) the element is connected to a new parent, (2) a class is added to the
 * element that causes it to match different custom properties.
 * To address the first case when rendering a custom element, `styleElement`
 * should be called in the element's `connectedCallback`.
 *
 * * Shimmed custom properties may only be defined either for an entire
 * shadowRoot (for example, in a `:host` rule) or via a rule that directly
 * matches an element with a shadowRoot. In other words, instead of flowing from
 * parent to child as do native css custom properties, shimmed custom properties
 * flow only from shadowRoots to nested shadowRoots.
 *
 * * When using `@apply` mixing css shorthand property names with
 * non-shorthand names (for example `border` and `border-width`) is not
 * supported.
 */


const render$1 = (result, container, options) => {
  if (!options || typeof options !== 'object' || !options.scopeName) {
    throw new Error('The `scopeName` option is required.');
  }

  const scopeName = options.scopeName;
  const hasRendered = parts.has(container);
  const needsScoping = compatibleShadyCSSVersion && container.nodeType === 11
  /* Node.DOCUMENT_FRAGMENT_NODE */
  && !!container.host; // Handle first render to a scope specially...

  const firstScopeRender = needsScoping && !shadyRenderSet.has(scopeName); // On first scope render, render into a fragment; this cannot be a single
  // fragment that is reused since nested renders can occur synchronously.

  const renderContainer = firstScopeRender ? document.createDocumentFragment() : container;
  render(result, renderContainer, Object.assign({
    templateFactory: shadyTemplateFactory(scopeName)
  }, options)); // When performing first scope render,
  // (1) We've rendered into a fragment so that there's a chance to
  // `prepareTemplateStyles` before sub-elements hit the DOM
  // (which might cause them to render based on a common pattern of
  // rendering in a custom element's `connectedCallback`);
  // (2) Scope the template with ShadyCSS one time only for this scope.
  // (3) Render the fragment into the container and make sure the
  // container knows its `part` is the one we just rendered. This ensures
  // DOM will be re-used on subsequent renders.

  if (firstScopeRender) {
    const part = parts.get(renderContainer);
    parts.delete(renderContainer); // ShadyCSS might have style sheets (e.g. from `prepareAdoptedCssText`)
    // that should apply to `renderContainer` even if the rendered value is
    // not a TemplateInstance. However, it will only insert scoped styles
    // into the document if `prepareTemplateStyles` has already been called
    // for the given scope name.

    const template = part.value instanceof TemplateInstance ? part.value.template : undefined;
    prepareTemplateStyles(scopeName, renderContainer, template);
    removeNodes(container, container.firstChild);
    container.appendChild(renderContainer);
    parts.set(container, part);
  } // After elements have hit the DOM, update styling if this is the
  // initial render to this container.
  // This is needed whenever dynamic changes are made so it would be
  // safest to do every render; however, this would regress performance
  // so we leave it up to the user to call `ShadyCSS.styleElement`
  // for dynamic changes.


  if (!hasRendered && needsScoping) {
    window.ShadyCSS.styleElement(container.host);
  }
};

/**
 * @license
 * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at
 * http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at
 * http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */
var _a;
/**
 * When using Closure Compiler, JSCompiler_renameProperty(property, object) is
 * replaced at compile time by the munged name for object[property]. We cannot
 * alias this function, so we have to use a small shim that has the same
 * behavior when not compiling.
 */


window.JSCompiler_renameProperty = (prop, _obj) => prop;

const defaultConverter = {
  toAttribute(value, type) {
    switch (type) {
      case Boolean:
        return value ? '' : null;

      case Object:
      case Array:
        // if the value is `null` or `undefined` pass this through
        // to allow removing/no change behavior.
        return value == null ? value : JSON.stringify(value);
    }

    return value;
  },

  fromAttribute(value, type) {
    switch (type) {
      case Boolean:
        return value !== null;

      case Number:
        return value === null ? null : Number(value);

      case Object:
      case Array:
        return JSON.parse(value);
    }

    return value;
  }

};
/**
 * Change function that returns true if `value` is different from `oldValue`.
 * This method is used as the default for a property's `hasChanged` function.
 */

const notEqual = (value, old) => {
  // This ensures (old==NaN, value==NaN) always returns false
  return old !== value && (old === old || value === value);
};
const defaultPropertyDeclaration = {
  attribute: true,
  type: String,
  converter: defaultConverter,
  reflect: false,
  hasChanged: notEqual
};
const microtaskPromise = Promise.resolve(true);
const STATE_HAS_UPDATED = 1;
const STATE_UPDATE_REQUESTED = 1 << 2;
const STATE_IS_REFLECTING_TO_ATTRIBUTE = 1 << 3;
const STATE_IS_REFLECTING_TO_PROPERTY = 1 << 4;
const STATE_HAS_CONNECTED = 1 << 5;
/**
 * The Closure JS Compiler doesn't currently have good support for static
 * property semantics where "this" is dynamic (e.g.
 * https://github.com/google/closure-compiler/issues/3177 and others) so we use
 * this hack to bypass any rewriting by the compiler.
 */

const finalized = 'finalized';
/**
 * Base element class which manages element properties and attributes. When
 * properties change, the `update` method is asynchronously called. This method
 * should be supplied by subclassers to render updates as desired.
 */

class UpdatingElement extends HTMLElement {
  constructor() {
    super();
    this._updateState = 0;
    this._instanceProperties = undefined;
    this._updatePromise = microtaskPromise;
    this._hasConnectedResolver = undefined;
    /**
     * Map with keys for any properties that have changed since the last
     * update cycle with previous values.
     */

    this._changedProperties = new Map();
    /**
     * Map with keys of properties that should be reflected when updated.
     */

    this._reflectingProperties = undefined;
    this.initialize();
  }
  /**
   * Returns a list of attributes corresponding to the registered properties.
   * @nocollapse
   */


  static get observedAttributes() {
    // note: piggy backing on this to ensure we're finalized.
    this.finalize();
    const attributes = []; // Use forEach so this works even if for/of loops are compiled to for loops
    // expecting arrays

    this._classProperties.forEach((v, p) => {
      const attr = this._attributeNameForProperty(p, v);

      if (attr !== undefined) {
        this._attributeToPropertyMap.set(attr, p);

        attributes.push(attr);
      }
    });

    return attributes;
  }
  /**
   * Ensures the private `_classProperties` property metadata is created.
   * In addition to `finalize` this is also called in `createProperty` to
   * ensure the `@property` decorator can add property metadata.
   */

  /** @nocollapse */


  static _ensureClassProperties() {
    // ensure private storage for property declarations.
    if (!this.hasOwnProperty(JSCompiler_renameProperty('_classProperties', this))) {
      this._classProperties = new Map(); // NOTE: Workaround IE11 not supporting Map constructor argument.

      const superProperties = Object.getPrototypeOf(this)._classProperties;

      if (superProperties !== undefined) {
        superProperties.forEach((v, k) => this._classProperties.set(k, v));
      }
    }
  }
  /**
   * Creates a property accessor on the element prototype if one does not exist.
   * The property setter calls the property's `hasChanged` property option
   * or uses a strict identity check to determine whether or not to request
   * an update.
   * @nocollapse
   */


  static createProperty(name, options = defaultPropertyDeclaration) {
    // Note, since this can be called by the `@property` decorator which
    // is called before `finalize`, we ensure storage exists for property
    // metadata.
    this._ensureClassProperties();

    this._classProperties.set(name, options); // Do not generate an accessor if the prototype already has one, since
    // it would be lost otherwise and that would never be the user's intention;
    // Instead, we expect users to call `requestUpdate` themselves from
    // user-defined accessors. Note that if the super has an accessor we will
    // still overwrite it


    if (options.noAccessor || this.prototype.hasOwnProperty(name)) {
      return;
    }

    const key = typeof name === 'symbol' ? Symbol() : `__${name}`;
    Object.defineProperty(this.prototype, name, {
      // tslint:disable-next-line:no-any no symbol in index
      get() {
        return this[key];
      },

      set(value) {
        const oldValue = this[name];
        this[key] = value;

        this._requestUpdate(name, oldValue);
      },

      configurable: true,
      enumerable: true
    });
  }
  /**
   * Creates property accessors for registered properties and ensures
   * any superclasses are also finalized.
   * @nocollapse
   */


  static finalize() {
    // finalize any superclasses
    const superCtor = Object.getPrototypeOf(this);

    if (!superCtor.hasOwnProperty(finalized)) {
      superCtor.finalize();
    }

    this[finalized] = true;

    this._ensureClassProperties(); // initialize Map populated in observedAttributes


    this._attributeToPropertyMap = new Map(); // make any properties
    // Note, only process "own" properties since this element will inherit
    // any properties defined on the superClass, and finalization ensures
    // the entire prototype chain is finalized.

    if (this.hasOwnProperty(JSCompiler_renameProperty('properties', this))) {
      const props = this.properties; // support symbols in properties (IE11 does not support this)

      const propKeys = [...Object.getOwnPropertyNames(props), ...(typeof Object.getOwnPropertySymbols === 'function' ? Object.getOwnPropertySymbols(props) : [])]; // This for/of is ok because propKeys is an array

      for (const p of propKeys) {
        // note, use of `any` is due to TypeSript lack of support for symbol in
        // index types
        // tslint:disable-next-line:no-any no symbol in index
        this.createProperty(p, props[p]);
      }
    }
  }
  /**
   * Returns the property name for the given attribute `name`.
   * @nocollapse
   */


  static _attributeNameForProperty(name, options) {
    const attribute = options.attribute;
    return attribute === false ? undefined : typeof attribute === 'string' ? attribute : typeof name === 'string' ? name.toLowerCase() : undefined;
  }
  /**
   * Returns true if a property should request an update.
   * Called when a property value is set and uses the `hasChanged`
   * option for the property if present or a strict identity check.
   * @nocollapse
   */


  static _valueHasChanged(value, old, hasChanged = notEqual) {
    return hasChanged(value, old);
  }
  /**
   * Returns the property value for the given attribute value.
   * Called via the `attributeChangedCallback` and uses the property's
   * `converter` or `converter.fromAttribute` property option.
   * @nocollapse
   */


  static _propertyValueFromAttribute(value, options) {
    const type = options.type;
    const converter = options.converter || defaultConverter;
    const fromAttribute = typeof converter === 'function' ? converter : converter.fromAttribute;
    return fromAttribute ? fromAttribute(value, type) : value;
  }
  /**
   * Returns the attribute value for the given property value. If this
   * returns undefined, the property will *not* be reflected to an attribute.
   * If this returns null, the attribute will be removed, otherwise the
   * attribute will be set to the value.
   * This uses the property's `reflect` and `type.toAttribute` property options.
   * @nocollapse
   */


  static _propertyValueToAttribute(value, options) {
    if (options.reflect === undefined) {
      return;
    }

    const type = options.type;
    const converter = options.converter;
    const toAttribute = converter && converter.toAttribute || defaultConverter.toAttribute;
    return toAttribute(value, type);
  }
  /**
   * Performs element initialization. By default captures any pre-set values for
   * registered properties.
   */


  initialize() {
    this._saveInstanceProperties(); // ensures first update will be caught by an early access of
    // `updateComplete`


    this._requestUpdate();
  }
  /**
   * Fixes any properties set on the instance before upgrade time.
   * Otherwise these would shadow the accessor and break these properties.
   * The properties are stored in a Map which is played back after the
   * constructor runs. Note, on very old versions of Safari (<=9) or Chrome
   * (<=41), properties created for native platform properties like (`id` or
   * `name`) may not have default values set in the element constructor. On
   * these browsers native properties appear on instances and therefore their
   * default value will overwrite any element default (e.g. if the element sets
   * this.id = 'id' in the constructor, the 'id' will become '' since this is
   * the native platform default).
   */


  _saveInstanceProperties() {
    // Use forEach so this works even if for/of loops are compiled to for loops
    // expecting arrays
    this.constructor._classProperties.forEach((_v, p) => {
      if (this.hasOwnProperty(p)) {
        const value = this[p];
        delete this[p];

        if (!this._instanceProperties) {
          this._instanceProperties = new Map();
        }

        this._instanceProperties.set(p, value);
      }
    });
  }
  /**
   * Applies previously saved instance properties.
   */


  _applyInstanceProperties() {
    // Use forEach so this works even if for/of loops are compiled to for loops
    // expecting arrays
    // tslint:disable-next-line:no-any
    this._instanceProperties.forEach((v, p) => this[p] = v);

    this._instanceProperties = undefined;
  }

  connectedCallback() {
    this._updateState = this._updateState | STATE_HAS_CONNECTED; // Ensure first connection completes an update. Updates cannot complete
    // before connection and if one is pending connection the
    // `_hasConnectionResolver` will exist. If so, resolve it to complete the
    // update, otherwise requestUpdate.

    if (this._hasConnectedResolver) {
      this._hasConnectedResolver();

      this._hasConnectedResolver = undefined;
    }
  }
  /**
   * Allows for `super.disconnectedCallback()` in extensions while
   * reserving the possibility of making non-breaking feature additions
   * when disconnecting at some point in the future.
   */


  disconnectedCallback() {}
  /**
   * Synchronizes property values when attributes change.
   */


  attributeChangedCallback(name, old, value) {
    if (old !== value) {
      this._attributeToProperty(name, value);
    }
  }

  _propertyToAttribute(name, value, options = defaultPropertyDeclaration) {
    const ctor = this.constructor;

    const attr = ctor._attributeNameForProperty(name, options);

    if (attr !== undefined) {
      const attrValue = ctor._propertyValueToAttribute(value, options); // an undefined value does not change the attribute.


      if (attrValue === undefined) {
        return;
      } // Track if the property is being reflected to avoid
      // setting the property again via `attributeChangedCallback`. Note:
      // 1. this takes advantage of the fact that the callback is synchronous.
      // 2. will behave incorrectly if multiple attributes are in the reaction
      // stack at time of calling. However, since we process attributes
      // in `update` this should not be possible (or an extreme corner case
      // that we'd like to discover).
      // mark state reflecting


      this._updateState = this._updateState | STATE_IS_REFLECTING_TO_ATTRIBUTE;

      if (attrValue == null) {
        this.removeAttribute(attr);
      } else {
        this.setAttribute(attr, attrValue);
      } // mark state not reflecting


      this._updateState = this._updateState & ~STATE_IS_REFLECTING_TO_ATTRIBUTE;
    }
  }

  _attributeToProperty(name, value) {
    // Use tracking info to avoid deserializing attribute value if it was
    // just set from a property setter.
    if (this._updateState & STATE_IS_REFLECTING_TO_ATTRIBUTE) {
      return;
    }

    const ctor = this.constructor;

    const propName = ctor._attributeToPropertyMap.get(name);

    if (propName !== undefined) {
      const options = ctor._classProperties.get(propName) || defaultPropertyDeclaration; // mark state reflecting

      this._updateState = this._updateState | STATE_IS_REFLECTING_TO_PROPERTY;
      this[propName] = // tslint:disable-next-line:no-any
      ctor._propertyValueFromAttribute(value, options); // mark state not reflecting

      this._updateState = this._updateState & ~STATE_IS_REFLECTING_TO_PROPERTY;
    }
  }
  /**
   * This private version of `requestUpdate` does not access or return the
   * `updateComplete` promise. This promise can be overridden and is therefore
   * not free to access.
   */


  _requestUpdate(name, oldValue) {
    let shouldRequestUpdate = true; // If we have a property key, perform property update steps.

    if (name !== undefined) {
      const ctor = this.constructor;
      const options = ctor._classProperties.get(name) || defaultPropertyDeclaration;

      if (ctor._valueHasChanged(this[name], oldValue, options.hasChanged)) {
        if (!this._changedProperties.has(name)) {
          this._changedProperties.set(name, oldValue);
        } // Add to reflecting properties set.
        // Note, it's important that every change has a chance to add the
        // property to `_reflectingProperties`. This ensures setting
        // attribute + property reflects correctly.


        if (options.reflect === true && !(this._updateState & STATE_IS_REFLECTING_TO_PROPERTY)) {
          if (this._reflectingProperties === undefined) {
            this._reflectingProperties = new Map();
          }

          this._reflectingProperties.set(name, options);
        }
      } else {
        // Abort the request if the property should not be considered changed.
        shouldRequestUpdate = false;
      }
    }

    if (!this._hasRequestedUpdate && shouldRequestUpdate) {
      this._enqueueUpdate();
    }
  }
  /**
   * Requests an update which is processed asynchronously. This should
   * be called when an element should update based on some state not triggered
   * by setting a property. In this case, pass no arguments. It should also be
   * called when manually implementing a property setter. In this case, pass the
   * property `name` and `oldValue` to ensure that any configured property
   * options are honored. Returns the `updateComplete` Promise which is resolved
   * when the update completes.
   *
   * @param name {PropertyKey} (optional) name of requesting property
   * @param oldValue {any} (optional) old value of requesting property
   * @returns {Promise} A Promise that is resolved when the update completes.
   */


  requestUpdate(name, oldValue) {
    this._requestUpdate(name, oldValue);

    return this.updateComplete;
  }
  /**
   * Sets up the element to asynchronously update.
   */


  async _enqueueUpdate() {
    // Mark state updating...
    this._updateState = this._updateState | STATE_UPDATE_REQUESTED;
    let resolve;
    let reject;
    const previousUpdatePromise = this._updatePromise;
    this._updatePromise = new Promise((res, rej) => {
      resolve = res;
      reject = rej;
    });

    try {
      // Ensure any previous update has resolved before updating.
      // This `await` also ensures that property changes are batched.
      await previousUpdatePromise;
    } catch (e) {} // Ignore any previous errors. We only care that the previous cycle is
    // done. Any error should have been handled in the previous update.
    // Make sure the element has connected before updating.


    if (!this._hasConnected) {
      await new Promise(res => this._hasConnectedResolver = res);
    }

    try {
      const result = this.performUpdate(); // If `performUpdate` returns a Promise, we await it. This is done to
      // enable coordinating updates with a scheduler. Note, the result is
      // checked to avoid delaying an additional microtask unless we need to.

      if (result != null) {
        await result;
      }
    } catch (e) {
      reject(e);
    }

    resolve(!this._hasRequestedUpdate);
  }

  get _hasConnected() {
    return this._updateState & STATE_HAS_CONNECTED;
  }

  get _hasRequestedUpdate() {
    return this._updateState & STATE_UPDATE_REQUESTED;
  }

  get hasUpdated() {
    return this._updateState & STATE_HAS_UPDATED;
  }
  /**
   * Performs an element update. Note, if an exception is thrown during the
   * update, `firstUpdated` and `updated` will not be called.
   *
   * You can override this method to change the timing of updates. If this
   * method is overridden, `super.performUpdate()` must be called.
   *
   * For instance, to schedule updates to occur just before the next frame:
   *
   * ```
   * protected async performUpdate(): Promise<unknown> {
   *   await new Promise((resolve) => requestAnimationFrame(() => resolve()));
   *   super.performUpdate();
   * }
   * ```
   */


  performUpdate() {
    // Mixin instance properties once, if they exist.
    if (this._instanceProperties) {
      this._applyInstanceProperties();
    }

    let shouldUpdate = false;
    const changedProperties = this._changedProperties;

    try {
      shouldUpdate = this.shouldUpdate(changedProperties);

      if (shouldUpdate) {
        this.update(changedProperties);
      }
    } catch (e) {
      // Prevent `firstUpdated` and `updated` from running when there's an
      // update exception.
      shouldUpdate = false;
      throw e;
    } finally {
      // Ensure element can accept additional updates after an exception.
      this._markUpdated();
    }

    if (shouldUpdate) {
      if (!(this._updateState & STATE_HAS_UPDATED)) {
        this._updateState = this._updateState | STATE_HAS_UPDATED;
        this.firstUpdated(changedProperties);
      }

      this.updated(changedProperties);
    }
  }

  _markUpdated() {
    this._changedProperties = new Map();
    this._updateState = this._updateState & ~STATE_UPDATE_REQUESTED;
  }
  /**
   * Returns a Promise that resolves when the element has completed updating.
   * The Promise value is a boolean that is `true` if the element completed the
   * update without triggering another update. The Promise result is `false` if
   * a property was set inside `updated()`. If the Promise is rejected, an
   * exception was thrown during the update.
   *
   * To await additional asynchronous work, override the `_getUpdateComplete`
   * method. For example, it is sometimes useful to await a rendered element
   * before fulfilling this Promise. To do this, first await
   * `super._getUpdateComplete()`, then any subsequent state.
   *
   * @returns {Promise} The Promise returns a boolean that indicates if the
   * update resolved without triggering another update.
   */


  get updateComplete() {
    return this._getUpdateComplete();
  }
  /**
   * Override point for the `updateComplete` promise.
   *
   * It is not safe to override the `updateComplete` getter directly due to a
   * limitation in TypeScript which means it is not possible to call a
   * superclass getter (e.g. `super.updateComplete.then(...)`) when the target
   * language is ES5 (https://github.com/microsoft/TypeScript/issues/338).
   * This method should be overridden instead. For example:
   *
   *   class MyElement extends LitElement {
   *     async _getUpdateComplete() {
   *       await super._getUpdateComplete();
   *       await this._myChild.updateComplete;
   *     }
   *   }
   */


  _getUpdateComplete() {
    return this._updatePromise;
  }
  /**
   * Controls whether or not `update` should be called when the element requests
   * an update. By default, this method always returns `true`, but this can be
   * customized to control when to update.
   *
   * * @param _changedProperties Map of changed properties with old values
   */


  shouldUpdate(_changedProperties) {
    return true;
  }
  /**
   * Updates the element. This method reflects property values to attributes.
   * It can be overridden to render and keep updated element DOM.
   * Setting properties inside this method will *not* trigger
   * another update.
   *
   * * @param _changedProperties Map of changed properties with old values
   */


  update(_changedProperties) {
    if (this._reflectingProperties !== undefined && this._reflectingProperties.size > 0) {
      // Use forEach so this works even if for/of loops are compiled to for
      // loops expecting arrays
      this._reflectingProperties.forEach((v, k) => this._propertyToAttribute(k, this[k], v));

      this._reflectingProperties = undefined;
    }
  }
  /**
   * Invoked whenever the element is updated. Implement to perform
   * post-updating tasks via DOM APIs, for example, focusing an element.
   *
   * Setting properties inside this method will trigger the element to update
   * again after this update cycle completes.
   *
   * * @param _changedProperties Map of changed properties with old values
   */


  updated(_changedProperties) {}
  /**
   * Invoked when the element is first updated. Implement to perform one time
   * work on the element after update.
   *
   * Setting properties inside this method will trigger the element to update
   * again after this update cycle completes.
   *
   * * @param _changedProperties Map of changed properties with old values
   */


  firstUpdated(_changedProperties) {}

}
_a = finalized;
/**
 * Marks class as having finished creating properties.
 */

UpdatingElement[_a] = true;

/**
@license
Copyright (c) 2019 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at
http://polymer.github.io/LICENSE.txt The complete set of authors may be found at
http://polymer.github.io/AUTHORS.txt The complete set of contributors may be
found at http://polymer.github.io/CONTRIBUTORS.txt Code distributed by Google as
part of the polymer project is also subject to an additional IP rights grant
found at http://polymer.github.io/PATENTS.txt
*/
const supportsAdoptingStyleSheets = 'adoptedStyleSheets' in Document.prototype && 'replace' in CSSStyleSheet.prototype;

/**
 * @license
 * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at
 * http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at
 * http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */
// This line will be used in regexes to search for LitElement usage.
// TODO(justinfagnani): inject version number at build time

(window['litElementVersions'] || (window['litElementVersions'] = [])).push('2.2.1');
/**
 * Minimal implementation of Array.prototype.flat
 * @param arr the array to flatten
 * @param result the accumlated result
 */

function arrayFlat(styles, result = []) {
  for (let i = 0, length = styles.length; i < length; i++) {
    const value = styles[i];

    if (Array.isArray(value)) {
      arrayFlat(value, result);
    } else {
      result.push(value);
    }
  }

  return result;
}
/** Deeply flattens styles array. Uses native flat if available. */


const flattenStyles = styles => styles.flat ? styles.flat(Infinity) : arrayFlat(styles);

class LitElement extends UpdatingElement {
  /** @nocollapse */
  static finalize() {
    // The Closure JS Compiler does not always preserve the correct "this"
    // when calling static super methods (b/137460243), so explicitly bind.
    super.finalize.call(this); // Prepare styling that is stamped at first render time. Styling
    // is built from user provided `styles` or is inherited from the superclass.

    this._styles = this.hasOwnProperty(JSCompiler_renameProperty('styles', this)) ? this._getUniqueStyles() : this._styles || [];
  }
  /** @nocollapse */


  static _getUniqueStyles() {
    // Take care not to call `this.styles` multiple times since this generates
    // new CSSResults each time.
    // TODO(sorvell): Since we do not cache CSSResults by input, any
    // shared styles will generate new stylesheet objects, which is wasteful.
    // This should be addressed when a browser ships constructable
    // stylesheets.
    const userStyles = this.styles;
    const styles = [];

    if (Array.isArray(userStyles)) {
      const flatStyles = flattenStyles(userStyles); // As a performance optimization to avoid duplicated styling that can
      // occur especially when composing via subclassing, de-duplicate styles
      // preserving the last item in the list. The last item is kept to
      // try to preserve cascade order with the assumption that it's most
      // important that last added styles override previous styles.

      const styleSet = flatStyles.reduceRight((set, s) => {
        set.add(s); // on IE set.add does not return the set.

        return set;
      }, new Set()); // Array.from does not work on Set in IE

      styleSet.forEach(v => styles.unshift(v));
    } else if (userStyles) {
      styles.push(userStyles);
    }

    return styles;
  }
  /**
   * Performs element initialization. By default this calls `createRenderRoot`
   * to create the element `renderRoot` node and captures any pre-set values for
   * registered properties.
   */


  initialize() {
    super.initialize();
    this.renderRoot = this.createRenderRoot(); // Note, if renderRoot is not a shadowRoot, styles would/could apply to the
    // element's getRootNode(). While this could be done, we're choosing not to
    // support this now since it would require different logic around de-duping.

    if (window.ShadowRoot && this.renderRoot instanceof window.ShadowRoot) {
      this.adoptStyles();
    }
  }
  /**
   * Returns the node into which the element should render and by default
   * creates and returns an open shadowRoot. Implement to customize where the
   * element's DOM is rendered. For example, to render into the element's
   * childNodes, return `this`.
   * @returns {Element|DocumentFragment} Returns a node into which to render.
   */


  createRenderRoot() {
    return this.attachShadow({
      mode: 'open'
    });
  }
  /**
   * Applies styling to the element shadowRoot using the `static get styles`
   * property. Styling will apply using `shadowRoot.adoptedStyleSheets` where
   * available and will fallback otherwise. When Shadow DOM is polyfilled,
   * ShadyCSS scopes styles and adds them to the document. When Shadow DOM
   * is available but `adoptedStyleSheets` is not, styles are appended to the
   * end of the `shadowRoot` to [mimic spec
   * behavior](https://wicg.github.io/construct-stylesheets/#using-constructed-stylesheets).
   */


  adoptStyles() {
    const styles = this.constructor._styles;

    if (styles.length === 0) {
      return;
    } // There are three separate cases here based on Shadow DOM support.
    // (1) shadowRoot polyfilled: use ShadyCSS
    // (2) shadowRoot.adoptedStyleSheets available: use it.
    // (3) shadowRoot.adoptedStyleSheets polyfilled: append styles after
    // rendering


    if (window.ShadyCSS !== undefined && !window.ShadyCSS.nativeShadow) {
      window.ShadyCSS.ScopingShim.prepareAdoptedCssText(styles.map(s => s.cssText), this.localName);
    } else if (supportsAdoptingStyleSheets) {
      this.renderRoot.adoptedStyleSheets = styles.map(s => s.styleSheet);
    } else {
      // This must be done after rendering so the actual style insertion is done
      // in `update`.
      this._needsShimAdoptedStyleSheets = true;
    }
  }

  connectedCallback() {
    super.connectedCallback(); // Note, first update/render handles styleElement so we only call this if
    // connected after first update.

    if (this.hasUpdated && window.ShadyCSS !== undefined) {
      window.ShadyCSS.styleElement(this);
    }
  }
  /**
   * Updates the element. This method reflects property values to attributes
   * and calls `render` to render DOM via lit-html. Setting properties inside
   * this method will *not* trigger another update.
   * * @param _changedProperties Map of changed properties with old values
   */


  update(changedProperties) {
    super.update(changedProperties);
    const templateResult = this.render();

    if (templateResult instanceof TemplateResult) {
      this.constructor.render(templateResult, this.renderRoot, {
        scopeName: this.localName,
        eventContext: this
      });
    } // When native Shadow DOM is used but adoptedStyles are not supported,
    // insert styling after rendering to ensure adoptedStyles have highest
    // priority.


    if (this._needsShimAdoptedStyleSheets) {
      this._needsShimAdoptedStyleSheets = false;

      this.constructor._styles.forEach(s => {
        const style = document.createElement('style');
        style.textContent = s.cssText;
        this.renderRoot.appendChild(style);
      });
    }
  }
  /**
   * Invoked on each update to perform rendering tasks. This method must return
   * a lit-html TemplateResult. Setting properties inside this method will *not*
   * trigger the element to update.
   */


  render() {}

}
/**
 * Ensure this class is marked as `finalized` as an optimization ensuring
 * it will not needlessly try to `finalize`.
 *
 * Note this property name is a string to prevent breaking Closure JS Compiler
 * optimizations. See updating-element.ts for more information.
 */

LitElement['finalized'] = true;
/**
 * Render method used to render the lit-html TemplateResult to the element's
 * DOM.
 * @param {TemplateResult} Template to render.
 * @param {Element|DocumentFragment} Node into which to render.
 * @param {String} Element name.
 * @nocollapse
 */

LitElement.render = render$1;

const getThemeVar = themeVar => {
  return getComputedStyle(document.body).getPropertyValue(themeVar);
};

const defaultConfig = {
  // Main config
  locale: [],
  header_text: lovelace.config.title || 'Home Assistant',
  disabled_mode: false,
  kiosk_mode: false,
  compact_mode: false,
  footer_mode: false,
  split_mode: false,
  disable_sidebar: false,
  hide_header: false,
  chevrons: true,
  indicator_top: false,
  hidden_tab_redirect: true,
  shadow: true,
  default_tab_on_refresh: true,
  // Colors
  background: getThemeVar('--ch-background') || 'var(--primary-color)',
  elements_color: getThemeVar('--ch-elements-color') || 'var(--text-primary-color)',
  menu_color: getThemeVar('--ch-menu-color') || '',
  voice_color: getThemeVar('--ch-voice-color') || '',
  options_color: getThemeVar('--ch-options-color') || '',
  all_tabs_color: getThemeVar('--ch-all-tabs-color') || '',
  notification_dot_color: getThemeVar('--ch-notification-dot-color') || getThemeVar('var(--accent-color)') || '#ff9800',
  tab_indicator_color: getThemeVar('--ch-tab-indicator-color') || '',
  active_tab_color: getThemeVar('--ch-active-tab-color') || '',
  tabs_color: [],
  // Tabs
  hide_tabs: [],
  show_tabs: [],
  default_tab: '',
  tab_icons: [],
  reverse_tab_direction: false,
  // Buttons
  button_icons: [],
  button_text: [],
  reverse_button_direction: false,
  menu_dropdown: false,
  menu_hide: false,
  voice_dropdown: false,
  voice_hide: false,
  options_hide: false,
  // Overflow menu items
  hide_help: false,
  hide_unused: false,
  hide_refresh: false,
  hide_config: false,
  hide_raw: false,
  // Custom CSS
  tabs_css: [],
  header_css: '',
  stack_css: '',
  header_text_css: '',
  active_tab_css: '',
  options_list_css: '',
  menu_css: '',
  options_css: '',
  voice_css: '',
  all_tabs_css: '',
  tab_container_css: '',
  view_css: '',
  panel_view_css: '',
  // Misc
  template_variables: '',
  exceptions: [],
  editor_warnings: true
};

var common = {
	version: "Version"
};
var links = {
	docs: "Docs",
	forums: "Forums"
};
var editor = {
	add_exception: "Add Exception",
	automatic: "automatic",
	buttons: "Buttons",
	cancel: "Cancel",
	chevrons_tip: "Disable scrolling arrows for tabs.",
	chevrons_title: "Display Tab Chevrons",
	compact_mode_tip: "Make header compact.",
	compact_mode_title: "Compact Mode",
	conditions: "Conditions",
	config: "Config",
	current_user_agent: "Current User Agent",
	current_user: "Current User",
	default_tab: "Default tab",
	disable_sidebar_tip: "Disable sidebar and menu button.",
	disable_sidebar_title: "Disable Sidebar",
	disabled_mode_tip: "Completely disable Custom-Header.",
	disabled_mode_title: "Disabled Mode",
	disabled_template: "Disabled: The current value is a template.",
	editor_warnings_second_title: "Display Editor Warnings & Info",
	editor_warnings_tip: "Toggle editor warnings.",
	editor_warnings_title: "Display this info and warnings section.",
	exceptions: "Exceptions",
	footer_mode_tip: "Turn the header into a footer or reverse split mode.",
	footer_mode_title: "Footer Mode",
	header_text: "Header text.",
	hidden_tab_redirect_tip: "Redirect from hidden tab.",
	hidden_tab_redirect_title: "Hidden Tab Redirect",
	hide_configure_ui_tip: "Hide item in options menu.",
	hide_configure_ui_title: "Hide 'Configure UI'",
	hide_header_tip: "Hide header, but allow swipe out of sidebar.",
	hide_header_title: "Disable Header",
	hide_help_tip: "Hide item in options menu.",
	hide_help_title: "Hide 'Help'",
	hide_raw_editor_tip: "Hide item in options menu.",
	hide_raw_editor_title: "Hide 'Raw Config Editor'",
	hide_tab_list: "Comma-separated list of tab numbers to hide",
	hide_unused_tip: "Hide item in options menu.",
	hide_unused_title: "Hide 'Unused Entities'",
	kiosk_mode_tip: "Hide and disable the header and sidebar",
	kiosk_mode_title: "Kiosk Mode",
	locale_desc: "Locale for default template variables (date/time).",
	media_query: "Media Query",
	menu_dropdown_tip: "Put menu button in options menu.",
	menu_dropdown_title: "Menu in Dropdown Menu",
	menu_hide_tip: "Hide the menu button.",
	menu_hide_title: "Hide Menu Button",
	menu_items: "Menu Items",
	options_hide_tip: "Hide the options button.",
	options_hide_title: "Hide Options Button",
	query_string: "Query String",
	removes_edit_ui: "Removes ability to edit UI.",
	reverse_button_tip: "Reverses all buttons orientation.",
	reverse_button_title: "Reverse Buttons Orientation",
	reverse_tab_tip: "Places tabs on right side in reverse order.",
	reverse_tab_title: "Reverse Tab Direction",
	save_and_reload: "Save and reload",
	save_failed: "Save failed",
	shadow_tip: "Hide header shadows",
	shadow_title: "Shadows",
	show_tab_list: "Comma-separated list of tab numbers to show",
	split_mode_tip: "Split header into one header one footer",
	split_mode_title: "Split Mode",
	tabs_hide: "Hide Tabs",
	tabs_show: "Show Tabs",
	tabs: "Tabs",
	user_agent: "User Agent",
	user_list: "User (Seperate multiple users with a comma.)",
	voice_dropdown_tip: "Put voice button in options menu.",
	voice_dropdown_title: "Voice in Dropdown Menu",
	voice_hide_tip: "Hide the voice button.",
	voice_hide_title: "Hide Voice Button",
	warning_allready_a_template: "Designates items that are already a template and won't be modified by the editor.",
	warning_disable_ch: "You can temporaily disable Custom-Header by adding '?disable_ch' to the end of your URL.",
	warning_edit_ui: "Marks items that remove your ability to edit the UI.",
	warning_jinja_info: "All text options accept Jinja. Hover over any item for more info.",
	warning_raw_editor_reload: "After using the 'Raw Config Editor' you need to reload the page to restore Custom Header."
};
var en = {
	common: common,
	links: links,
	editor: editor
};

var en$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  common: common,
  links: links,
  editor: editor,
  'default': en
});

var common$1 = {
	version: "Versjon"
};
var links$1 = {
	docs: "Documentasjon",
	forums: "Forum"
};
var editor$1 = {
	add_exception: "Legg til unntak",
	automatic: "automatisk",
	buttons: "Brytere",
	cancel: "Avbryt",
	chevrons_tip: "Deaktiver pilene på tab båndet.",
	chevrons_title: "Vis tab piler",
	compact_mode_tip: "Gjør headeren compact.",
	compact_mode_title: "Kompakt modus",
	conditions: "Betingelser",
	config: "Konfigurasjon",
	current_user_agent: "Nåværende User Agent",
	current_user: "Pålogget bruker",
	default_tab: "Standard tab",
	disable_sidebar_tip: "Deaktiver side panelet og meny knappen.",
	disable_sidebar_title: "Deaktiver side panelet",
	disabled_mode_tip: "Deaktiver Custom-Header.",
	disabled_mode_title: "Deaktivert modus",
	disabled_template: "Deaktivert: Nåværende verdi er en mal.",
	editor_warnings_second_title: "Vis editor advarser of informasjon",
	editor_warnings_tip: "Veksle editor advarsler.",
	editor_warnings_title: "Vis denne informasjonen og advarsel seksjoner.",
	exceptions: "Unntak",
	footer_mode_tip: "Gjør header til footer eller reversert split modus.",
	footer_mode_title: "Footer modus",
	header_text: "Header tekst.",
	hidden_tab_redirect_tip: "Omadresser fra gjemt tab.",
	hidden_tab_redirect_title: "Gjemt tab omadresser",
	hide_configure_ui_tip: "Gjem 'Konfigurer brukergrensesnitt' in nedtrekksmenyen.",
	hide_configure_ui_title: "Gjem 'Konfigurer brukergrensesnitt'",
	hide_header_tip: "Gjem headderen, men tillat å dra inn fra siden for å åpne side panelet",
	hide_help_tip: "Deaktiver header",
	hide_help_title: "Gjem 'Hjelp'",
	hide_raw_editor_tip: "Gjem 'Tekstbasert konfigurasjonsredigering' in nedtrekksmenyen.",
	hide_raw_editor_title: "Gjem 'Tekstbasert konfigurasjonsredigering'",
	hide_tab_list: "Komma separert liste over tabber som skal gjemmes",
	hide_unused_tip: "Gjem 'Unused Entities' in nedtrekksmenyen.",
	hide_unused_title: "Gjem 'Unused Entities'",
	kiosk_mode_tip: "Gjem og deaktiver headeren og side panelet.",
	kiosk_mode_title: "Kiosk modus",
	locale_desc: "Locale for standard mal variabler (dato/tip).",
	menu_dropdown_tip: "Plasser meny i nedtrekksmenyen.",
	menu_dropdown_title: "Meny i nedtrekksmenyen",
	menu_hide_tip: "Gjem meny knappen.",
	menu_hide_title: "Gjem meny knappen",
	menu_items: "Meny elementer",
	options_hide_tip: "Gjem alternativer knappen.",
	options_hide_title: "Gjem alternativer knappen",
	removes_edit_ui: "Fjerner muligheten til å redigere brukergrensesnittet.",
	reverse_button_tip: "Reverser alle bryter orienteringer.",
	reverse_button_title: "Reverser bryter orientering",
	reverse_tab_tip: "Plasser tabber på høyre side i reversert rekkefølge.",
	reverse_tab_title: "Reverser tab rettning",
	save_and_reload: "Lagre og last inn på nytt",
	save_failed: "Lagring feilet",
	shadow_tip: "Gjemheader skygger",
	shadow_title: "Skygger",
	show_tab_list: "Komma separert liste over tabber som skal vises",
	split_mode_tip: "Split modus, både header og footer",
	split_mode_title: "Split modus",
	tabs_hide: "Gjem Tabber",
	tabs_show: "Vis Tabber",
	tabs: "Tabber",
	user_list: "Bruker (Skill flere brukere med komma.)",
	voice_dropdown_tip: "Plasser stemme i nedtrekksmenyen.",
	voice_dropdown_title: "Stemme i nedtrekksmenyen",
	voice_hide_tip: "Gjem stemme knappen.",
	voice_hide_title: "Gjem stemme knappen",
	warning_allready_a_template: "Etter å ha brukt 'Tekstbasert konfigurasjonsredigering', må du laste inn siden på nytt for å gjenopprette Custom Header.",
	warning_disable_ch: "Du kan deaktivere Custom-Header midlertidig ved å legge til '?disable_ch' på slutten av nettadressen.",
	warning_edit_ui: "Markerer elementer som fjerner muligheten til å redigere brukergrensesnittet.",
	warning_jinja_info: "Alle tekstalternativer godtar Jinja. Hold musepekeren over et hvilket som helst element for mer informasjon.",
	warning_raw_editor_reload: "After using the 'Tekstbasert konfigurasjonsredigering' you need to reload the page to restore Custom Header."
};
var nb = {
	common: common$1,
	links: links$1,
	editor: editor$1
};

var nb$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  common: common$1,
  links: links$1,
  editor: editor$1,
  'default': nb
});

const languages = {
  en: en$1,
  nb: nb$1
};
function localize(string) {
  let search = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';
  let replace = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : '';
  const section = string.split('.')[0];
  const key = string.split('.')[1];
  const lang = (localStorage.getItem('selectedLanguage') || 'en').replace(/['"]+/g, '').replace('-', '_');
  let tranlated;

  try {
    tranlated = languages[lang][section][key];
  } catch (e) {
    tranlated = languages['en'][section][key];
  }

  if (tranlated === undefined) tranlated = languages['en'][section][key];

  if (search !== '' && replace !== '') {
    tranlated = tranlated.replace(search, replace);
  }

  return tranlated;
}

function _templateObject21() {
  const data = _taggedTemplateLiteral(["\n      <paper-input\n        label=\"", "\"\n        .value=\"", "\"\n        .configValue=\"", "\"\n        @value-changed=\"", "\"\n      >\n      </paper-input>\n      <paper-input\n        label=\"", "\"\n        .value=\"", "\"\n        .configValue=\"", "\"\n        @value-changed=\"", "\"\n      >\n      </paper-input>\n      <paper-input\n        label=\"", "\"\n        .value=\"", "\"\n        .configValue=\"", "\"\n        @value-changed=\"", "\"\n      >\n      </paper-input>\n      <paper-input\n        label=\"", "\"\n        .value=\"", "\"\n        .configValue=\"", "\"\n        @value-changed=\"", "\"\n      >\n      </paper-input>\n    "]);

  _templateObject21 = function _templateObject21() {
    return data;
  };

  return data;
}

function _templateObject20() {
  const data = _taggedTemplateLiteral([""]);

  _templateObject20 = function _templateObject20() {
    return data;
  };

  return data;
}

function _templateObject19() {
  const data = _taggedTemplateLiteral(["\n      <style>\n        h3,\n        h4 {\n          font-size: 16pt;\n          margin-bottom: 5px;\n          width: 100%;\n        }\n        [closed] {\n          overflow: hidden;\n          height: 52px;\n        }\n        paper-card {\n          margin-top: 10px;\n          width: 100%;\n          transition: all 0.5s ease;\n        }\n        .underline {\n          width: 100%;\n          background: var(--dark-color);\n          color: var(--text-dark-color);\n          padding: 5px;\n          width: calc(100% + 30px);\n          margin-left: calc(0% - 20px);\n        }\n      </style>\n    "]);

  _templateObject19 = function _templateObject19() {
    return data;
  };

  return data;
}

function _templateObject18() {
  const data = _taggedTemplateLiteral(["\n      ", "\n      <custom-style>\n        <style is=\"custom-style\">\n          .card-header {\n            margin-top: -5px;\n            @apply --paper-font-headline;\n          }\n          .card-header paper-icon-button {\n            margin-top: -5px;\n            float: right;\n          }\n        </style>\n      </custom-style>\n      <paper-card ?closed=", ">\n        <div class=\"card-content\">\n          <div class=\"card-header\">\n            ", "\n            <paper-icon-button\n              icon=\"", "\"\n              @click=\"", "\"\n            >\n            </paper-icon-button>\n            <paper-icon-button ?hidden=", " icon=\"mdi:delete\" @click=\"", "\">\n            </paper-icon-button>\n          </div>\n          <h4 class=\"underline\">", "</h4>\n          <ch-conditions-editor\n            .conditions=\"", "\"\n            @ch-conditions-changed=\"", "\"\n          >\n          </ch-conditions-editor>\n          <h4 class=\"underline\">", "</h4>\n          <ch-config-editor\n            exception\n            .defaultConfig=\"", "\"\n            .config=\"", "\"\n            @ch-config-changed=\"", "\"\n          >\n          </ch-config-editor>\n        </div>\n      </paper-card>\n    "]);

  _templateObject18 = function _templateObject18() {
    return data;
  };

  return data;
}

function _templateObject17() {
  const data = _taggedTemplateLiteral([""]);

  _templateObject17 = function _templateObject17() {
    return data;
  };

  return data;
}

function _templateObject16() {
  const data = _taggedTemplateLiteral(["\n      <style>\n        h3,\n        h4 {\n          font-size: 16pt;\n          margin-bottom: 5px;\n          width: 100%;\n        }\n        paper-toggle-button.custom-header-toggle {\n          padding-top: 16px;\n        }\n        iron-icon {\n          padding-right: 5px;\n        }\n        iron-input {\n          max-width: 115px;\n        }\n        .inherited {\n          opacity: 0.4;\n        }\n        .inherited:hover {\n          opacity: 1;\n        }\n        .side-by-side {\n          display: flex;\n          flex-wrap: wrap;\n        }\n        .side-by-side > * {\n          flex: 1;\n          padding-right: 4px;\n          flex-basis: 33%;\n        }\n        .buttons > div {\n          display: flex;\n          align-items: center;\n        }\n        .buttons > div paper-dropdown-menu {\n          flex-grow: 1;\n        }\n        .buttons > div iron-icon {\n          padding-right: 15px;\n          padding-top: 20px;\n          margin-left: -3px;\n        }\n        .buttons > div:nth-of-type(2n) iron-icon {\n          padding-left: 20px;\n        }\n        .warning {\n          background-color: #455a64;\n          padding: 10px;\n          color: #ffcd4c;\n          border-radius: 5px;\n        }\n        .alert {\n          color: #ff9800;\n          padding-right: 0;\n          margin-right: -5px;\n          padding-left: 7px;\n        }\n        [closed] {\n          overflow: hidden;\n          height: 52px;\n        }\n        paper-card {\n          margin-top: 10px;\n          width: 100%;\n          transition: all 0.5s ease;\n        }\n        .underline {\n          width: 100%;\n          background: var(--dark-color);\n          color: var(--text-dark-color);\n          padding: 5px;\n          width: calc(100% + 30px);\n          margin-left: calc(0% - 20px);\n        }\n      </style>\n    "]);

  _templateObject16 = function _templateObject16() {
    return data;
  };

  return data;
}

function _templateObject15() {
  const data = _taggedTemplateLiteral(["\n            <h4 class=\"underline\">Main Config</h4>\n          "]);

  _templateObject15 = function _templateObject15() {
    return data;
  };

  return data;
}

function _templateObject14() {
  const data = _taggedTemplateLiteral(["\n                  <br />\n                  <div class=\"warning\">\n                    <p style=\"padding: 5px; margin: 0;\">\n                      ", "\n                    </p>\n                    <p style=\"padding: 5px; margin: 0;\">\n                      ", "\n                    </p>\n                    <br />\n                    <p style=\"padding: 5px; margin: 0;\">\n                      <ha-icon style=\"padding-right: 3px;\" icon=\"mdi:alpha-t-box-outline\"></ha-icon>\n                      ", "\n                      <br /><ha-icon style=\"padding-right: 3px;\" icon=\"mdi:alert-box-outline\"></ha-icon> ", "<br />\n                    </p>\n                    <br />\n                    <p style=\"padding: 5px; margin: 0;\">\n                      ", "\n                    </p>\n                  </div>\n                "]);

  _templateObject14 = function _templateObject14() {
    return data;
  };

  return data;
}

function _templateObject13() {
  const data = _taggedTemplateLiteral(["\n            <h1 style=\"margin-top:-20px;margin-bottom:0;\" class=\"underline\">\n              Custom Header\n            </h1>\n            <h4 style=\"margin-top:-5px;padding-top:10px;font-size:12pt;\" class=\"underline\">\n              <a href=\"https://maykar.github.io/custom-header/\" target=\"_blank\">\n                <ha-icon icon=\"mdi:help-circle\" style=\"margin-top:-5px;\"> </ha-icon>\n                ", "&nbsp;&nbsp;&nbsp;</a\n              >\n              <a href=\"https://github.com/maykar/custom-header\" target=\"_blank\">\n                <ha-icon icon=\"mdi:github-circle\" style=\"margin-top:-5px;\"> </ha-icon>\n                GitHub&nbsp;&nbsp;&nbsp;</a\n              >\n              <a href=\"https://community.home-assistant.io/t/custom-header/\" target=\"_blank\">\n                <ha-icon icon=\"hass:home-assistant\" style=\"margin-top:-5px;\"> </ha-icon>\n                ", "</a\n              >\n            </h4>\n            ", "\n            ", "\n          "]);

  _templateObject13 = function _templateObject13() {
    return data;
  };

  return data;
}

function _templateObject12() {
  const data = _taggedTemplateLiteral(["\n      <custom-style>\n        <style is=\"custom-style\">\n          a {\n            color: var(--text-dark-color);\n            text-decoration: none;\n          }\n          .card-header {\n            margin-top: -5px;\n            @apply --paper-font-headline;\n          }\n          .card-header paper-icon-button {\n            margin-top: -5px;\n            float: right;\n          }\n        </style>\n      </custom-style>\n      ", "\n      ", "\n      ", "\n      <div style=\"padding-bottom:20px;\" class=\"side-by-side\">\n        ", "\n        ", "\n        ", "\n        ", "\n        ", "\n        ", "\n        ", "\n        ", "\n        ", "\n        ", "\n        ", "\n      </div>\n      <hr />\n      <div class=\"side-by-side\">\n        <paper-input\n          style=\"padding: 10px 10px 0 10px;\"\n          class=\"", "\"\n          label=\"", "\"\n          .value=\"", "\"\n          .configValue=\"", "\"\n          @value-changed=\"", "\"\n        >\n        </paper-input>\n        <paper-input\n          placeholder=\"", "\"\n          style=\"padding: 10px 10px 0 10px;\"\n          class=\"", "\"\n          label=\"", "\"\n          .value=\"", "\"\n          .configValue=\"", "\"\n          @value-changed=\"", "\"\n        >\n        </paper-input>\n      </div>\n      <h4 class=\"underline\">", "</h4>\n      <div class=\"side-by-side\">\n        ", "\n        ", "\n        ", "\n        ", "\n      </div>\n      <h4 class=\"underline\">", "</h4>\n      <div style=\"padding-bottom:20px;\" class=\"side-by-side\">\n        ", "\n        ", "\n        ", "\n        ", "\n        ", "\n        ", "\n      </div>\n      <h4 class=\"underline\">", "</h4>\n      <paper-dropdown-menu id=\"tabs\" @value-changed=\"", "\">\n        <paper-listbox slot=\"dropdown-content\" .selected=\"", "\">\n          <paper-item>", "</paper-item>\n          <paper-item>", "</paper-item>\n        </paper-listbox>\n      </paper-dropdown-menu>\n      <div class=\"side-by-side\">\n        <div id=\"show\" style=\"display:", "\">\n          <paper-input\n            class=\"", "\"\n            label=\"", ":\"\n            .value=\"", "\"\n            .configValue=\"", "\"\n            @value-changed=\"", "\"\n          >\n          </paper-input>\n        </div>\n        <div id=\"hide\" style=\"display:", "\">\n          <paper-input\n            class=\"", "\"\n            label=\"", ":\"\n            .value=\"", "\"\n            .configValue=\"", "\"\n            @value-changed=\"", "\"\n          >\n          </paper-input>\n        </div>\n        <paper-input\n          class=\"", "\"\n          label=\"", ":\"\n          .value=\"", "\"\n          .configValue=\"", "\"\n          @value-changed=\"", "\"\n        >\n        </paper-input>\n        ", "\n      </div>\n    "]);

  _templateObject12 = function _templateObject12() {
    return data;
  };

  return data;
}

function _templateObject11() {
  const data = _taggedTemplateLiteral(["\n      <paper-toggle-button\n        class=\"", " custom-header-toggle\"\n        ?checked=\"", "\"\n        .configValue=\"", "\"\n        @change=\"", "\"\n        title=", "\n        ?disabled=", "\n      >\n        ", " ", "\n        ", "\n      </paper-toggle-button>\n    "]);

  _templateObject11 = function _templateObject11() {
    return data;
  };

  return data;
}

function _templateObject10() {
  const data = _taggedTemplateLiteral(["\n      <iron-icon icon=\"mdi:alert-box-outline\" class=\"alert\" title=\"", "\"></iron-icon>\n    "]);

  _templateObject10 = function _templateObject10() {
    return data;
  };

  return data;
}

function _templateObject9() {
  const data = _taggedTemplateLiteral(["\n      <iron-icon\n        icon=\"mdi:alpha-t-box-outline\"\n        class=\"alert\"\n        title=\"", "\"\n      ></iron-icon>\n    "]);

  _templateObject9 = function _templateObject9() {
    return data;
  };

  return data;
}

function _templateObject8() {
  const data = _taggedTemplateLiteral(["\n      <style>\n        h3,\n        h4 {\n          font-size: 16pt;\n          margin-bottom: 5px;\n          width: 100%;\n        }\n        .toggle-button {\n          margin: 4px;\n          background-color: transparent;\n          color: var(--primary-color);\n        }\n        .title_control {\n          color: var(--text-dark-color);\n          font-weight: bold;\n          font-size: 22px;\n          float: right;\n          cursor: pointer;\n          margin: -10px -5px -5px -5px;\n        }\n        .user_agent {\n          display: block;\n          margin-left: auto;\n          margin-right: auto;\n          padding: 5px;\n          border: 0;\n          resize: none;\n          width: 100%;\n        }\n        .underline {\n          width: 100%;\n          background: var(--dark-color);\n          color: var(--text-dark-color);\n          padding: 5px;\n          width: calc(100% + 30px);\n          margin-left: calc(0% - 20px);\n        }\n      </style>\n    "]);

  _templateObject8 = function _templateObject8() {
    return data;
  };

  return data;
}

function _templateObject7() {
  const data = _taggedTemplateLiteral(["\n      <mwc-button raised @click=\"", "\">", "</mwc-button>\n    "]);

  _templateObject7 = function _templateObject7() {
    return data;
  };

  return data;
}

function _templateObject6() {
  const data = _taggedTemplateLiteral(["\n      <mwc-button raised @click=\"", "\">", "</mwc-button>\n    "]);

  _templateObject6 = function _templateObject6() {
    return data;
  };

  return data;
}

function _templateObject5() {
  const data = _taggedTemplateLiteral(["\n              ", "\n            "]);

  _templateObject5 = function _templateObject5() {
    return data;
  };

  return data;
}

function _templateObject4() {
  const data = _taggedTemplateLiteral(["\n              ", "\n            "]);

  _templateObject4 = function _templateObject4() {
    return data;
  };

  return data;
}

function _templateObject3() {
  const data = _taggedTemplateLiteral(["\n              <ch-exception-editor\n                .config=\"", "\"\n                .exception=\"", "\"\n                .index=\"", "\"\n                @ch-exception-changed=\"", "\"\n                @ch-exception-delete=\"", "\"\n              >\n              </ch-exception-editor>\n            "]);

  _templateObject3 = function _templateObject3() {
    return data;
  };

  return data;
}

function _templateObject2() {
  const data = _taggedTemplateLiteral(["\n      <div @click=\"", "\" class=\"title_control\">\n        X\n      </div>\n      ", "\n      <ch-config-editor\n        .defaultConfig=\"", "\"\n        .config=\"", "\"\n        @ch-config-changed=\"", "\"\n      >\n      </ch-config-editor>\n      <h4 class=\"underline\">", "</h4>\n      <br />\n      ", "\n      <br />\n      <mwc-button @click=\"", "\">", "</mwc-button>\n      <h4 class=\"underline\">", "</h4>\n      <p style=\"font-size:16pt\">", "</p>\n      <h4 class=\"underline\">", "</h4>\n      <br />\n      ", "\n      <br />\n      <h4\n        style=\"background:var(--paper-card-background-color);\n          margin-bottom:-20px;\"\n        class=\"underline\"\n      >\n        ", "\n        ", "\n      </h4>\n    "]);

  _templateObject2 = function _templateObject2() {
    return data;
  };

  return data;
}

function _templateObject() {
  const data = _taggedTemplateLiteral([""]);

  _templateObject = function _templateObject() {
    return data;
  };

  return data;
}
class CustomHeaderEditor extends LitElement {
  static get properties() {
    return {
      _config: {}
    };
  }

  firstUpdated() {
    this._lovelace = F();
    this.deepcopy = this.deepcopy.bind(this);
    this._config = this._lovelace.config.custom_header ? this.deepcopy(this._lovelace.config.custom_header) : {};
  }

  render() {
    if (!this._config || !this._lovelace) return html(_templateObject());
    return html(_templateObject2(), this._close, this.renderStyle(), defaultConfig, this._config, this._configChanged, localize('editor.exceptions'), this._config.exceptions ? this._config.exceptions.map((exception, index) => html(_templateObject3(), this._config, exception, index, this._exceptionChanged, this._exceptionDelete)) : '', this._addException, localize('editor.add_exception'), localize('editor.current_user'), hass.user.name, localize('editor.current_user_agent'), navigator.userAgent, !this.exception ? html(_templateObject4(), this._save_button) : '', !this.exception ? html(_templateObject5(), this._cancel_button) : '');
  }

  _close() {
    const editor = this.parentNode.parentNode.parentNode.querySelector('editor');
    this.parentNode.parentNode.parentNode.removeChild(editor);
  }

  _save() {
    for (const key in this._config) {
      if (this._config[key] == defaultConfig[key]) delete this._config[key];
    }

    const newConfig = _objectSpread2({}, this._lovelace.config, {}, {
      custom_header: this._config
    });

    try {
      this._lovelace.saveConfig(newConfig).then(() => {
        window.location.href = window.location.href;
      });
    } catch (e) {
      alert("".concat(localize('editor.save_failed'), ": ").concat(e));
    }
  }

  get _save_button() {
    const text = localize('editor.save_and_reload');
    return html(_templateObject6(), this._save, text);
  }

  get _cancel_button() {
    return html(_templateObject7(), this._close, localize('editor.cancel'));
  }

  _addException() {
    let newExceptions;

    if (this._config.exceptions) {
      newExceptions = this._config.exceptions.slice(0);
      newExceptions.push({
        conditions: {},
        config: {}
      });
    } else {
      newExceptions = [{
        conditions: {},
        config: {}
      }];
    }

    this._config = _objectSpread2({}, this._config, {
      exceptions: newExceptions
    });
    A(this, 'config-changed', {
      config: this._config
    });
  }

  _configChanged(_ref) {
    let {
      detail
    } = _ref;
    if (!this._config) return;
    this._config = _objectSpread2({}, this._config, {}, detail.config);
    A(this, 'config-changed', {
      config: this._config
    });
  }

  _exceptionChanged(ev) {
    if (!this._config) return;
    const target = ev.target.index;

    const newExceptions = this._config.exceptions.slice(0);

    newExceptions[target] = ev.detail.exception;

    for (const exceptions of newExceptions) {
      for (const key in exceptions.config) {
        if (this._config[key] == exceptions.config[key]) delete exceptions.config[key];else if (!this._config[key] && defaultConfig[key] == exceptions.config[key]) delete exceptions.config[key];
      }
    }

    this._config = _objectSpread2({}, this._config, {
      exceptions: newExceptions
    });
    A(this, 'config-changed', {
      config: this._config
    });
  }

  _exceptionDelete(ev) {
    if (!this._config) return;
    const target = ev.target;

    const newExceptions = this._config.exceptions.slice(0);

    newExceptions.splice(target.index, 1);
    this._config = _objectSpread2({}, this._config, {
      exceptions: newExceptions
    });
    A(this, 'config-changed', {
      config: this._config
    });
    this.requestUpdate();
  }

  deepcopy(value) {
    if (!(!!value && typeof value == 'object')) return value;

    if (Object.prototype.toString.call(value) == '[object Date]') {
      return new Date(value.getTime());
    }

    if (Array.isArray(value)) return value.map(this.deepcopy);
    const result = {};
    Object.keys(value).forEach(key => {
      result[key] = this.deepcopy(value[key]);
    });
    return result;
  }

  renderStyle() {
    return html(_templateObject8());
  }

}
customElements.define('custom-header-editor', CustomHeaderEditor);

class ChConfigEditor extends LitElement {
  static get properties() {
    return {
      defaultConfig: {},
      config: {},
      exception: {},
      _closed: {}
    };
  }

  constructor() {
    super();
    this.buttonOptions = ['show', 'hide', 'clock', 'overflow'];
    this.overflowOptions = ['show', 'hide', 'clock'];
    this.swipeAnimation = ['none', 'swipe', 'fade', 'flip'];
  }

  get _clock() {
    return this.getConfig('menu') == 'clock' || this.getConfig('voice') == 'clock' || this.getConfig('options') == 'clock';
  }

  getConfig(item) {
    return this.config[item] !== undefined ? this.config[item] : defaultConfig[item];
  }

  templateExists(item) {
    if (typeof item === 'string' && (item.includes('{{') || item.includes('{%'))) return true;else return false;
  }

  haSwitch(option, templateWarn, editorWarn, text, title, checked) {
    const templateIcon = html(_templateObject9(), localize('editor.disabled_template'));
    const editorWarning = html(_templateObject10(), localize('editor.removes_edit_ui'));
    return html(_templateObject11(), this.exception && this.config[option] === undefined ? 'inherited slotted' : 'slotted', this.getConfig(option) !== false && !this.templateExists(this.getConfig(option)), option, this._valueChanged, title, this.templateExists(this.getConfig(option)), text, this.templateExists(this.getConfig(option)) && templateWarn ? templateIcon : '', editorWarn ? editorWarning : '');
  }

  render() {
    this.exception = this.exception !== undefined && this.exception !== false;
    return html(_templateObject12(), !this.exception ? html(_templateObject13(), localize('links.docs'), localize('links.forums'), this.getConfig('editor_warnings') ? html(_templateObject14(), localize('editor.warning_disable_ch'), localize('editor.warning_raw_editor_reload'), localize('editor.warning_allready_a_template'), localize('editor.warning_edit_ui'), localize('editor.warning_jinja_info')) : '', !this.exception && this.getConfig('editor_warnings') ? this.haSwitch('editor_warnings', false, false, localize('editor.editor_warnings_title'), localize('editor.editor_warnings_tip')) : '') : '', this.renderStyle(), this.getConfig('editor_warnings') && !this.exception ? html(_templateObject15()) : '', this.haSwitch('disabled_mode', true, false, localize('editor.disabled_mode_title'), localize('editor.disabled_mode_tip')), this.haSwitch('footer_mode', true, false, localize('editor.footer_mode_title'), localize('editor.footer_mode_tip')), this.haSwitch('compact_mode', true, false, localize('editor.compact_mode_title'), localize('editor.compact_mode_tip')), this.haSwitch('split_mode', true, false, localize('editor.split_mode_title'), localize('editor.split_mode_tip')), this.haSwitch('kiosk_mode', true, true, localize('editor.kiosk_mode_title'), localize('editor.kiosk_mode_tip')), this.haSwitch('disable_sidebar', true, false, localize('editor.disable_sidebar_title'), localize('editor.disable_sidebar_tip')), this.haSwitch('hide_header', true, false, localize('editor.hide_header_title'), localize('editor.hide_header_tip')), this.haSwitch('chevrons', true, false, localize('editor.chevrons_title'), localize('editor.chevrons_tip')), this.haSwitch('hidden_tab_redirect', true, false, localize('editor.hidden_tab_redirect_title'), localize('editor.hidden_tab_redirect_tip')), this.haSwitch('shadow', true, false, localize('editor.shadow_title'), localize('editor.shadow_tip')), !this.exception && !this.getConfig('editor_warnings') ? this.haSwitch('editor_warnings', false, false, localize('editor.editor_warnings_second_title'), localize('editor.editor_warnings_tip')) : '', this.exception && this.config.header_text === undefined ? 'inherited slotted' : 'slotted', localize('editor.header_text'), this.getConfig('header_text'), 'header_text', this._valueChanged, localize('editor.automatic'), this.exception && this.config.locale === undefined ? 'inherited slotted' : 'slotted', localize('editor.locale_desc'), this.getConfig('locale'), 'locale', this._valueChanged, localize('editor.menu_items'), this.haSwitch('hide_config', true, true, localize('editor.hide_configure_ui_title'), localize('editor.hide_configure_ui_tip')), this.haSwitch('hide_raw', true, true, localize('editor.hide_raw_editor_title'), localize('editor.hide_raw_editor_tip')), this.haSwitch('hide_help', true, false, localize('editor.hide_help_title'), localize('editor.hide_help_tip')), this.haSwitch('hide_unused', true, false, localize('editor.hide_unused_title'), localize('editor.hide_unused_tip')), localize('editor.buttons'), this.haSwitch('menu_hide', true, false, localize('editor.menu_hide_title'), localize('editor.menu_hide_tip')), this.haSwitch('menu_dropdown', true, false, localize('editor.menu_dropdown_title'), localize('editor.menu_dropdown_tip')), this.haSwitch('voice_hide', true, false, localize('editor.voice_hide_title'), localize('editor.voice_hide_tip')), this.haSwitch('voice_dropdown', true, false, localize('editor.voice_dropdown_title'), localize('editor.voice_dropdown_tip')), this.haSwitch('options_hide', true, true, localize('editor.options_hide_title'), localize('editor.options_hide_tip')), this.haSwitch('reverse_button_direction', true, false, localize('editor.reverse_button_title'), localize('editor.reverse_button_tip')), localize('editor.tabs'), this._tabVisibility, this.getConfig('show_tabs').length > 0 ? '1' : '0', localize('editor.tabs_hide'), localize('editor.tabs_show'), this.getConfig('show_tabs').length > 0 ? 'initial' : 'none', this.exception && this.config.show_tabs === undefined ? 'inherited slotted' : 'slotted', localize('editor.show_tab_list'), this.getConfig('show_tabs'), 'show_tabs', this._valueChanged, this.getConfig('show_tabs').length > 0 ? 'none' : 'initial', this.exception && this.config.hide_tabs === undefined ? 'inherited slotted' : 'slotted', localize('editor.hide_tab_list'), this.getConfig('hide_tabs'), 'hide_tabs', this._valueChanged, this.exception && this.config.default_tab === undefined ? 'inherited slotted' : 'slotted', localize('editor.default_tab'), this.getConfig('default_tab'), 'default_tab', this._valueChanged, this.haSwitch('reverse_tab_direction', true, false, localize('editor.reverse_tab_title'), localize('editor.reverse_tab_tip')));
  }

  _toggleCard() {
    this._closed = !this._closed;
    A(this, 'iron-resize');
  }

  _tabVisibility() {
    const show = this.shadowRoot.querySelector('#show');
    const hide = this.shadowRoot.querySelector('#hide');

    if (this.shadowRoot.querySelector('#tabs').value == 'Hide Tabs') {
      show.style.display = 'none';
      hide.style.display = 'initial';
    } else {
      hide.style.display = 'none';
      show.style.display = 'initial';
    }
  }

  _valueChanged(ev) {
    if (!this.config) return;

    if (ev.target.configValue) {
      if (ev.target.value === '') {
        delete this.config[ev.target.configValue];
      } else {
        this.config = _objectSpread2({}, this.config, {
          [ev.target.configValue]: ev.target.checked !== undefined ? ev.target.checked : ev.target.value
        });
      }
    }

    A(this, 'ch-config-changed', {
      config: this.config
    });
  }

  renderStyle() {
    return html(_templateObject16());
  }

}

customElements.define('ch-config-editor', ChConfigEditor);

class ChExceptionEditor extends LitElement {
  static get properties() {
    return {
      config: {},
      exception: {},
      _closed: {}
    };
  }

  constructor() {
    super();
    this._closed = true;
  }

  render() {
    if (!this.exception) {
      return html(_templateObject17());
    }

    return html(_templateObject18(), this.renderStyle(), this._closed, Object.values(this.exception.conditions).join(', ').substring(0, 40) || 'New Exception', this._closed ? 'mdi:chevron-down' : 'mdi:chevron-up', this._toggleCard, this._closed, this._deleteException, localize('editor.conditions'), this.exception.conditions, this._conditionsChanged, localize('editor.config'), _objectSpread2({}, defaultConfig, {}, this.config), this.exception.config, this._configChanged);
  }

  renderStyle() {
    return html(_templateObject19());
  }

  _toggleCard() {
    this._closed = !this._closed;
    A(this, 'iron-resize');
  }

  _deleteException() {
    A(this, 'ch-exception-delete');
  }

  _conditionsChanged(_ref2) {
    let {
      detail
    } = _ref2;
    if (!this.exception) return;

    const newException = _objectSpread2({}, this.exception, {
      conditions: detail.conditions
    });

    A(this, 'ch-exception-changed', {
      exception: newException
    });
  }

  _configChanged(ev) {
    ev.stopPropagation();
    if (!this.exception) return;

    const newException = _objectSpread2({}, this.exception, {
      config: ev.detail.config
    });

    A(this, 'ch-exception-changed', {
      exception: newException
    });
  }

}

customElements.define('ch-exception-editor', ChExceptionEditor);

class ChConditionsEditor extends LitElement {
  static get properties() {
    return {
      conditions: {}
    };
  }

  get _user() {
    return this.conditions.user || '';
  }

  get _user_agent() {
    return this.conditions.user_agent || '';
  }

  get _media_query() {
    return this.conditions.media_query || '';
  }

  get _query_string() {
    return this.conditions.query_string || '';
  }

  render() {
    if (!this.conditions) return html(_templateObject20());
    return html(_templateObject21(), localize('editor.user_list'), this._user, 'user', this._valueChanged, localize('editor.user_agent'), this._user_agent, 'user_agent', this._valueChanged, localize('editor.media_query'), this._media_query, 'media_query', this._valueChanged, localize('editor.query_string'), this._query_string, 'query_string', this._valueChanged);
  }

  _valueChanged(ev) {
    if (!this.conditions) return;
    const target = ev.target;
    if (this["_".concat(target.configValue)] === target.value) return;

    if (target.configValue) {
      if (target.value === '') {
        delete this.conditions[target.configValue];
      } else {
        this.conditions = _objectSpread2({}, this.conditions, {
          [target.configValue]: target.value
        });
      }
    }

    A(this, 'ch-conditions-changed', {
      conditions: this.conditions
    });
  }

}

customElements.define('ch-conditions-editor', ChConditionsEditor);

const hideMenuItems = (config, header, editMode) => {
  const localized = (item, string) => {
    let localString;
    const hass = document.querySelector('home-assistant').hass;
    if (string === 'raw_editor') localString = hass.localize('ui.panel.lovelace.editor.menu.raw_editor');else if (string == 'unused_entities') localString = hass.localize('ui.panel.lovelace.unused_entities.title');else localString = hass.localize("ui.panel.lovelace.menu.".concat(string));
    return item.innerHTML.includes(localString) || item.getAttribute('aria-label') == localString;
  };

  (!editMode ? header.options : document.querySelector('home-assistant').shadowRoot.querySelector('home-assistant-main').shadowRoot.querySelector('ha-panel-lovelace').shadowRoot.querySelector('hui-root').shadowRoot.querySelector('app-toolbar > paper-menu-button')).querySelector('paper-listbox').querySelectorAll('paper-item').forEach(item => {
    if (config.hide_help && localized(item, 'help') || config.hide_unused && localized(item, 'unused_entities') || config.hide_refresh && localized(item, 'refresh') || config.hide_config && localized(item, 'configure_ui') || config.hide_raw && localized(item, 'raw_editor')) {
      item.style.display = 'none';
    } else {
      item.style.display = '';
    }
  });
}; // Add button to overflow menu.

const buttonToOverflow = (item, mdiIcon, header, config) => {
  if (header.options.querySelector("#".concat(item.toLowerCase(), "_dropdown"))) {
    header.options.querySelector("#".concat(item.toLowerCase(), "_dropdown")).remove();
  }

  const paperItem = document.createElement('paper-item');
  const icon = document.createElement('ha-icon');
  paperItem.setAttribute('id', "".concat(item.toLowerCase(), "_dropdown"));
  icon.setAttribute('icon', config.button_icons[item.toLowerCase()] || mdiIcon);
  icon.style.pointerEvents = 'none';
  if (config.reverse_button_direction) icon.style.marginLeft = 'auto';else icon.style.marginRight = 'auto';
  paperItem.innerText = item;
  paperItem.appendChild(icon);
  paperItem.addEventListener('click', () => {
    header[item.toLowerCase()].dispatchEvent(new MouseEvent('click', {
      bubbles: false,
      cancelable: false
    }));
  });
  icon.addEventListener('click', () => {
    header[item.toLowerCase()].dispatchEvent(new MouseEvent('click', {
      bubbles: false,
      cancelable: false
    }));
  });
  header.options.querySelector('paper-listbox').appendChild(paperItem);
};

const showEditor = () => {
  window.scrollTo(0, 0);

  if (!root.querySelector('ha-app-layout editor')) {
    const container = document.createElement('editor');
    const nest = document.createElement('div');
    nest.style.cssText = "\n      padding: 20px;\n      max-width: 600px;\n      margin: 15px auto;\n      background: var(--paper-card-background-color);\n      border: 6px solid var(--paper-card-background-color);\n    ";
    container.style.cssText = "\n      width: 100%;\n      min-height: 100%;\n      box-sizing: border-box;\n      position: absolute;\n      background: var(--background-color, grey);\n      z-index: 2;\n      padding: 5px;\n    ";
    root.querySelector('ha-app-layout').insertBefore(container, root.querySelector('#view'));
    container.appendChild(nest);
    nest.appendChild(document.createElement('custom-header-editor'));
  }
};

const insertSettings = () => {
  function insertAfter(el, referenceNode) {
    referenceNode.parentNode.insertBefore(el, referenceNode.nextSibling);
  }

  if (lovelace.mode === 'storage') {
    const chSettings = document.createElement('paper-item');
    chSettings.setAttribute('id', 'ch_settings');
    chSettings.addEventListener('click', () => showEditor());
    chSettings.innerHTML = 'Custom Header';
    const paperItems = header.options.querySelector('paper-listbox').querySelectorAll('paper-item');
    const paperItemsHA = haElem.options.querySelector('paper-listbox').querySelectorAll('paper-item');

    if (!header.options.querySelector('paper-listbox').querySelector('#ch_settings')) {
      insertAfter(chSettings, paperItems[paperItems.length - 1]);
    }

    if (!haElem.options.querySelector('paper-listbox').querySelector('#ch_settings')) {
      insertAfter(chSettings, paperItemsHA[paperItemsHA.length - 1]);
    }
  }
};

const kioskMode = (sidebarOnly, headerOnly) => {
  if (window.location.href.includes('disable_ch')) return; // Kiosk mode styling.

  let style = document.createElement('style');
  style.setAttribute('id', 'ch_header_style');

  if (!headerOnly) {
    style.innerHTML += "\n        #drawer {\n          display: none;\n        }\n      ";
  }

  if (!sidebarOnly) {
    style.innerHTML += "\n        ch-header {\n          display: none;\n        }\n        ch-header-bottom {\n          display: none;\n        }\n        app-header {\n          display: none;\n        }\n        hui-view {\n          padding-top: 100px;\n        }\n        hui-view, hui-panel-view {\n          min-height: calc(100vh + 96px);\n          margin-top: -96px;\n          margin-bottom: -16px;\n        }\n      ";
  } // Add updated styles only if changed.


  const oldStyle = root.querySelector('#ch_header_style');

  if (!oldStyle || oldStyle.innerText != style.innerHTML) {
    root.appendChild(style);
    if (oldStyle) oldStyle.remove();
  }

  if (!headerOnly) {
    haElem.drawer.style.display = 'none'; // Style sidebar to close immediately and prevent opening.

    if (!haElem.sidebar.main.shadowRoot.querySelector('#ch_sidebar_style')) {
      style = document.createElement('style');
      style.setAttribute('id', 'ch_sidebar_style');
      style.innerHTML = ':host(:not([expanded])) {width: 0px !important;}';
      haElem.sidebar.main.shadowRoot.appendChild(style);
    }

    if (!haElem.main.shadowRoot.querySelector('#ch_sidebar_style')) {
      style = document.createElement('style');
      style.setAttribute('id', 'ch_sidebar_style');
      style.innerHTML = ':host {--app-drawer-width: 0px !important;}';
      haElem.main.shadowRoot.appendChild(style);
    }
  }

  window.dispatchEvent(new Event('resize'));
};
const removeKioskMode = () => {
  haElem.drawer.style.display = '';
  let style = haElem.main.shadowRoot.querySelector('#ch_sidebar_style');
  if (style) style.remove();
  style = haElem.sidebar.main.shadowRoot.querySelector('#ch_sidebar_style');
  if (style) style.remove();
  haElem.drawer.style.display = '';
};

const menuButtonObservers = (config, header) => {
  if (config.menu_hide) return; // Create Notification Dot

  const buildDot = () => {
    const dot = document.createElement('div');
    dot.className = 'dot';
    dot.style.cssText = "\n        pointer-events: none;\n        position: relative;\n        background-color: ".concat(config.notification_dot_color, ";\n        width: 12px;\n        height: 12px;\n        top: -28px;\n        right: ").concat(config.reverse_button_direction ? '' : '-', "16px;\n        border-radius: 50%;\n    ");
    return dot;
  };

  const menuButtonVisibility = () => {
    if (config.disable_sidebar || window.customHeaderDisabled) return;
    if (haElem.menu.style.visibility === 'hidden') header.menu.style.display = 'none';else header.menu.style.display = 'initial';
  };

  const notificationDot = mutations => {
    const root = document.querySelector('home-assistant').shadowRoot.querySelector('home-assistant-main').shadowRoot.querySelector('ha-panel-lovelace').shadowRoot.querySelector('hui-root');
    mutations.forEach((_ref) => {
      let {
        addedNodes,
        removedNodes
      } = _ref;

      if (addedNodes) {
        for (const node of addedNodes) {
          if (node.className === 'dot' && !root.shadowRoot.querySelector('[buttonElem="menu"]').shadowRoot.querySelector('.dot')) {
            root.shadowRoot.querySelector('[buttonElem="menu"]').shadowRoot.appendChild(buildDot());

            if (root.shadowRoot.querySelector('[buttonElem="menu"]').shadowRoot.querySelector('.buttonText')) {
              root.shadowRoot.querySelector('[buttonElem="menu"]').shadowRoot.querySelector('.dot').style.display = 'none';
              root.shadowRoot.querySelector('[buttonElem="menu"]').shadowRoot.querySelector('.buttonText').style.borderBottom = "3px solid ".concat(window.customHeaderConfig.notification_dot_color);
            }
          }
        }
      }

      if (removedNodes) {
        for (const node of removedNodes) {
          if (node.className === 'dot' && root.shadowRoot.querySelector('[buttonElem="menu"]').shadowRoot.querySelector('.dot')) {
            root.shadowRoot.querySelector('[buttonElem="menu"]').shadowRoot.querySelector('.dot').remove();

            if (root.shadowRoot.querySelector('[buttonElem="menu"]').shadowRoot.querySelector('.buttonText')) {
              root.shadowRoot.querySelector('[buttonElem="menu"]').shadowRoot.querySelector('.buttonText').style.borderBottom = '';
            }
          }
        }
      }
    });
  };

  if (!window.customHeaderMenuObserver) {
    window.customHeaderMenuObserver = true;
    const notificationObserver = new MutationObserver(notificationDot);
    notificationObserver.observe(haElem.menu.shadowRoot, {
      childList: true
    });
    const menuButtonObserver = new MutationObserver(menuButtonVisibility);
    menuButtonObserver.observe(haElem.menu, {
      attributes: true,
      attributeFilter: ['style']
    });
  }

  menuButtonVisibility();
  const prevDot = header.menu.shadowRoot.querySelector('.dot');

  if (prevDot && prevDot.style.cssText != buildDot().style.cssText) {
    prevDot.remove();

    if (config.button_text.menu) {
      header.menu.shadowRoot.querySelector('.buttonText').style.textDecoration = '';
    }
  }

  if (!header.menu.shadowRoot.querySelector('.dot') && haElem.menu.shadowRoot.querySelector('.dot')) {
    header.menu.shadowRoot.appendChild(buildDot());

    if (config.button_text.menu) {
      header.menu.shadowRoot.querySelector('.dot').style.display = 'none';
      header.menu.shadowRoot.querySelector('.buttonText').style.borderBottom = "3px solid ".concat(config.notification_dot_color);
    }
  }
};

const insertStyleTags = config => {
  let headerHeight = 48;
  const headerType = config.split_mode ? header.bottom : header;

  if (!config.compact_mode) {
    if (config.reverse_button_direction) {
      header.container.querySelector('#contentContainer').dir = 'ltr';
      header.container.querySelector('#contentContainer').style.textAlign = 'right';
    } else {
      header.container.querySelector('#contentContainer').style.textAlign = '';
      header.container.querySelector('#contentContainer').dir = '';
    }

    header.container.querySelector('#contentContainer').innerHTML = config.header_text;
    headerHeight = headerType.tabs.length ? 96 : 48;
  } // Build header's main style.


  let style = document.createElement('style');
  style.setAttribute('id', 'ch_header_style');
  style.innerHTML = "\n      ch-header {\n        padding-left: 10px;\n        padding-right: 10px;\n        box-sizing: border-box;\n        display:flex;\n        justify-content: center;\n        font: 400 20px Roboto, sans-serif;\n        background: ".concat(config.background || 'var(--primary-color)', ";\n        color: ").concat(config.elements_color || 'var(--text-primary-color)', ";\n        margin-bottom: 0px;\n        margin-top: ").concat(config.footer_mode ? '4px;' : '0px', ";\n        position: sticky;\n        position: -webkit-sticky;\n        ").concat(config.footer_mode ? 'z-index: 99; bottom: 0px;' : 'top: 0px;', "\n        ").concat(config.header_css ? config.header_css : '', "\n        transition: box-shadow 0.3s ease-in-out;\n        ").concat(config.shadow && (config.footer_mode || config.split_mode) ? 'box-shadow: 0px 0px 5px 5px rgba(0,0,0,0.2)' : '', "\n      }\n      ch-header-bottom {\n        z-index: 99;\n        padding-left: 10px;\n        padding-right: 10px;\n        box-sizing: border-box;\n        display:flex;\n        justify-content: center;\n        font: 400 20px Roboto, sans-serif;\n        background: ").concat(config.background || 'var(--primary-color)', ";\n        color: ").concat(config.elements_color || 'var(--text-primary-color)', ";\n        margin-bottom: 0px;\n        margin-top: 0px;\n        position: sticky;\n        position: -webkit-sticky;\n        ").concat(config.footer_mode ? 'top: 0px;' : 'bottom: 0px;', "\n        ").concat(config.header_css ? config.header_css : '', "\n        ").concat(config.shadow ? 'box-shadow: 0px 0px 5px 5px rgba(0,0,0,0.2)' : '', "\n      }\n      ch-stack {\n        flex-direction: column;\n        width: 100%;\n        margin-left: 9px;\n        margin-right: 9px;\n        ").concat(config.stack_css ? config.stack_css : '', "\n      }\n      ch-stack-bottom {\n        flex-direction: column;\n        width: 100%;\n        margin-left: 9px;\n        margin-right: 9px;\n        ").concat(config.stack_css ? config.stack_css : '', "\n      }\n      #contentContainer {\n        padding: 12px 6px 12px 6px;\n        ").concat(config.compact_mode ? 'display: none;' : '', "\n        ").concat(config.header_text.includes('<br>') ? "\n          font-size: 17px;\n          line-height: 1.2;\n          margin: -9px 0px 0px;\n        " : '', "\n        ").concat(config.header_text_css ? config.header_text_css : '', "\n\n      }\n      app-header {\n        display: none;\n      }\n      paper-tab.iron-selected {\n        ").concat(config.active_tab_color ? "color: ".concat(config.active_tab_color, ";") : '', "\n        ").concat(config.active_tab_css ? config.active_tab_css : '', "\n      }\n      [buttonElem=\"menu\"] {\n        ").concat(config.menu_color ? "color: ".concat(config.menu_color, ";") : '', "\n        ").concat(config.menu_hide ? "display: none;" : '', "\n        ").concat(config.menu_css ? config.menu_css : '', "\n        ").concat(config.footer_mode && config.compact_mode ? 'margin-top:0 !important;' : '', "\n      }\n      [buttonElem=\"options\"] {\n        ").concat(config.options_color ? "color: ".concat(config.options_color, ";") : '', "\n        ").concat(config.options_hide ? "display: none;" : '', "\n        ").concat(config.options_css ? config.options_css : '', "\n        ").concat(config.footer_mode && config.compact_mode ? 'margin-top:0 !important;' : '', "\n      }\n      [buttonElem=\"voice\"] {\n        ").concat(config.voice_color ? "color: ".concat(config.voice_color, ";") : '', "\n        ").concat(config.voice_hide ? "display: none;" : '', "\n        ").concat(config.voice_css ? config.voice_css : '', "\n        ").concat(config.footer_mode && config.compact_mode ? 'margin-top:0 !important;' : '', "\n      }\n      paper-tab {\n        ").concat(config.all_tabs_color ? "color: ".concat(config.all_tabs_color, ";") : '', "\n        ").concat(config.all_tabs_css ? config.all_tabs_css : '', "\n      }\n      paper-tabs {\n        ").concat(config.tab_indicator_color ? "--paper-tabs-selection-bar-color: ".concat(config.tab_indicator_color, " !important;") : '', "\n        ").concat(config.tab_container_css ? config.tab_container_css : '', "\n      }\n    "); // Add per tab coloring.

  if (config.tabs_color) {
    Object.keys(config.tabs_color).forEach(tab => {
      style.innerHTML += "\n        paper-tab:nth-child(".concat(tabIndexByName(tab) + 1, ") {\n          color: ").concat(config.tabs_color[tab], ";\n        }\n      ");
    });
  } // Add per tab hiding.


  if (config.hide_tabs) {
    config.hide_tabs.forEach(tab => {
      style.innerHTML += "\n        paper-tab:nth-child(".concat(tabIndexByName(tab) + 1, ") {\n          display: none;\n        }\n      ");
    });
  } // Add per tab custom css.


  if (config.tabs_css) {
    Object.keys(config.tabs_css).forEach(tab => {
      style.innerHTML += "\n        paper-tab:nth-child(".concat(tabIndexByName(tab) + 1, ") {\n          ").concat(config.tabs_css[tab], ";\n        }\n      ");
    });
  } // Add updated style element and remove old one after.
  // This prevents elements "flashing" when styles change.


  let currentStyle = root.querySelector('#ch_header_style');
  root.appendChild(style);
  if (currentStyle) currentStyle.remove(); // Style views elements.

  style = document.createElement('style');
  style.setAttribute('id', 'ch_view_style');
  style.innerHTML = "\n        hui-view, hui-panel-view {\n          margin-top: -96px;\n          ".concat(config.compact_mode ? 'min-height: calc(100vh - 96px);' : 'min-height: calc(100vh - 112px);', "\n          ").concat(config.footer_mode && !config.split_mode ? "padding-bottom: ".concat(headerHeight, "px;") : '', "\n          ").concat(config.footer_mode && !config.split_mode ? "margin-bottom: -".concat(headerHeight + 4, "px;") : '', "\n          ").concat(config.split_mode ? "padding-bottom: 48px;" : '', "\n          ").concat(config.split_mode && config.footer_mode ? "margin-bottom: -4px;" : '', "\n        }\n        hui-panel-view {\n          padding-top: 96px;\n          ").concat(config.panel_view_css ? config.panel_view_css : '', "\n        }\n        hui-view {\n          padding-top: 100px;\n          ").concat(config.view_css ? config.view_css : '', "\n        }\n        #view {\n          min-height: calc(100vh - 96px) !important;\n          ").concat(config.footer_mode && !config.split_mode ? "min-height: calc(100vh - ".concat(headerHeight, "px) !important;") : '', "\n          ").concat(config.compact_mode && !config.footer_mode ? "min-height: calc(100vh - ".concat(headerHeight, "px) !important;") : '', "\n          ").concat(config.split_mode ? "min-height: calc(100vh - 48px) !important; margin-bottom: -48px;" : '', "\n          ").concat(config.split_mode && config.footer_mode ? 'min-height: calc(100vh - 52px) !important; margin-bottom: -48px;' : '', "\n        }\n      "); // Add updated view style if changed.
  // Prevents background images flashing on every change.

  currentStyle = root.querySelector('#ch_view_style');

  if (!currentStyle || style.innerHTML != currentStyle.innerHTML) {
    root.appendChild(style);
    if (currentStyle) currentStyle.remove();
  } // Hide cheverons completely when not visible.


  style = document.createElement('style');
  style.setAttribute('id', 'ch_chevron');
  style.innerHTML = "\n      .not-visible[icon*=\"chevron\"] {\n        display:none;\n      }\n    "; // Add updated style element and remove old one after.

  currentStyle = headerType.tabContainer.shadowRoot.querySelector('#ch_chevron');
  headerType.tabContainer.shadowRoot.appendChild(style);
  if (currentStyle) currentStyle.remove();
  currentStyle = header.bottom.querySelector('paper-tabs').shadowRoot.querySelector('#ch_chevron');
  header.bottom.querySelector('paper-tabs').shadowRoot.appendChild(style.cloneNode(true));
  if (currentStyle) currentStyle.remove();
  style = document.createElement('style');
  style.setAttribute('id', 'ch_animated');
  style.innerHTML = "\n    ch-header, [buttonElem=\"menu\"], [buttonElem=\"options\"], [buttonElem=\"voice\"] {\n      transition: margin-top 0.4s ease-in-out;\n      transition: top 0.4s ease-in-out;\n    }\n  ";
  setTimeout(() => {
    if (!root.querySelector('#ch_animated')) root.appendChild(style);
  }, 1000);
};

const selectTab = config => {
  const headerType = config.split_mode ? header.bottom : header;
  if (!haElem.tabContainer || !headerType.tabContainer) return;
  const haActiveTabIndex = haElem.tabContainer.indexOf(root.querySelector('paper-tab.iron-selected'));
  headerType.tabContainer.setAttribute('selected', haActiveTabIndex);
  if (!headerType.tabs[haActiveTabIndex]) return;
  const tab = headerType.tabs[haActiveTabIndex].getBoundingClientRect();
  const lastTab = headerType.tabs[headerType.tabs.length - 1].getBoundingClientRect();
  const container = headerType.tabContainer.shadowRoot.querySelector('#tabsContainer').getBoundingClientRect();

  if (container.right < tab.right || container.left > tab.left) {
    headerType.tabContainer._scrollToLeft();

    headerType.tabContainer._scrollToRight();

    headerType.tabs[haActiveTabIndex].dispatchEvent(new MouseEvent('click', {
      bubbles: false,
      cancelable: false
    }));
    if (lastTab.right > container.right) headerType.tabContainer._scrollToRight();
  }
};
const observers = () => {
  const callback = mutations => {
    const config = window.customHeaderConfig;
    const headerType = config.split_mode ? header.bottom : header;
    mutations.forEach((_ref) => {
      let {
        addedNodes,
        target
      } = _ref;

      if (mutations.length && mutations[0].target.nodeName == 'HTML') {
        buildConfig();
        mutations = [];
      }

      if (target.id == 'view' && addedNodes.length && headerType.tabs.length) {
        // Navigating to new tab/view.
        setTimeout(() => selectTab(config), 200);
      } else if (addedNodes.length && target.nodeName == 'PARTIAL-PANEL-RESOLVER') {
        // When returning to lovelace/overview from elsewhere in HA.
        if (haElem.main.shadowRoot.querySelector(' ha-panel-lovelace')) {
          if (config.compact_mode && !config.footer_mode) {
            haElem.sidebar.main.shadowRoot.querySelector('.menu').style = 'height:49px;';
            haElem.sidebar.main.shadowRoot.querySelector('paper-listbox').style = 'height:calc(100% - 175px);';
            haElem.sidebar.main.shadowRoot.querySelector('div.divider').style = '';
          } else if (config.footer_mode && !config.split_mode) {
            haElem.sidebar.main.shadowRoot.querySelector('.menu').style = '';
            haElem.sidebar.main.shadowRoot.querySelector('paper-listbox').style = 'height: calc(100% - 170px);';
            haElem.sidebar.main.shadowRoot.querySelector('div.divider').style = 'margin-bottom: -10px;';
          } else if (config.split_mode) {
            haElem.sidebar.main.shadowRoot.querySelector('.menu').style = 'height:49px;';
            haElem.sidebar.main.shadowRoot.querySelector('paper-listbox').style = 'height: calc(100% - 170px);';
            haElem.sidebar.main.shadowRoot.querySelector('div.divider').style = 'margin-bottom: -3px;';
          }
        } else {
          haElem.sidebar.main.shadowRoot.querySelector('.menu').style = '';
          haElem.sidebar.main.shadowRoot.querySelector('paper-listbox').style = '';
          haElem.sidebar.main.shadowRoot.querySelector('div.divider').style = '';
        }

        if (root.querySelector('editor')) root.querySelector('editor').remove();
      } else if (target.className === 'edit-mode' && addedNodes.length) {
        // Entered edit mode.
        if (root.querySelector('editor')) root.querySelector('editor').remove();
        if (!window.customHeaderDisabled) hideMenuItems(config, header, true);
        header.menu.style.display = 'none';
        root.querySelector('ch-header').style.display = 'none';
        haElem.appHeader.style.display = 'block';
        if (root.querySelector('#ch_view_style')) root.querySelector('#ch_view_style').remove();
        if (root.querySelector('#ch_header_style')) root.querySelector('#ch_header_style').remove();
        if (root.querySelector('#ch_animated')) root.querySelector('#ch_animated').remove();
      } else if (target.nodeName === 'APP-HEADER' && addedNodes.length) {
        // Exited edit mode.
        insertStyleTags(config);
        haElem.menu = haElem.appHeader.querySelector('ha-menu-button');
        haElem.appHeader.style.display = 'none';
        header.menu.style.display = '';
        root.querySelector('ch-header').style.display = '';
      }
    });
  };

  const observer = new MutationObserver(callback);
  observer.observe(haElem.partialPanelResolver, {
    childList: true
  });
  observer.observe(haElem.appHeader, {
    childList: true
  });
  observer.observe(root.querySelector('#view'), {
    childList: true
  });
  observer.observe(document.querySelector('html'), {
    attributes: true
  });
};

const redirects = (config, header) => {
  // Change link of "overview" item in sidebar to a visible tab or default tab.
  const headerType = config.split_mode ? header.bottom : header;
  const overview = haElem.sidebar.listbox.querySelector('[data-panel="lovelace"]');

  if (config.hide_tabs.includes(0) && !config.default_tab) {
    for (const tab of headerType.tabs) {
      if (getComputedStyle(tab).display != 'none') {
        overview.setAttribute('href', "/lovelace/".concat(headerType.tabContainer.indexOf(tab)));
        break;
      }
    }
  } else if (config.default_tab) {
    overview.setAttribute('href', "/lovelace/".concat(tabIndexByName(config.default_tab)));
  } // Redirect off hidden tab to first not hidden tab or default tab.


  const defaultTab = config.default_tab != undefined ? tabIndexByName(config.default_tab) : null;

  if (config.hidden_tab_redirect && haElem.tabs.length) {
    const activeTab = haElem.tabContainer.indexOf(haElem.tabContainer.querySelector('paper-tab.iron-selected'));

    if (config.hide_tabs.includes(activeTab) && config.hide_tabs.length != haElem.tabs.length) {
      if (defaultTab && !config.hide_tabs.includes(tabIndexByName(defaultTab))) {
        if (getComputedStyle(headerType.tabs[defaultTab]).display != 'none') {
          haElem.tabs[defaultTab].dispatchEvent(new MouseEvent('click', {
            bubbles: false,
            cancelable: false
          }));
          overview.setAttribute('href', "/lovelace/".concat(defaultTab));
        }
      } else {
        for (const tab of headerType.tabs) {
          if (getComputedStyle(tab).display != 'none') {
            tab.dispatchEvent(new MouseEvent('click', {
              bubbles: false,
              cancelable: false
            }));
            overview.setAttribute('href', "/lovelace/".concat(headerType.tabContainer.indexOf(tab)));
            break;
          }
        }
      }
    }
  }

  let reloaded;

  if (!config.default_tab_on_refresh && window.performance) {
    reloaded = performance.navigation.type == 0;
  } else if (!config.default_tab_on_refresh && performance.getEntriesByType('navigation')) {
    reloaded = performance.getEntriesByType('navigation')[0].type == 'reload';
  } else {
    reloaded = false;
  } // Click default tab on first open.


  if (!reloaded && defaultTab != null && !window.customHeaderDefaultClicked && haElem.tabs[defaultTab]) {
    haElem.tabs[defaultTab].dispatchEvent(new MouseEvent('click', {
      bubbles: false,
      cancelable: false
    }));
    window.customHeaderDefaultClicked = true;
  }
};

const styleHeader = config => {
  insertSettings();
  if (window.location.href.includes('disable_ch')) config.disabled_mode = true;

  if (config.disabled_mode) {
    window.customHeaderDisabled = true;
    removeKioskMode();
    if (header.container) header.container.style.visibility = 'hidden';
    if (root.querySelector('#ch_header_style')) root.querySelector('#ch_header_style').remove();
    if (root.querySelector('#ch_view_style')) root.querySelector('#ch_view_style').remove();

    if (header.tabContainer.shadowRoot.querySelector('#ch_chevron')) {
      header.tabContainer.shadowRoot.querySelector('#ch_chevron').remove();
      header.bottom.tabContainer.shadowRoot.querySelector('#ch_chevron').remove();
    }

    header.menu.style.display = 'none';
    root.querySelector('ha-menu-button').style.display = '';
    haElem.sidebar.main.shadowRoot.querySelector('.menu').style = '';
    haElem.sidebar.main.shadowRoot.querySelector('paper-listbox').style = '';
    haElem.sidebar.main.shadowRoot.querySelector('div.divider').style = '';
    window.dispatchEvent(new Event('resize'));
    return;
  } else {
    window.customHeaderDisabled = false;
    hideMenuItems(config, header, false);
    header.menu.style.display = '';
    if (header.container) header.container.style.visibility = 'visible';
    insertSettings();
  }

  if (!root.querySelector('ch-header-bottom').querySelector('paper-tabs')) {
    header.bottom.appendChild(header.tabContainer.cloneNode(true));
    header.bottom.tabContainer = root.querySelector('ch-header-bottom').querySelector('paper-tabs');
    header.bottom.tabs = header.bottom.tabContainer.querySelectorAll('paper-tab');
  }

  haElem.tabs.forEach(tab => {
    const index = haElem.tabs.indexOf(tab);
    header.bottom.tabs[index].addEventListener('click', () => {
      haElem.tabs[index].dispatchEvent(new MouseEvent('click', {
        bubbles: false,
        cancelable: false
      }));
    });
  });

  if (config.split_mode) {
    header.tabContainer.style.display = 'none';
    config.compact_mode = false;
    if (config.footer_mode) header.bottom.setAttribute('slot', 'header');else header.bottom.setAttribute('slot', '');
  } else {
    header.bottom.style.display = 'none';
  }

  const headerType = config.split_mode ? header.bottom : header;
  if (!config.split_mode) header.bottom.style.display = 'none';
  if (!header.tabs.length) config.compact_mode = false;
  if (config.menu_dropdown && !config.disable_sidebar) buttonToOverflow('Menu', 'mdi:menu', header, config);else if (header.options.querySelector("#menu_dropdown")) header.options.querySelector("#menu_dropdown").remove();
  if (config.voice_dropdown) buttonToOverflow('Voice', 'mdi:microphone', header, config);else if (header.options.querySelector("#voice_dropdown")) header.options.querySelector("#voice_dropdown").remove(); // Style overflow menu depending on position.

  if (config.reverse_button_direction) {
    header.options.setAttribute('horizontal-align', 'left');
    header.options.querySelector('paper-listbox').setAttribute('dir', 'ltr');
  } else {
    header.options.setAttribute('horizontal-align', 'right');
    header.options.querySelector('paper-listbox').setAttribute('dir', 'rtl');
  }

  const style = document.createElement('style');
  style.setAttribute('id', 'ch_header_style');
  style.innerHTML = "\n    .menu, paper-listbox {\n      transition: height 0.1s ease-in-out 0s;\n    }\n    .divider {\n      transition: margin-bottom 0.1s ease-in-out 0s;\n    }\n  ";
  haElem.sidebar.main.shadowRoot.appendChild(style); // Disable sidebar or style it to fit header's new sizing/placement.

  if (config.kiosk_mode && !config.disabled_mode) {
    insertStyleTags(config);
    kioskMode(false, false);
  } else if (config.disable_sidebar) {
    kioskMode(true, false);
    insertStyleTags(config);
  } else if (config.hide_header) {
    insertStyleTags(config);
    kioskMode(false, true);
  } else if (!config.disable_sidebar && !config.kiosk_mode && !config.hide_header) {
    removeKioskMode();

    if (config.compact_mode && !config.footer_mode) {
      haElem.sidebar.main.shadowRoot.querySelector('.menu').style = 'height:49px;';
      haElem.sidebar.main.shadowRoot.querySelector('paper-listbox').style = 'height:calc(100% - 175px);';
      haElem.sidebar.main.shadowRoot.querySelector('div.divider').style = '';
    } else if (config.footer_mode && !config.split_mode) {
      haElem.sidebar.main.shadowRoot.querySelector('.menu').style = '';
      haElem.sidebar.main.shadowRoot.querySelector('paper-listbox').style = 'height: calc(100% - 170px);';
      haElem.sidebar.main.shadowRoot.querySelector('div.divider').style = 'margin-bottom: -10px;';
    } else if (config.split_mode) {
      haElem.sidebar.main.shadowRoot.querySelector('.menu').style = 'height:49px;';
      haElem.sidebar.main.shadowRoot.querySelector('paper-listbox').style = 'height: calc(100% - 170px);';
      haElem.sidebar.main.shadowRoot.querySelector('div.divider').style = 'margin-bottom: -3px;';
    } else {
      haElem.sidebar.main.shadowRoot.querySelector('.menu').style = '';
      haElem.sidebar.main.shadowRoot.querySelector('paper-listbox').style = '';
      haElem.sidebar.main.shadowRoot.querySelector('div.divider').style = '';
    }

    insertStyleTags(config);
  } // Remove chevrons.


  if (!config.chevrons) headerType.tabContainer.hideScrollButtons = true;else headerType.tabContainer.hideScrollButtons = false; // Current tab indicator on top.

  if (config.indicator_top) headerType.tabContainer.alignBottom = true;else headerType.tabContainer.alignBottom = false; // Set/remove attributes for footer mode.

  if (config.footer_mode) header.options.setAttribute('vertical-align', 'bottom');else header.options.removeAttribute('vertical-align');
  if (!config.footer_mode) header.container.setAttribute('slot', 'header');else header.container.removeAttribute('slot'); // Tabs direction left to right or right to left.

  headerType.tabContainer.dir = config.reverse_tab_direction ? 'rtl' : 'ltr';
  header.container.dir = config.reverse_button_direction ? 'rtl' : 'ltr'; // Tab icon customization.

  if (config.tab_icons && headerType.tabs.length) {
    for (const tab in config.tab_icons) {
      const index = tabIndexByName(tab);
      const haIcon = headerType.tabs[index].querySelector('ha-icon');
      if (!config.tab_icons[tab]) haIcon.icon = lovelace.config.views[index].icon;else haIcon.icon = config.tab_icons[tab];
    }
  } // Button icon customization.


  if (config.button_icons) {
    for (const button in config.button_icons) {
      if (!header[button]) continue;

      if (!config.button_icons[button]) {
        if (button === 'menu') header.menu.icon = 'mdi:menu';else if (button === 'voice' && header.voice) header.voice.icon = 'mdi:microphone';else if (button === 'options') {
          header[button].querySelector('paper-icon-button').icon = 'mdi:dots-vertical';
        }
      } else {
        if (button === 'options') header[button].querySelector('paper-icon-button').icon = config.button_icons[button];else header[button].icon = config.button_icons[button];
      }
    }
  } // Button text customization


  if (config.button_text) {
    for (const button in config.button_text) {
      const text = document.createElement('p');
      text.className = 'buttonText';
      const buttonElem = button === 'options' ? header[button].querySelector('paper-icon-button') : header[button];

      if (!config.button_text[button] && buttonElem.shadowRoot.querySelector('.buttonText')) {
        buttonElem.shadowRoot.querySelector('.buttonText').remove();
        buttonElem.shadowRoot.querySelector('iron-icon').style.display = '';
        buttonElem.style.width = '';
        continue;
      } else if (config.button_text[button]) {
        if (!buttonElem.shadowRoot.querySelector('.buttonText')) {
          text.innerHTML = config.button_text[button];
          buttonElem.shadowRoot.appendChild(text);
        } else {
          buttonElem.shadowRoot.querySelector('.buttonText').innerHTML = config.button_text[button];
        }

        if (button == 'menu') {
          buttonElem.shadowRoot.querySelector('.buttonText').dir = config.reverse_button_direction ? 'rtl' : 'ltr';
        } else {
          buttonElem.shadowRoot.querySelector('.buttonText').dir = config.reverse_button_direction ? 'ltr' : 'rtl';
        }

        buttonElem.shadowRoot.querySelector('iron-icon').style.display = 'none';
        buttonElem.style.width = 'auto';

        if (config.button_text[button].includes('<br>')) {
          buttonElem.shadowRoot.querySelector('.buttonText').style.fontSize = '17px';
          buttonElem.shadowRoot.querySelector('.buttonText').style.lineHeight = '1.2';
          buttonElem.shadowRoot.querySelector('.buttonText').style.margin = '-5px 0px 0px 0px';
        } else {
          buttonElem.shadowRoot.querySelector('.buttonText').style.margin = '5.5px 0px 0px 0px';
        }
      }
    }
  }

  if (!headerType.tabs.length) headerType.tabContainer.style.display = 'none';
  menuButtonObservers(config, header);

  if (!window.customHeaderShrink && !config.split_mode) {
    window.customHeaderShrink = true;
    window.addEventListener('scroll', function (e) {
      const compact_mode = window.getComputedStyle(header.container.querySelector('#contentContainer')).getPropertyValue('display') === 'none';
      const footer_mode = window.getComputedStyle(header.container).getPropertyValue('bottom') === '0px';

      if (footer_mode || compact_mode) {
        return;
      } else {
        if (window.scrollY > 48) {
          header.container.style.top = '-48px';
          header.menu.style.marginTop = '48px';
          if (header.voice) header.voice.style.marginTop = '48px';
          header.options.style.marginTop = '48px';
        } else {
          header.container.style.transition = '0s';
          header.menu.style.transition = '0s';
          if (header.voice) header.voice.style.transition = '0s';
          header.options.style.transition = '0s';
          header.container.style.top = "-".concat(window.scrollY, "px");
          header.menu.style.marginTop = "".concat(window.scrollY, "px");
          if (header.voice) header.voice.style.marginTop = "".concat(window.scrollY, "px");
          header.options.style.marginTop = "".concat(window.scrollY, "px");
        }

        header.container.style.transition = '';
      }
    });
  }

  const shadowScroll = () => {
    if (window.scrollY > 15) header.container.style.boxShadow = '0px 0px 5px 5px rgba(0,0,0,0.2)';else header.container.style.boxShadow = '0px 0px 5px 5px rgba(0,0,0,0)';
  };

  if (!window.customHeaderShadow && !config.footer_mode && !config.split_mode && config.shadow) {
    window.customHeaderShadow = true;
    window.addEventListener('scroll', shadowScroll);
  } else {
    window.removeEventListener('scroll', shadowScroll);
  }

  A(header.container, 'iron-resize');
  setTimeout(() => selectTab(config), 200);
  redirects(config, header);
};

const buildConfig = config => {
  if (!config) config = _objectSpread2({}, defaultConfig, {}, lovelace.config.custom_header);
  config = _objectSpread2({}, config, {}, conditionalConfig(config));
  const variables = config.template_variables;
  delete config.template_variables;

  const getBadTemplate = (result, error) => {
    const position = error.toString().match(/\d+/g)[0];
    const left = result.substr(0, position).match(/[^,]*$/);
    const right = result.substr(position).match(/^[^,]*/);
    return "".concat(left ? left[0] : '').concat(right ? right[0] : '').replace('":"', ': "');
  };

  const disabled = typeof config.disabled_mode == 'boolean' && config.disabled_mode || typeof config.disabled_mode == 'string' && !config.disabled_mode.includes('{{') && !config.disabled_mode.includes('{%') || window.location.href.includes('disable_ch');

  const processAndContinue = () => {
    if (config.hide_tabs) config.hide_tabs = processTabArray(config.hide_tabs);
    if (config.show_tabs) config.show_tabs = processTabArray(config.show_tabs);
    if (config.show_tabs && config.show_tabs.length) config.hide_tabs = invertNumArray(config.show_tabs);
    if (config.disable_sidebar || config.menu_dropdown) config.menu_hide = true;
    if (config.voice_dropdown) config.voice_hide = true;
    if (config.header_text === '' || config.header_text === ' ') config.header_text = '&nbsp;';

    if (config.hide_header && config.disable_sidebar) {
      config.kiosk_mode = true;
      config.hide_header = false;
      config.disable_sidebar = false;
    }

    if (config.test_template != undefined) {
      if (disabled) {
        console.log("Custom Header cannot render templates while disabled.");
      } else if (typeof config.test_template == 'string' && (config.test_template.toLowerCase().includes('true') || config.test_template.toLowerCase().includes('false'))) {
        console.log("Custom Header test returned: \"".concat(config.test_template, "\""));
        console.log("Warning: Boolean is returned as string instead of Boolean.");
      } else if (typeof config.test_template == 'string') {
        console.log("Custom Header test returned: \"".concat(config.test_template, "\""));
      } else {
        console.log("Custom Header test returned: ".concat(config.test_template));
      }
    }

    window.customHeaderConfig = config;
    styleHeader(config);

    if (!window.customHeaderObservers) {
      observers();
      window.customHeaderObservers = true;
    }
  };

  const configString = JSON.stringify(config);
  const hasTemplates = !!variables || configString.includes('{{') || configString.includes('{%');
  let unsubRenderTemplate;
  let templateFailed = false;

  if (hasTemplates && !disabled) {
    unsubRenderTemplate = subscribeRenderTemplate(result => {
      if (window.customHeaderLastTemplateResult == result) return;
      window.customHeaderLastTemplateResult = result;

      try {
        config = JSON.parse(result.replace(/"true"/gi, 'true').replace(/"false"/gi, 'false').replace(/""/, ''));
      } catch (e) {
        templateFailed = true;
        let err = "[CUSTOM-HEADER] There was an issue with the template: ".concat(getBadTemplate(result, e));
        if (err.includes('locale')) err = '[CUSTOM-HEADER] There was an issue one of your "template_variables".';
        console.log(err);
      }

      processAndContinue();
    }, {
      template: JSON.stringify(variables).replace(/\\/g, '') + JSON.stringify(config).replace(/\\/g, '')
    }, config.locale); // Catch less helpful template errors.

    (async () => {
      try {
        const test = await unsubRenderTemplate;
      } catch (e) {
        templateFailed = true;
        console.log('[CUSTOM-HEADER] There was an error with one or more of your templates:');
        console.log("".concat(e.message.substring(0, e.message.indexOf(')')), ")"));
      }
    })(); // Render templates every minute.


    window.setTimeout(() => {
      // Unsubscribe from template.
      if (templateFailed || root.querySelector('custom-header-editor')) return;

      (async () => {
        const unsub = await unsubRenderTemplate;
        unsubRenderTemplate = undefined;
        await unsub();
      })();

      buildConfig();
    }, (60 - new Date().getSeconds()) * 1000);
  } else {
    processAndContinue();
  }
};

function unwrapExports (x) {
	return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
}

function createCommonjsModule(fn, module) {
	return module = { exports: {} }, fn(module, module.exports), module.exports;
}

var _global = createCommonjsModule(function (module) {
// https://github.com/zloirock/core-js/issues/86#issuecomment-115759028
var global = module.exports = typeof window != 'undefined' && window.Math == Math ? window : typeof self != 'undefined' && self.Math == Math ? self // eslint-disable-next-line no-new-func
: Function('return this')();
if (typeof __g == 'number') __g = global; // eslint-disable-line no-undef
});

var hasOwnProperty = {}.hasOwnProperty;

var _has = function (it, key) {
  return hasOwnProperty.call(it, key);
};

var _fails = function (exec) {
  try {
    return !!exec();
  } catch (e) {
    return true;
  }
};

// Thank's IE8 for his funny defineProperty
var _descriptors = !_fails(function () {
  return Object.defineProperty({}, 'a', {
    get: function () {
      return 7;
    }
  }).a != 7;
});

var _core = createCommonjsModule(function (module) {
var core = module.exports = {
  version: '2.6.11'
};
if (typeof __e == 'number') __e = core; // eslint-disable-line no-undef
});
var _core_1 = _core.version;

var _isObject = function (it) {
  return typeof it === 'object' ? it !== null : typeof it === 'function';
};

var _anObject = function (it) {
  if (!_isObject(it)) throw TypeError(it + ' is not an object!');
  return it;
};

var document$1 = _global.document; // typeof document.createElement is 'object' in old IE


var is = _isObject(document$1) && _isObject(document$1.createElement);

var _domCreate = function (it) {
  return is ? document$1.createElement(it) : {};
};

var _ie8DomDefine = !_descriptors && !_fails(function () {
  return Object.defineProperty(_domCreate('div'), 'a', {
    get: function () {
      return 7;
    }
  }).a != 7;
});

// 7.1.1 ToPrimitive(input [, PreferredType])
 // instead of the ES6 spec version, we didn't implement @@toPrimitive case
// and the second argument - flag - preferred type is a string


var _toPrimitive = function (it, S) {
  if (!_isObject(it)) return it;
  var fn, val;
  if (S && typeof (fn = it.toString) == 'function' && !_isObject(val = fn.call(it))) return val;
  if (typeof (fn = it.valueOf) == 'function' && !_isObject(val = fn.call(it))) return val;
  if (!S && typeof (fn = it.toString) == 'function' && !_isObject(val = fn.call(it))) return val;
  throw TypeError("Can't convert object to primitive value");
};

var dP = Object.defineProperty;
var f = _descriptors ? Object.defineProperty : function defineProperty(O, P, Attributes) {
  _anObject(O);
  P = _toPrimitive(P, true);
  _anObject(Attributes);
  if (_ie8DomDefine) try {
    return dP(O, P, Attributes);
  } catch (e) {
    /* empty */
  }
  if ('get' in Attributes || 'set' in Attributes) throw TypeError('Accessors not supported!');
  if ('value' in Attributes) O[P] = Attributes.value;
  return O;
};

var _objectDp = {
	f: f
};

var _propertyDesc = function (bitmap, value) {
  return {
    enumerable: !(bitmap & 1),
    configurable: !(bitmap & 2),
    writable: !(bitmap & 4),
    value: value
  };
};

var _hide = _descriptors ? function (object, key, value) {
  return _objectDp.f(object, key, _propertyDesc(1, value));
} : function (object, key, value) {
  object[key] = value;
  return object;
};

var id = 0;
var px = Math.random();

var _uid = function (key) {
  return 'Symbol('.concat(key === undefined ? '' : key, ')_', (++id + px).toString(36));
};

var _library = false;

var _shared = createCommonjsModule(function (module) {
var SHARED = '__core-js_shared__';
var store = _global[SHARED] || (_global[SHARED] = {});
(module.exports = function (key, value) {
  return store[key] || (store[key] = value !== undefined ? value : {});
})('versions', []).push({
  version: _core.version,
  mode:  'global',
  copyright: '© 2019 Denis Pushkarev (zloirock.ru)'
});
});

var _functionToString = _shared('native-function-to-string', Function.toString);

var _redefine = createCommonjsModule(function (module) {
var SRC = _uid('src');



var TO_STRING = 'toString';
var TPL = ('' + _functionToString).split(TO_STRING);

_core.inspectSource = function (it) {
  return _functionToString.call(it);
};

(module.exports = function (O, key, val, safe) {
  var isFunction = typeof val == 'function';
  if (isFunction) _has(val, 'name') || _hide(val, 'name', key);
  if (O[key] === val) return;
  if (isFunction) _has(val, SRC) || _hide(val, SRC, O[key] ? '' + O[key] : TPL.join(String(key)));

  if (O === _global) {
    O[key] = val;
  } else if (!safe) {
    delete O[key];
    _hide(O, key, val);
  } else if (O[key]) {
    O[key] = val;
  } else {
    _hide(O, key, val);
  } // add fake Function#toString for correct work wrapped methods / constructors with methods like LoDash isNative

})(Function.prototype, TO_STRING, function toString() {
  return typeof this == 'function' && this[SRC] || _functionToString.call(this);
});
});

var _aFunction = function (it) {
  if (typeof it != 'function') throw TypeError(it + ' is not a function!');
  return it;
};

// optional / simple context binding


var _ctx = function (fn, that, length) {
  _aFunction(fn);
  if (that === undefined) return fn;

  switch (length) {
    case 1:
      return function (a) {
        return fn.call(that, a);
      };

    case 2:
      return function (a, b) {
        return fn.call(that, a, b);
      };

    case 3:
      return function (a, b, c) {
        return fn.call(that, a, b, c);
      };
  }

  return function ()
  /* ...args */
  {
    return fn.apply(that, arguments);
  };
};

var PROTOTYPE = 'prototype';

var $export = function (type, name, source) {
  var IS_FORCED = type & $export.F;
  var IS_GLOBAL = type & $export.G;
  var IS_STATIC = type & $export.S;
  var IS_PROTO = type & $export.P;
  var IS_BIND = type & $export.B;
  var target = IS_GLOBAL ? _global : IS_STATIC ? _global[name] || (_global[name] = {}) : (_global[name] || {})[PROTOTYPE];
  var exports = IS_GLOBAL ? _core : _core[name] || (_core[name] = {});
  var expProto = exports[PROTOTYPE] || (exports[PROTOTYPE] = {});
  var key, own, out, exp;
  if (IS_GLOBAL) source = name;

  for (key in source) {
    // contains in native
    own = !IS_FORCED && target && target[key] !== undefined; // export native or passed

    out = (own ? target : source)[key]; // bind timers to global for call from export context

    exp = IS_BIND && own ? _ctx(out, _global) : IS_PROTO && typeof out == 'function' ? _ctx(Function.call, out) : out; // extend global

    if (target) _redefine(target, key, out, type & $export.U); // export

    if (exports[key] != out) _hide(exports, key, exp);
    if (IS_PROTO && expProto[key] != out) expProto[key] = out;
  }
};

_global.core = _core; // type bitmap

$export.F = 1; // forced

$export.G = 2; // global

$export.S = 4; // static

$export.P = 8; // proto

$export.B = 16; // bind

$export.W = 32; // wrap

$export.U = 64; // safe

$export.R = 128; // real proto method for `library`

var _export = $export;

var _meta = createCommonjsModule(function (module) {
var META = _uid('meta');





var setDesc = _objectDp.f;

var id = 0;

var isExtensible = Object.isExtensible || function () {
  return true;
};

var FREEZE = !_fails(function () {
  return isExtensible(Object.preventExtensions({}));
});

var setMeta = function (it) {
  setDesc(it, META, {
    value: {
      i: 'O' + ++id,
      // object ID
      w: {} // weak collections IDs

    }
  });
};

var fastKey = function (it, create) {
  // return primitive with prefix
  if (!_isObject(it)) return typeof it == 'symbol' ? it : (typeof it == 'string' ? 'S' : 'P') + it;

  if (!_has(it, META)) {
    // can't set metadata to uncaught frozen object
    if (!isExtensible(it)) return 'F'; // not necessary to add metadata

    if (!create) return 'E'; // add missing metadata

    setMeta(it); // return object ID
  }

  return it[META].i;
};

var getWeak = function (it, create) {
  if (!_has(it, META)) {
    // can't set metadata to uncaught frozen object
    if (!isExtensible(it)) return true; // not necessary to add metadata

    if (!create) return false; // add missing metadata

    setMeta(it); // return hash weak collections IDs
  }

  return it[META].w;
}; // add metadata on freeze-family methods calling


var onFreeze = function (it) {
  if (FREEZE && meta.NEED && isExtensible(it) && !_has(it, META)) setMeta(it);
  return it;
};

var meta = module.exports = {
  KEY: META,
  NEED: false,
  fastKey: fastKey,
  getWeak: getWeak,
  onFreeze: onFreeze
};
});
var _meta_1 = _meta.KEY;
var _meta_2 = _meta.NEED;
var _meta_3 = _meta.fastKey;
var _meta_4 = _meta.getWeak;
var _meta_5 = _meta.onFreeze;

var _wks = createCommonjsModule(function (module) {
var store = _shared('wks');



var Symbol = _global.Symbol;

var USE_SYMBOL = typeof Symbol == 'function';

var $exports = module.exports = function (name) {
  return store[name] || (store[name] = USE_SYMBOL && Symbol[name] || (USE_SYMBOL ? Symbol : _uid)('Symbol.' + name));
};

$exports.store = store;
});

var def = _objectDp.f;



var TAG = _wks('toStringTag');

var _setToStringTag = function (it, tag, stat) {
  if (it && !_has(it = stat ? it : it.prototype, TAG)) def(it, TAG, {
    configurable: true,
    value: tag
  });
};

var f$1 = _wks;

var _wksExt = {
	f: f$1
};

var defineProperty = _objectDp.f;

var _wksDefine = function (name) {
  var $Symbol = _core.Symbol || (_core.Symbol =  _global.Symbol || {});
  if (name.charAt(0) != '_' && !(name in $Symbol)) defineProperty($Symbol, name, {
    value: _wksExt.f(name)
  });
};

var toString = {}.toString;

var _cof = function (it) {
  return toString.call(it).slice(8, -1);
};

// fallback for non-array-like ES3 and non-enumerable old V8 strings
 // eslint-disable-next-line no-prototype-builtins


var _iobject = Object('z').propertyIsEnumerable(0) ? Object : function (it) {
  return _cof(it) == 'String' ? it.split('') : Object(it);
};

// 7.2.1 RequireObjectCoercible(argument)
var _defined = function (it) {
  if (it == undefined) throw TypeError("Can't call method on  " + it);
  return it;
};

// to indexed object, toObject with fallback for non-array-like ES3 strings




var _toIobject = function (it) {
  return _iobject(_defined(it));
};

// 7.1.4 ToInteger
var ceil = Math.ceil;
var floor = Math.floor;

var _toInteger = function (it) {
  return isNaN(it = +it) ? 0 : (it > 0 ? floor : ceil)(it);
};

// 7.1.15 ToLength


var min = Math.min;

var _toLength = function (it) {
  return it > 0 ? min(_toInteger(it), 0x1fffffffffffff) : 0; // pow(2, 53) - 1 == 9007199254740991
};

var max = Math.max;
var min$1 = Math.min;

var _toAbsoluteIndex = function (index, length) {
  index = _toInteger(index);
  return index < 0 ? max(index + length, 0) : min$1(index, length);
};

// false -> Array#indexOf
// true  -> Array#includes






var _arrayIncludes = function (IS_INCLUDES) {
  return function ($this, el, fromIndex) {
    var O = _toIobject($this);
    var length = _toLength(O.length);
    var index = _toAbsoluteIndex(fromIndex, length);
    var value; // Array#includes uses SameValueZero equality algorithm
    // eslint-disable-next-line no-self-compare

    if (IS_INCLUDES && el != el) while (length > index) {
      value = O[index++]; // eslint-disable-next-line no-self-compare

      if (value != value) return true; // Array#indexOf ignores holes, Array#includes - not
    } else for (; length > index; index++) if (IS_INCLUDES || index in O) {
      if (O[index] === el) return IS_INCLUDES || index || 0;
    }
    return !IS_INCLUDES && -1;
  };
};

var shared = _shared('keys');



var _sharedKey = function (key) {
  return shared[key] || (shared[key] = _uid(key));
};

var arrayIndexOf = _arrayIncludes(false);

var IE_PROTO = _sharedKey('IE_PROTO');

var _objectKeysInternal = function (object, names) {
  var O = _toIobject(object);
  var i = 0;
  var result = [];
  var key;

  for (key in O) if (key != IE_PROTO) _has(O, key) && result.push(key); // Don't enum bug & hidden keys


  while (names.length > i) if (_has(O, key = names[i++])) {
    ~arrayIndexOf(result, key) || result.push(key);
  }

  return result;
};

// IE 8- don't enum bug keys
var _enumBugKeys = 'constructor,hasOwnProperty,isPrototypeOf,propertyIsEnumerable,toLocaleString,toString,valueOf'.split(',');

// 19.1.2.14 / 15.2.3.14 Object.keys(O)




var _objectKeys = Object.keys || function keys(O) {
  return _objectKeysInternal(O, _enumBugKeys);
};

var f$2 = Object.getOwnPropertySymbols;

var _objectGops = {
	f: f$2
};

var f$3 = {}.propertyIsEnumerable;

var _objectPie = {
	f: f$3
};

// all enumerable object keys, includes symbols






var _enumKeys = function (it) {
  var result = _objectKeys(it);
  var getSymbols = _objectGops.f;

  if (getSymbols) {
    var symbols = getSymbols(it);
    var isEnum = _objectPie.f;
    var i = 0;
    var key;

    while (symbols.length > i) if (isEnum.call(it, key = symbols[i++])) result.push(key);
  }

  return result;
};

// 7.2.2 IsArray(argument)


var _isArray = Array.isArray || function isArray(arg) {
  return _cof(arg) == 'Array';
};

// 7.1.13 ToObject(argument)


var _toObject = function (it) {
  return Object(_defined(it));
};

var _objectDps = _descriptors ? Object.defineProperties : function defineProperties(O, Properties) {
  _anObject(O);
  var keys = _objectKeys(Properties);
  var length = keys.length;
  var i = 0;
  var P;

  while (length > i) _objectDp.f(O, P = keys[i++], Properties[P]);

  return O;
};

var document$2 = _global.document;

var _html = document$2 && document$2.documentElement;

// 19.1.2.2 / 15.2.3.5 Object.create(O [, Properties])






var IE_PROTO$1 = _sharedKey('IE_PROTO');

var Empty = function () {
  /* empty */
};

var PROTOTYPE$1 = 'prototype'; // Create object with fake `null` prototype: use iframe Object with cleared prototype

var createDict = function () {
  // Thrash, waste and sodomy: IE GC bug
  var iframe = _domCreate('iframe');

  var i = _enumBugKeys.length;
  var lt = '<';
  var gt = '>';
  var iframeDocument;
  iframe.style.display = 'none';

  _html.appendChild(iframe);

  iframe.src = 'javascript:'; // eslint-disable-line no-script-url
  // createDict = iframe.contentWindow.Object;
  // html.removeChild(iframe);

  iframeDocument = iframe.contentWindow.document;
  iframeDocument.open();
  iframeDocument.write(lt + 'script' + gt + 'document.F=Object' + lt + '/script' + gt);
  iframeDocument.close();
  createDict = iframeDocument.F;

  while (i--) delete createDict[PROTOTYPE$1][_enumBugKeys[i]];

  return createDict();
};

var _objectCreate = Object.create || function create(O, Properties) {
  var result;

  if (O !== null) {
    Empty[PROTOTYPE$1] = _anObject(O);
    result = new Empty();
    Empty[PROTOTYPE$1] = null; // add "__proto__" for Object.getPrototypeOf polyfill

    result[IE_PROTO$1] = O;
  } else result = createDict();

  return Properties === undefined ? result : _objectDps(result, Properties);
};

// 19.1.2.7 / 15.2.3.4 Object.getOwnPropertyNames(O)


var hiddenKeys = _enumBugKeys.concat('length', 'prototype');

var f$4 = Object.getOwnPropertyNames || function getOwnPropertyNames(O) {
  return _objectKeysInternal(O, hiddenKeys);
};

var _objectGopn = {
	f: f$4
};

// fallback for IE11 buggy Object.getOwnPropertyNames with iframe and window


var gOPN = _objectGopn.f;

var toString$1 = {}.toString;
var windowNames = typeof window == 'object' && window && Object.getOwnPropertyNames ? Object.getOwnPropertyNames(window) : [];

var getWindowNames = function (it) {
  try {
    return gOPN(it);
  } catch (e) {
    return windowNames.slice();
  }
};

var f$5 = function getOwnPropertyNames(it) {
  return windowNames && toString$1.call(it) == '[object Window]' ? getWindowNames(it) : gOPN(_toIobject(it));
};

var _objectGopnExt = {
	f: f$5
};

var gOPD = Object.getOwnPropertyDescriptor;
var f$6 = _descriptors ? gOPD : function getOwnPropertyDescriptor(O, P) {
  O = _toIobject(O);
  P = _toPrimitive(P, true);
  if (_ie8DomDefine) try {
    return gOPD(O, P);
  } catch (e) {
    /* empty */
  }
  if (_has(O, P)) return _propertyDesc(!_objectPie.f.call(O, P), O[P]);
};

var _objectGopd = {
	f: f$6
};

var META = _meta.KEY;











































var gOPD$1 = _objectGopd.f;
var dP$1 = _objectDp.f;
var gOPN$1 = _objectGopnExt.f;
var $Symbol = _global.Symbol;
var $JSON = _global.JSON;

var _stringify = $JSON && $JSON.stringify;

var PROTOTYPE$2 = 'prototype';
var HIDDEN = _wks('_hidden');
var TO_PRIMITIVE = _wks('toPrimitive');
var isEnum = {}.propertyIsEnumerable;
var SymbolRegistry = _shared('symbol-registry');
var AllSymbols = _shared('symbols');
var OPSymbols = _shared('op-symbols');
var ObjectProto = Object[PROTOTYPE$2];
var USE_NATIVE = typeof $Symbol == 'function' && !!_objectGops.f;
var QObject = _global.QObject; // Don't use setters in Qt Script, https://github.com/zloirock/core-js/issues/173

var setter = !QObject || !QObject[PROTOTYPE$2] || !QObject[PROTOTYPE$2].findChild; // fallback for old Android, https://code.google.com/p/v8/issues/detail?id=687

var setSymbolDesc = _descriptors && _fails(function () {
  return _objectCreate(dP$1({}, 'a', {
    get: function () {
      return dP$1(this, 'a', {
        value: 7
      }).a;
    }
  })).a != 7;
}) ? function (it, key, D) {
  var protoDesc = gOPD$1(ObjectProto, key);
  if (protoDesc) delete ObjectProto[key];
  dP$1(it, key, D);
  if (protoDesc && it !== ObjectProto) dP$1(ObjectProto, key, protoDesc);
} : dP$1;

var wrap = function (tag) {
  var sym = AllSymbols[tag] = _objectCreate($Symbol[PROTOTYPE$2]);

  sym._k = tag;
  return sym;
};

var isSymbol = USE_NATIVE && typeof $Symbol.iterator == 'symbol' ? function (it) {
  return typeof it == 'symbol';
} : function (it) {
  return it instanceof $Symbol;
};

var $defineProperty = function defineProperty(it, key, D) {
  if (it === ObjectProto) $defineProperty(OPSymbols, key, D);
  _anObject(it);
  key = _toPrimitive(key, true);
  _anObject(D);

  if (_has(AllSymbols, key)) {
    if (!D.enumerable) {
      if (!_has(it, HIDDEN)) dP$1(it, HIDDEN, _propertyDesc(1, {}));
      it[HIDDEN][key] = true;
    } else {
      if (_has(it, HIDDEN) && it[HIDDEN][key]) it[HIDDEN][key] = false;
      D = _objectCreate(D, {
        enumerable: _propertyDesc(0, false)
      });
    }

    return setSymbolDesc(it, key, D);
  }

  return dP$1(it, key, D);
};

var $defineProperties = function defineProperties(it, P) {
  _anObject(it);
  var keys = _enumKeys(P = _toIobject(P));
  var i = 0;
  var l = keys.length;
  var key;

  while (l > i) $defineProperty(it, key = keys[i++], P[key]);

  return it;
};

var $create = function create(it, P) {
  return P === undefined ? _objectCreate(it) : $defineProperties(_objectCreate(it), P);
};

var $propertyIsEnumerable = function propertyIsEnumerable(key) {
  var E = isEnum.call(this, key = _toPrimitive(key, true));
  if (this === ObjectProto && _has(AllSymbols, key) && !_has(OPSymbols, key)) return false;
  return E || !_has(this, key) || !_has(AllSymbols, key) || _has(this, HIDDEN) && this[HIDDEN][key] ? E : true;
};

var $getOwnPropertyDescriptor = function getOwnPropertyDescriptor(it, key) {
  it = _toIobject(it);
  key = _toPrimitive(key, true);
  if (it === ObjectProto && _has(AllSymbols, key) && !_has(OPSymbols, key)) return;
  var D = gOPD$1(it, key);
  if (D && _has(AllSymbols, key) && !(_has(it, HIDDEN) && it[HIDDEN][key])) D.enumerable = true;
  return D;
};

var $getOwnPropertyNames = function getOwnPropertyNames(it) {
  var names = gOPN$1(_toIobject(it));
  var result = [];
  var i = 0;
  var key;

  while (names.length > i) {
    if (!_has(AllSymbols, key = names[i++]) && key != HIDDEN && key != META) result.push(key);
  }

  return result;
};

var $getOwnPropertySymbols = function getOwnPropertySymbols(it) {
  var IS_OP = it === ObjectProto;
  var names = gOPN$1(IS_OP ? OPSymbols : _toIobject(it));
  var result = [];
  var i = 0;
  var key;

  while (names.length > i) {
    if (_has(AllSymbols, key = names[i++]) && (IS_OP ? _has(ObjectProto, key) : true)) result.push(AllSymbols[key]);
  }

  return result;
}; // 19.4.1.1 Symbol([description])


if (!USE_NATIVE) {
  $Symbol = function Symbol() {
    if (this instanceof $Symbol) throw TypeError('Symbol is not a constructor!');
    var tag = _uid(arguments.length > 0 ? arguments[0] : undefined);

    var $set = function (value) {
      if (this === ObjectProto) $set.call(OPSymbols, value);
      if (_has(this, HIDDEN) && _has(this[HIDDEN], tag)) this[HIDDEN][tag] = false;
      setSymbolDesc(this, tag, _propertyDesc(1, value));
    };

    if (_descriptors && setter) setSymbolDesc(ObjectProto, tag, {
      configurable: true,
      set: $set
    });
    return wrap(tag);
  };

  _redefine($Symbol[PROTOTYPE$2], 'toString', function toString() {
    return this._k;
  });
  _objectGopd.f = $getOwnPropertyDescriptor;
  _objectDp.f = $defineProperty;
  _objectGopn.f = _objectGopnExt.f = $getOwnPropertyNames;
  _objectPie.f = $propertyIsEnumerable;
  _objectGops.f = $getOwnPropertySymbols;

  if (_descriptors && !_library) {
    _redefine(ObjectProto, 'propertyIsEnumerable', $propertyIsEnumerable, true);
  }

  _wksExt.f = function (name) {
    return wrap(_wks(name));
  };
}

_export(_export.G + _export.W + _export.F * !USE_NATIVE, {
  Symbol: $Symbol
});

for (var es6Symbols = // 19.4.2.2, 19.4.2.3, 19.4.2.4, 19.4.2.6, 19.4.2.8, 19.4.2.9, 19.4.2.10, 19.4.2.11, 19.4.2.12, 19.4.2.13, 19.4.2.14
'hasInstance,isConcatSpreadable,iterator,match,replace,search,species,split,toPrimitive,toStringTag,unscopables'.split(','), j = 0; es6Symbols.length > j;) _wks(es6Symbols[j++]);

for (var wellKnownSymbols = _objectKeys(_wks.store), k = 0; wellKnownSymbols.length > k;) _wksDefine(wellKnownSymbols[k++]);

_export(_export.S + _export.F * !USE_NATIVE, 'Symbol', {
  // 19.4.2.1 Symbol.for(key)
  'for': function (key) {
    return _has(SymbolRegistry, key += '') ? SymbolRegistry[key] : SymbolRegistry[key] = $Symbol(key);
  },
  // 19.4.2.5 Symbol.keyFor(sym)
  keyFor: function keyFor(sym) {
    if (!isSymbol(sym)) throw TypeError(sym + ' is not a symbol!');

    for (var key in SymbolRegistry) if (SymbolRegistry[key] === sym) return key;
  },
  useSetter: function () {
    setter = true;
  },
  useSimple: function () {
    setter = false;
  }
});
_export(_export.S + _export.F * !USE_NATIVE, 'Object', {
  // 19.1.2.2 Object.create(O [, Properties])
  create: $create,
  // 19.1.2.4 Object.defineProperty(O, P, Attributes)
  defineProperty: $defineProperty,
  // 19.1.2.3 Object.defineProperties(O, Properties)
  defineProperties: $defineProperties,
  // 19.1.2.6 Object.getOwnPropertyDescriptor(O, P)
  getOwnPropertyDescriptor: $getOwnPropertyDescriptor,
  // 19.1.2.7 Object.getOwnPropertyNames(O)
  getOwnPropertyNames: $getOwnPropertyNames,
  // 19.1.2.8 Object.getOwnPropertySymbols(O)
  getOwnPropertySymbols: $getOwnPropertySymbols
}); // Chrome 38 and 39 `Object.getOwnPropertySymbols` fails on primitives
// https://bugs.chromium.org/p/v8/issues/detail?id=3443

var FAILS_ON_PRIMITIVES = _fails(function () {
  _objectGops.f(1);
});
_export(_export.S + _export.F * FAILS_ON_PRIMITIVES, 'Object', {
  getOwnPropertySymbols: function getOwnPropertySymbols(it) {
    return _objectGops.f(_toObject(it));
  }
}); // 24.3.2 JSON.stringify(value [, replacer [, space]])

$JSON && _export(_export.S + _export.F * (!USE_NATIVE || _fails(function () {
  var S = $Symbol(); // MS Edge converts symbol values to JSON as {}
  // WebKit converts symbol values to JSON as null
  // V8 throws on boxed symbols

  return _stringify([S]) != '[null]' || _stringify({
    a: S
  }) != '{}' || _stringify(Object(S)) != '{}';
})), 'JSON', {
  stringify: function stringify(it) {
    var args = [it];
    var i = 1;
    var replacer, $replacer;

    while (arguments.length > i) args.push(arguments[i++]);

    $replacer = replacer = args[1];
    if (!_isObject(replacer) && it === undefined || isSymbol(it)) return; // IE8 returns string on undefined

    if (!_isArray(replacer)) replacer = function (key, value) {
      if (typeof $replacer == 'function') value = $replacer.call(this, key, value);
      if (!isSymbol(value)) return value;
    };
    args[1] = replacer;
    return _stringify.apply($JSON, args);
  }
}); // 19.4.3.4 Symbol.prototype[@@toPrimitive](hint)

$Symbol[PROTOTYPE$2][TO_PRIMITIVE] || _hide($Symbol[PROTOTYPE$2], TO_PRIMITIVE, $Symbol[PROTOTYPE$2].valueOf); // 19.4.3.5 Symbol.prototype[@@toStringTag]

_setToStringTag($Symbol, 'Symbol'); // 20.2.1.9 Math[@@toStringTag]

_setToStringTag(Math, 'Math', true); // 24.3.3 JSON[@@toStringTag]

_setToStringTag(_global.JSON, 'JSON', true);

// 19.1.2.2 / 15.2.3.5 Object.create(O [, Properties])


_export(_export.S, 'Object', {
  create: _objectCreate
});

// 19.1.2.4 / 15.2.3.6 Object.defineProperty(O, P, Attributes)


_export(_export.S + _export.F * !_descriptors, 'Object', {
  defineProperty: _objectDp.f
});

// 19.1.2.3 / 15.2.3.7 Object.defineProperties(O, Properties)


_export(_export.S + _export.F * !_descriptors, 'Object', {
  defineProperties: _objectDps
});

// most Object methods by ES6 should accept primitives






var _objectSap = function (KEY, exec) {
  var fn = (_core.Object || {})[KEY] || Object[KEY];
  var exp = {};
  exp[KEY] = exec(fn);
  _export(_export.S + _export.F * _fails(function () {
    fn(1);
  }), 'Object', exp);
};

// 19.1.2.6 Object.getOwnPropertyDescriptor(O, P)


var $getOwnPropertyDescriptor$1 = _objectGopd.f;

_objectSap('getOwnPropertyDescriptor', function () {
  return function getOwnPropertyDescriptor(it, key) {
    return $getOwnPropertyDescriptor$1(_toIobject(it), key);
  };
});

// 19.1.2.9 / 15.2.3.2 Object.getPrototypeOf(O)




var IE_PROTO$2 = _sharedKey('IE_PROTO');

var ObjectProto$1 = Object.prototype;

var _objectGpo = Object.getPrototypeOf || function (O) {
  O = _toObject(O);
  if (_has(O, IE_PROTO$2)) return O[IE_PROTO$2];

  if (typeof O.constructor == 'function' && O instanceof O.constructor) {
    return O.constructor.prototype;
  }

  return O instanceof Object ? ObjectProto$1 : null;
};

// 19.1.2.9 Object.getPrototypeOf(O)




_objectSap('getPrototypeOf', function () {
  return function getPrototypeOf(it) {
    return _objectGpo(_toObject(it));
  };
});

// 19.1.2.14 Object.keys(O)




_objectSap('keys', function () {
  return function keys(it) {
    return _objectKeys(_toObject(it));
  };
});

// 19.1.2.7 Object.getOwnPropertyNames(O)
_objectSap('getOwnPropertyNames', function () {
  return _objectGopnExt.f;
});

// 19.1.2.5 Object.freeze(O)


var meta = _meta.onFreeze;

_objectSap('freeze', function ($freeze) {
  return function freeze(it) {
    return $freeze && _isObject(it) ? $freeze(meta(it)) : it;
  };
});

// 19.1.2.17 Object.seal(O)


var meta$1 = _meta.onFreeze;

_objectSap('seal', function ($seal) {
  return function seal(it) {
    return $seal && _isObject(it) ? $seal(meta$1(it)) : it;
  };
});

// 19.1.2.15 Object.preventExtensions(O)


var meta$2 = _meta.onFreeze;

_objectSap('preventExtensions', function ($preventExtensions) {
  return function preventExtensions(it) {
    return $preventExtensions && _isObject(it) ? $preventExtensions(meta$2(it)) : it;
  };
});

// 19.1.2.12 Object.isFrozen(O)


_objectSap('isFrozen', function ($isFrozen) {
  return function isFrozen(it) {
    return _isObject(it) ? $isFrozen ? $isFrozen(it) : false : true;
  };
});

// 19.1.2.13 Object.isSealed(O)


_objectSap('isSealed', function ($isSealed) {
  return function isSealed(it) {
    return _isObject(it) ? $isSealed ? $isSealed(it) : false : true;
  };
});

// 19.1.2.11 Object.isExtensible(O)


_objectSap('isExtensible', function ($isExtensible) {
  return function isExtensible(it) {
    return _isObject(it) ? $isExtensible ? $isExtensible(it) : true : false;
  };
});

var $assign = Object.assign; // should work with symbols and should have deterministic property order (V8 bug)

var _objectAssign = !$assign || _fails(function () {
  var A = {};
  var B = {}; // eslint-disable-next-line no-undef

  var S = Symbol();
  var K = 'abcdefghijklmnopqrst';
  A[S] = 7;
  K.split('').forEach(function (k) {
    B[k] = k;
  });
  return $assign({}, A)[S] != 7 || Object.keys($assign({}, B)).join('') != K;
}) ? function assign(target, source) {
  // eslint-disable-line no-unused-vars
  var T = _toObject(target);
  var aLen = arguments.length;
  var index = 1;
  var getSymbols = _objectGops.f;
  var isEnum = _objectPie.f;

  while (aLen > index) {
    var S = _iobject(arguments[index++]);
    var keys = getSymbols ? _objectKeys(S).concat(getSymbols(S)) : _objectKeys(S);
    var length = keys.length;
    var j = 0;
    var key;

    while (length > j) {
      key = keys[j++];
      if (!_descriptors || isEnum.call(S, key)) T[key] = S[key];
    }
  }

  return T;
} : $assign;

// 19.1.3.1 Object.assign(target, source)


_export(_export.S + _export.F, 'Object', {
  assign: _objectAssign
});

// 7.2.9 SameValue(x, y)
var _sameValue = Object.is || function is(x, y) {
  // eslint-disable-next-line no-self-compare
  return x === y ? x !== 0 || 1 / x === 1 / y : x != x && y != y;
};

// 19.1.3.10 Object.is(value1, value2)


_export(_export.S, 'Object', {
  is: _sameValue
});

// Works with __proto__ only. Old v8 can't work with null proto objects.

/* eslint-disable no-proto */




var check = function (O, proto) {
  _anObject(O);
  if (!_isObject(proto) && proto !== null) throw TypeError(proto + ": can't set as prototype!");
};

var _setProto = {
  set: Object.setPrototypeOf || ('__proto__' in {} ? // eslint-disable-line
  function (test, buggy, set) {
    try {
      set = _ctx(Function.call, _objectGopd.f(Object.prototype, '__proto__').set, 2);
      set(test, []);
      buggy = !(test instanceof Array);
    } catch (e) {
      buggy = true;
    }

    return function setPrototypeOf(O, proto) {
      check(O, proto);
      if (buggy) O.__proto__ = proto;else set(O, proto);
      return O;
    };
  }({}, false) : undefined),
  check: check
};

// 19.1.3.19 Object.setPrototypeOf(O, proto)


_export(_export.S, 'Object', {
  setPrototypeOf: _setProto.set
});

// getting tag from 19.1.3.6 Object.prototype.toString()


var TAG$1 = _wks('toStringTag'); // ES3 wrong here


var ARG = _cof(function () {
  return arguments;
}()) == 'Arguments'; // fallback for IE11 Script Access Denied error

var tryGet = function (it, key) {
  try {
    return it[key];
  } catch (e) {
    /* empty */
  }
};

var _classof = function (it) {
  var O, T, B;
  return it === undefined ? 'Undefined' : it === null ? 'Null' // @@toStringTag case
  : typeof (T = tryGet(O = Object(it), TAG$1)) == 'string' ? T // builtinTag case
  : ARG ? _cof(O) // ES3 arguments fallback
  : (B = _cof(O)) == 'Object' && typeof O.callee == 'function' ? 'Arguments' : B;
};

var test = {};
test[_wks('toStringTag')] = 'z';

if (test + '' != '[object z]') {
  _redefine(Object.prototype, 'toString', function toString() {
    return '[object ' + _classof(this) + ']';
  }, true);
}

// fast apply, http://jsperf.lnkit.com/fast-apply/5
var _invoke = function (fn, args, that) {
  var un = that === undefined;

  switch (args.length) {
    case 0:
      return un ? fn() : fn.call(that);

    case 1:
      return un ? fn(args[0]) : fn.call(that, args[0]);

    case 2:
      return un ? fn(args[0], args[1]) : fn.call(that, args[0], args[1]);

    case 3:
      return un ? fn(args[0], args[1], args[2]) : fn.call(that, args[0], args[1], args[2]);

    case 4:
      return un ? fn(args[0], args[1], args[2], args[3]) : fn.call(that, args[0], args[1], args[2], args[3]);
  }

  return fn.apply(that, args);
};

var arraySlice = [].slice;
var factories = {};

var construct = function (F, len, args) {
  if (!(len in factories)) {
    for (var n = [], i = 0; i < len; i++) n[i] = 'a[' + i + ']'; // eslint-disable-next-line no-new-func


    factories[len] = Function('F,a', 'return new F(' + n.join(',') + ')');
  }

  return factories[len](F, args);
};

var _bind = Function.bind || function bind(that
/* , ...args */
) {
  var fn = _aFunction(this);
  var partArgs = arraySlice.call(arguments, 1);

  var bound = function ()
  /* args... */
  {
    var args = partArgs.concat(arraySlice.call(arguments));
    return this instanceof bound ? construct(fn, args.length, args) : _invoke(fn, args, that);
  };

  if (_isObject(fn.prototype)) bound.prototype = fn.prototype;
  return bound;
};

// 19.2.3.2 / 15.3.4.5 Function.prototype.bind(thisArg, args...)


_export(_export.P, 'Function', {
  bind: _bind
});

var dP$2 = _objectDp.f;

var FProto = Function.prototype;
var nameRE = /^\s*function ([^ (]*)/;
var NAME = 'name'; // 19.2.4.2 name

NAME in FProto || _descriptors && dP$2(FProto, NAME, {
  configurable: true,
  get: function () {
    try {
      return ('' + this).match(nameRE)[1];
    } catch (e) {
      return '';
    }
  }
});

var HAS_INSTANCE = _wks('hasInstance');

var FunctionProto = Function.prototype; // 19.2.3.6 Function.prototype[@@hasInstance](V)

if (!(HAS_INSTANCE in FunctionProto)) _objectDp.f(FunctionProto, HAS_INSTANCE, {
  value: function (O) {
    if (typeof this != 'function' || !_isObject(O)) return false;
    if (!_isObject(this.prototype)) return O instanceof this; // for environment w/o native `@@hasInstance` logic enough `instanceof`, but add this:

    while (O = _objectGpo(O)) if (this.prototype === O) return true;

    return false;
  }
});

var _stringWs = '\x09\x0A\x0B\x0C\x0D\x20\xA0\u1680\u180E\u2000\u2001\u2002\u2003' + '\u2004\u2005\u2006\u2007\u2008\u2009\u200A\u202F\u205F\u3000\u2028\u2029\uFEFF';

var space = '[' + _stringWs + ']';
var non = '\u200b\u0085';
var ltrim = RegExp('^' + space + space + '*');
var rtrim = RegExp(space + space + '*$');

var exporter = function (KEY, exec, ALIAS) {
  var exp = {};
  var FORCE = _fails(function () {
    return !!_stringWs[KEY]() || non[KEY]() != non;
  });
  var fn = exp[KEY] = FORCE ? exec(trim) : _stringWs[KEY];
  if (ALIAS) exp[ALIAS] = fn;
  _export(_export.P + _export.F * FORCE, 'String', exp);
}; // 1 -> String#trimLeft
// 2 -> String#trimRight
// 3 -> String#trim


var trim = exporter.trim = function (string, TYPE) {
  string = String(_defined(string));
  if (TYPE & 1) string = string.replace(ltrim, '');
  if (TYPE & 2) string = string.replace(rtrim, '');
  return string;
};

var _stringTrim = exporter;

var $parseInt = _global.parseInt;

var $trim = _stringTrim.trim;



var hex = /^[-+]?0[xX]/;
var _parseInt = $parseInt(_stringWs + '08') !== 8 || $parseInt(_stringWs + '0x16') !== 22 ? function parseInt(str, radix) {
  var string = $trim(String(str), 3);
  return $parseInt(string, radix >>> 0 || (hex.test(string) ? 16 : 10));
} : $parseInt;

// 18.2.5 parseInt(string, radix)


_export(_export.G + _export.F * (parseInt != _parseInt), {
  parseInt: _parseInt
});

var $parseFloat = _global.parseFloat;

var $trim$1 = _stringTrim.trim;

var _parseFloat = 1 / $parseFloat(_stringWs + '-0') !== -Infinity ? function parseFloat(str) {
  var string = $trim$1(String(str), 3);
  var result = $parseFloat(string);
  return result === 0 && string.charAt(0) == '-' ? -0 : result;
} : $parseFloat;

// 18.2.4 parseFloat(string)


_export(_export.G + _export.F * (parseFloat != _parseFloat), {
  parseFloat: _parseFloat
});

var setPrototypeOf = _setProto.set;

var _inheritIfRequired = function (that, target, C) {
  var S = target.constructor;
  var P;

  if (S !== C && typeof S == 'function' && (P = S.prototype) !== C.prototype && _isObject(P) && setPrototypeOf) {
    setPrototypeOf(that, P);
  }

  return that;
};

var gOPN$2 = _objectGopn.f;

var gOPD$2 = _objectGopd.f;

var dP$3 = _objectDp.f;

var $trim$2 = _stringTrim.trim;

var NUMBER = 'Number';
var $Number = _global[NUMBER];
var Base = $Number;
var proto = $Number.prototype; // Opera ~12 has broken Object#toString

var BROKEN_COF = _cof(_objectCreate(proto)) == NUMBER;
var TRIM = 'trim' in String.prototype; // 7.1.3 ToNumber(argument)

var toNumber = function (argument) {
  var it = _toPrimitive(argument, false);

  if (typeof it == 'string' && it.length > 2) {
    it = TRIM ? it.trim() : $trim$2(it, 3);
    var first = it.charCodeAt(0);
    var third, radix, maxCode;

    if (first === 43 || first === 45) {
      third = it.charCodeAt(2);
      if (third === 88 || third === 120) return NaN; // Number('+0x1') should be NaN, old V8 fix
    } else if (first === 48) {
      switch (it.charCodeAt(1)) {
        case 66:
        case 98:
          radix = 2;
          maxCode = 49;
          break;
        // fast equal /^0b[01]+$/i

        case 79:
        case 111:
          radix = 8;
          maxCode = 55;
          break;
        // fast equal /^0o[0-7]+$/i

        default:
          return +it;
      }

      for (var digits = it.slice(2), i = 0, l = digits.length, code; i < l; i++) {
        code = digits.charCodeAt(i); // parseInt parses a string to a first unavailable symbol
        // but ToNumber should return NaN if a string contains unavailable symbols

        if (code < 48 || code > maxCode) return NaN;
      }

      return parseInt(digits, radix);
    }
  }

  return +it;
};

if (!$Number(' 0o1') || !$Number('0b1') || $Number('+0x1')) {
  $Number = function Number(value) {
    var it = arguments.length < 1 ? 0 : value;
    var that = this;
    return that instanceof $Number // check on 1..constructor(foo) case
    && (BROKEN_COF ? _fails(function () {
      proto.valueOf.call(that);
    }) : _cof(that) != NUMBER) ? _inheritIfRequired(new Base(toNumber(it)), that, $Number) : toNumber(it);
  };

  for (var keys = _descriptors ? gOPN$2(Base) : ( // ES3:
  'MAX_VALUE,MIN_VALUE,NaN,NEGATIVE_INFINITY,POSITIVE_INFINITY,' + // ES6 (in case, if modules with ES6 Number statics required before):
  'EPSILON,isFinite,isInteger,isNaN,isSafeInteger,MAX_SAFE_INTEGER,' + 'MIN_SAFE_INTEGER,parseFloat,parseInt,isInteger').split(','), j$1 = 0, key; keys.length > j$1; j$1++) {
    if (_has(Base, key = keys[j$1]) && !_has($Number, key)) {
      dP$3($Number, key, gOPD$2(Base, key));
    }
  }

  $Number.prototype = proto;
  proto.constructor = $Number;

  _redefine(_global, NUMBER, $Number);
}

var _aNumberValue = function (it, msg) {
  if (typeof it != 'number' && _cof(it) != 'Number') throw TypeError(msg);
  return +it;
};

var _stringRepeat = function repeat(count) {
  var str = String(_defined(this));
  var res = '';
  var n = _toInteger(count);
  if (n < 0 || n == Infinity) throw RangeError("Count can't be negative");

  for (; n > 0; (n >>>= 1) && (str += str)) if (n & 1) res += str;

  return res;
};

var $toFixed = 1.0.toFixed;
var floor$1 = Math.floor;
var data = [0, 0, 0, 0, 0, 0];
var ERROR = 'Number.toFixed: incorrect invocation!';
var ZERO = '0';

var multiply = function (n, c) {
  var i = -1;
  var c2 = c;

  while (++i < 6) {
    c2 += n * data[i];
    data[i] = c2 % 1e7;
    c2 = floor$1(c2 / 1e7);
  }
};

var divide = function (n) {
  var i = 6;
  var c = 0;

  while (--i >= 0) {
    c += data[i];
    data[i] = floor$1(c / n);
    c = c % n * 1e7;
  }
};

var numToString = function () {
  var i = 6;
  var s = '';

  while (--i >= 0) {
    if (s !== '' || i === 0 || data[i] !== 0) {
      var t = String(data[i]);
      s = s === '' ? t : s + _stringRepeat.call(ZERO, 7 - t.length) + t;
    }
  }

  return s;
};

var pow = function (x, n, acc) {
  return n === 0 ? acc : n % 2 === 1 ? pow(x, n - 1, acc * x) : pow(x * x, n / 2, acc);
};

var log = function (x) {
  var n = 0;
  var x2 = x;

  while (x2 >= 4096) {
    n += 12;
    x2 /= 4096;
  }

  while (x2 >= 2) {
    n += 1;
    x2 /= 2;
  }

  return n;
};

_export(_export.P + _export.F * (!!$toFixed && (0.00008.toFixed(3) !== '0.000' || 0.9.toFixed(0) !== '1' || 1.255.toFixed(2) !== '1.25' || 1000000000000000128.0.toFixed(0) !== '1000000000000000128') || !_fails(function () {
  // V8 ~ Android 4.3-
  $toFixed.call({});
})), 'Number', {
  toFixed: function toFixed(fractionDigits) {
    var x = _aNumberValue(this, ERROR);
    var f = _toInteger(fractionDigits);
    var s = '';
    var m = ZERO;
    var e, z, j, k;
    if (f < 0 || f > 20) throw RangeError(ERROR); // eslint-disable-next-line no-self-compare

    if (x != x) return 'NaN';
    if (x <= -1e21 || x >= 1e21) return String(x);

    if (x < 0) {
      s = '-';
      x = -x;
    }

    if (x > 1e-21) {
      e = log(x * pow(2, 69, 1)) - 69;
      z = e < 0 ? x * pow(2, -e, 1) : x / pow(2, e, 1);
      z *= 0x10000000000000;
      e = 52 - e;

      if (e > 0) {
        multiply(0, z);
        j = f;

        while (j >= 7) {
          multiply(1e7, 0);
          j -= 7;
        }

        multiply(pow(10, j, 1), 0);
        j = e - 1;

        while (j >= 23) {
          divide(1 << 23);
          j -= 23;
        }

        divide(1 << j);
        multiply(1, 1);
        divide(2);
        m = numToString();
      } else {
        multiply(0, z);
        multiply(1 << -e, 0);
        m = numToString() + _stringRepeat.call(ZERO, f);
      }
    }

    if (f > 0) {
      k = m.length;
      m = s + (k <= f ? '0.' + _stringRepeat.call(ZERO, f - k) + m : m.slice(0, k - f) + '.' + m.slice(k - f));
    } else {
      m = s + m;
    }

    return m;
  }
});

var $toPrecision = 1.0.toPrecision;
_export(_export.P + _export.F * (_fails(function () {
  // IE7-
  return $toPrecision.call(1, undefined) !== '1';
}) || !_fails(function () {
  // V8 ~ Android 4.3-
  $toPrecision.call({});
})), 'Number', {
  toPrecision: function toPrecision(precision) {
    var that = _aNumberValue(this, 'Number#toPrecision: incorrect invocation!');
    return precision === undefined ? $toPrecision.call(that) : $toPrecision.call(that, precision);
  }
});

// 20.1.2.1 Number.EPSILON


_export(_export.S, 'Number', {
  EPSILON: Math.pow(2, -52)
});

// 20.1.2.2 Number.isFinite(number)


var _isFinite = _global.isFinite;

_export(_export.S, 'Number', {
  isFinite: function isFinite(it) {
    return typeof it == 'number' && _isFinite(it);
  }
});

// 20.1.2.3 Number.isInteger(number)


var floor$2 = Math.floor;

var _isInteger = function isInteger(it) {
  return !_isObject(it) && isFinite(it) && floor$2(it) === it;
};

// 20.1.2.3 Number.isInteger(number)


_export(_export.S, 'Number', {
  isInteger: _isInteger
});

// 20.1.2.4 Number.isNaN(number)


_export(_export.S, 'Number', {
  isNaN: function isNaN(number) {
    // eslint-disable-next-line no-self-compare
    return number != number;
  }
});

// 20.1.2.5 Number.isSafeInteger(number)




var abs = Math.abs;
_export(_export.S, 'Number', {
  isSafeInteger: function isSafeInteger(number) {
    return _isInteger(number) && abs(number) <= 0x1fffffffffffff;
  }
});

// 20.1.2.6 Number.MAX_SAFE_INTEGER


_export(_export.S, 'Number', {
  MAX_SAFE_INTEGER: 0x1fffffffffffff
});

// 20.1.2.10 Number.MIN_SAFE_INTEGER


_export(_export.S, 'Number', {
  MIN_SAFE_INTEGER: -0x1fffffffffffff
});

// 20.1.2.12 Number.parseFloat(string)


_export(_export.S + _export.F * (Number.parseFloat != _parseFloat), 'Number', {
  parseFloat: _parseFloat
});

// 20.1.2.13 Number.parseInt(string, radix)


_export(_export.S + _export.F * (Number.parseInt != _parseInt), 'Number', {
  parseInt: _parseInt
});

// 20.2.2.20 Math.log1p(x)
var _mathLog1p = Math.log1p || function log1p(x) {
  return (x = +x) > -1e-8 && x < 1e-8 ? x - x * x / 2 : Math.log(1 + x);
};

// 20.2.2.3 Math.acosh(x)




var sqrt = Math.sqrt;
var $acosh = Math.acosh;
_export(_export.S + _export.F * !($acosh // V8 bug: https://code.google.com/p/v8/issues/detail?id=3509
&& Math.floor($acosh(Number.MAX_VALUE)) == 710 // Tor Browser bug: Math.acosh(Infinity) -> NaN
&& $acosh(Infinity) == Infinity), 'Math', {
  acosh: function acosh(x) {
    return (x = +x) < 1 ? NaN : x > 94906265.62425156 ? Math.log(x) + Math.LN2 : _mathLog1p(x - 1 + sqrt(x - 1) * sqrt(x + 1));
  }
});

// 20.2.2.5 Math.asinh(x)


var $asinh = Math.asinh;

function asinh(x) {
  return !isFinite(x = +x) || x == 0 ? x : x < 0 ? -asinh(-x) : Math.log(x + Math.sqrt(x * x + 1));
} // Tor Browser bug: Math.asinh(0) -> -0


_export(_export.S + _export.F * !($asinh && 1 / $asinh(0) > 0), 'Math', {
  asinh: asinh
});

// 20.2.2.7 Math.atanh(x)


var $atanh = Math.atanh; // Tor Browser bug: Math.atanh(-0) -> 0

_export(_export.S + _export.F * !($atanh && 1 / $atanh(-0) < 0), 'Math', {
  atanh: function atanh(x) {
    return (x = +x) == 0 ? x : Math.log((1 + x) / (1 - x)) / 2;
  }
});

// 20.2.2.28 Math.sign(x)
var _mathSign = Math.sign || function sign(x) {
  // eslint-disable-next-line no-self-compare
  return (x = +x) == 0 || x != x ? x : x < 0 ? -1 : 1;
};

// 20.2.2.9 Math.cbrt(x)




_export(_export.S, 'Math', {
  cbrt: function cbrt(x) {
    return _mathSign(x = +x) * Math.pow(Math.abs(x), 1 / 3);
  }
});

// 20.2.2.11 Math.clz32(x)


_export(_export.S, 'Math', {
  clz32: function clz32(x) {
    return (x >>>= 0) ? 31 - Math.floor(Math.log(x + 0.5) * Math.LOG2E) : 32;
  }
});

// 20.2.2.12 Math.cosh(x)


var exp = Math.exp;
_export(_export.S, 'Math', {
  cosh: function cosh(x) {
    return (exp(x = +x) + exp(-x)) / 2;
  }
});

// 20.2.2.14 Math.expm1(x)
var $expm1 = Math.expm1;
var _mathExpm1 = !$expm1 // Old FF bug
|| $expm1(10) > 22025.465794806719 || $expm1(10) < 22025.4657948067165168 // Tor Browser bug
|| $expm1(-2e-17) != -2e-17 ? function expm1(x) {
  return (x = +x) == 0 ? x : x > -1e-6 && x < 1e-6 ? x + x * x / 2 : Math.exp(x) - 1;
} : $expm1;

// 20.2.2.14 Math.expm1(x)




_export(_export.S + _export.F * (_mathExpm1 != Math.expm1), 'Math', {
  expm1: _mathExpm1
});

// 20.2.2.16 Math.fround(x)


var pow$1 = Math.pow;
var EPSILON = pow$1(2, -52);
var EPSILON32 = pow$1(2, -23);
var MAX32 = pow$1(2, 127) * (2 - EPSILON32);
var MIN32 = pow$1(2, -126);

var roundTiesToEven = function (n) {
  return n + 1 / EPSILON - 1 / EPSILON;
};

var _mathFround = Math.fround || function fround(x) {
  var $abs = Math.abs(x);
  var $sign = _mathSign(x);
  var a, result;
  if ($abs < MIN32) return $sign * roundTiesToEven($abs / MIN32 / EPSILON32) * MIN32 * EPSILON32;
  a = (1 + EPSILON32 / EPSILON) * $abs;
  result = a - (a - $abs); // eslint-disable-next-line no-self-compare

  if (result > MAX32 || result != result) return $sign * Infinity;
  return $sign * result;
};

// 20.2.2.16 Math.fround(x)


_export(_export.S, 'Math', {
  fround: _mathFround
});

// 20.2.2.17 Math.hypot([value1[, value2[, … ]]])


var abs$1 = Math.abs;
_export(_export.S, 'Math', {
  hypot: function hypot(value1, value2) {
    // eslint-disable-line no-unused-vars
    var sum = 0;
    var i = 0;
    var aLen = arguments.length;
    var larg = 0;
    var arg, div;

    while (i < aLen) {
      arg = abs$1(arguments[i++]);

      if (larg < arg) {
        div = larg / arg;
        sum = sum * div * div + 1;
        larg = arg;
      } else if (arg > 0) {
        div = arg / larg;
        sum += div * div;
      } else sum += arg;
    }

    return larg === Infinity ? Infinity : larg * Math.sqrt(sum);
  }
});

// 20.2.2.18 Math.imul(x, y)


var $imul = Math.imul; // some WebKit versions fails with big numbers, some has wrong arity

_export(_export.S + _export.F * _fails(function () {
  return $imul(0xffffffff, 5) != -5 || $imul.length != 2;
}), 'Math', {
  imul: function imul(x, y) {
    var UINT16 = 0xffff;
    var xn = +x;
    var yn = +y;
    var xl = UINT16 & xn;
    var yl = UINT16 & yn;
    return 0 | xl * yl + ((UINT16 & xn >>> 16) * yl + xl * (UINT16 & yn >>> 16) << 16 >>> 0);
  }
});

// 20.2.2.21 Math.log10(x)


_export(_export.S, 'Math', {
  log10: function log10(x) {
    return Math.log(x) * Math.LOG10E;
  }
});

// 20.2.2.20 Math.log1p(x)


_export(_export.S, 'Math', {
  log1p: _mathLog1p
});

// 20.2.2.22 Math.log2(x)


_export(_export.S, 'Math', {
  log2: function log2(x) {
    return Math.log(x) / Math.LN2;
  }
});

// 20.2.2.28 Math.sign(x)


_export(_export.S, 'Math', {
  sign: _mathSign
});

// 20.2.2.30 Math.sinh(x)




var exp$1 = Math.exp; // V8 near Chromium 38 has a problem with very small numbers

_export(_export.S + _export.F * _fails(function () {
  return !Math.sinh(-2e-17) != -2e-17;
}), 'Math', {
  sinh: function sinh(x) {
    return Math.abs(x = +x) < 1 ? (_mathExpm1(x) - _mathExpm1(-x)) / 2 : (exp$1(x - 1) - exp$1(-x - 1)) * (Math.E / 2);
  }
});

// 20.2.2.33 Math.tanh(x)




var exp$2 = Math.exp;
_export(_export.S, 'Math', {
  tanh: function tanh(x) {
    var a = _mathExpm1(x = +x);
    var b = _mathExpm1(-x);
    return a == Infinity ? 1 : b == Infinity ? -1 : (a - b) / (exp$2(x) + exp$2(-x));
  }
});

// 20.2.2.34 Math.trunc(x)


_export(_export.S, 'Math', {
  trunc: function trunc(it) {
    return (it > 0 ? Math.floor : Math.ceil)(it);
  }
});

var fromCharCode = String.fromCharCode;
var $fromCodePoint = String.fromCodePoint; // length should be 1, old FF problem

_export(_export.S + _export.F * (!!$fromCodePoint && $fromCodePoint.length != 1), 'String', {
  // 21.1.2.2 String.fromCodePoint(...codePoints)
  fromCodePoint: function fromCodePoint(x) {
    // eslint-disable-line no-unused-vars
    var res = [];
    var aLen = arguments.length;
    var i = 0;
    var code;

    while (aLen > i) {
      code = +arguments[i++];
      if (_toAbsoluteIndex(code, 0x10ffff) !== code) throw RangeError(code + ' is not a valid code point');
      res.push(code < 0x10000 ? fromCharCode(code) : fromCharCode(((code -= 0x10000) >> 10) + 0xd800, code % 0x400 + 0xdc00));
    }

    return res.join('');
  }
});

_export(_export.S, 'String', {
  // 21.1.2.4 String.raw(callSite, ...substitutions)
  raw: function raw(callSite) {
    var tpl = _toIobject(callSite.raw);
    var len = _toLength(tpl.length);
    var aLen = arguments.length;
    var res = [];
    var i = 0;

    while (len > i) {
      res.push(String(tpl[i++]));
      if (i < aLen) res.push(String(arguments[i]));
    }

    return res.join('');
  }
});

_stringTrim('trim', function ($trim) {
  return function trim() {
    return $trim(this, 3);
  };
});

// true  -> String#at
// false -> String#codePointAt


var _stringAt = function (TO_STRING) {
  return function (that, pos) {
    var s = String(_defined(that));
    var i = _toInteger(pos);
    var l = s.length;
    var a, b;
    if (i < 0 || i >= l) return TO_STRING ? '' : undefined;
    a = s.charCodeAt(i);
    return a < 0xd800 || a > 0xdbff || i + 1 === l || (b = s.charCodeAt(i + 1)) < 0xdc00 || b > 0xdfff ? TO_STRING ? s.charAt(i) : a : TO_STRING ? s.slice(i, i + 2) : (a - 0xd800 << 10) + (b - 0xdc00) + 0x10000;
  };
};

var _iterators = {};

var IteratorPrototype = {}; // 25.1.2.1.1 %IteratorPrototype%[@@iterator]()

_hide(IteratorPrototype, _wks('iterator'), function () {
  return this;
});

var _iterCreate = function (Constructor, NAME, next) {
  Constructor.prototype = _objectCreate(IteratorPrototype, {
    next: _propertyDesc(1, next)
  });
  _setToStringTag(Constructor, NAME + ' Iterator');
};

var ITERATOR = _wks('iterator');

var BUGGY = !([].keys && 'next' in [].keys()); // Safari has buggy iterators w/o `next`

var FF_ITERATOR = '@@iterator';
var KEYS = 'keys';
var VALUES = 'values';

var returnThis = function () {
  return this;
};

var _iterDefine = function (Base, NAME, Constructor, next, DEFAULT, IS_SET, FORCED) {
  _iterCreate(Constructor, NAME, next);

  var getMethod = function (kind) {
    if (!BUGGY && kind in proto) return proto[kind];

    switch (kind) {
      case KEYS:
        return function keys() {
          return new Constructor(this, kind);
        };

      case VALUES:
        return function values() {
          return new Constructor(this, kind);
        };
    }

    return function entries() {
      return new Constructor(this, kind);
    };
  };

  var TAG = NAME + ' Iterator';
  var DEF_VALUES = DEFAULT == VALUES;
  var VALUES_BUG = false;
  var proto = Base.prototype;
  var $native = proto[ITERATOR] || proto[FF_ITERATOR] || DEFAULT && proto[DEFAULT];
  var $default = $native || getMethod(DEFAULT);
  var $entries = DEFAULT ? !DEF_VALUES ? $default : getMethod('entries') : undefined;
  var $anyNative = NAME == 'Array' ? proto.entries || $native : $native;
  var methods, key, IteratorPrototype; // Fix native

  if ($anyNative) {
    IteratorPrototype = _objectGpo($anyNative.call(new Base()));

    if (IteratorPrototype !== Object.prototype && IteratorPrototype.next) {
      // Set @@toStringTag to native iterators
      _setToStringTag(IteratorPrototype, TAG, true); // fix for some old engines

      if ( typeof IteratorPrototype[ITERATOR] != 'function') _hide(IteratorPrototype, ITERATOR, returnThis);
    }
  } // fix Array#{values, @@iterator}.name in V8 / FF


  if (DEF_VALUES && $native && $native.name !== VALUES) {
    VALUES_BUG = true;

    $default = function values() {
      return $native.call(this);
    };
  } // Define iterator


  if ( (BUGGY || VALUES_BUG || !proto[ITERATOR])) {
    _hide(proto, ITERATOR, $default);
  } // Plug for library


  _iterators[NAME] = $default;
  _iterators[TAG] = returnThis;

  if (DEFAULT) {
    methods = {
      values: DEF_VALUES ? $default : getMethod(VALUES),
      keys: IS_SET ? $default : getMethod(KEYS),
      entries: $entries
    };
    if (FORCED) for (key in methods) {
      if (!(key in proto)) _redefine(proto, key, methods[key]);
    } else _export(_export.P + _export.F * (BUGGY || VALUES_BUG), NAME, methods);
  }

  return methods;
};

var $at = _stringAt(true); // 21.1.3.27 String.prototype[@@iterator]()


_iterDefine(String, 'String', function (iterated) {
  this._t = String(iterated); // target

  this._i = 0; // next index
  // 21.1.5.2.1 %StringIteratorPrototype%.next()
}, function () {
  var O = this._t;
  var index = this._i;
  var point;
  if (index >= O.length) return {
    value: undefined,
    done: true
  };
  point = $at(O, index);
  this._i += point.length;
  return {
    value: point,
    done: false
  };
});

var $at$1 = _stringAt(false);

_export(_export.P, 'String', {
  // 21.1.3.3 String.prototype.codePointAt(pos)
  codePointAt: function codePointAt(pos) {
    return $at$1(this, pos);
  }
});

// 7.2.8 IsRegExp(argument)




var MATCH = _wks('match');

var _isRegexp = function (it) {
  var isRegExp;
  return _isObject(it) && ((isRegExp = it[MATCH]) !== undefined ? !!isRegExp : _cof(it) == 'RegExp');
};

// helper for String#{startsWith, endsWith, includes}




var _stringContext = function (that, searchString, NAME) {
  if (_isRegexp(searchString)) throw TypeError('String#' + NAME + " doesn't accept regex!");
  return String(_defined(that));
};

var MATCH$1 = _wks('match');

var _failsIsRegexp = function (KEY) {
  var re = /./;

  try {
    '/./'[KEY](re);
  } catch (e) {
    try {
      re[MATCH$1] = false;
      return !'/./'[KEY](re);
    } catch (f) {
      /* empty */
    }
  }

  return true;
};

var ENDS_WITH = 'endsWith';
var $endsWith = ''[ENDS_WITH];
_export(_export.P + _export.F * _failsIsRegexp(ENDS_WITH), 'String', {
  endsWith: function endsWith(searchString
  /* , endPosition = @length */
  ) {
    var that = _stringContext(this, searchString, ENDS_WITH);
    var endPosition = arguments.length > 1 ? arguments[1] : undefined;
    var len = _toLength(that.length);
    var end = endPosition === undefined ? len : Math.min(_toLength(endPosition), len);
    var search = String(searchString);
    return $endsWith ? $endsWith.call(that, search, end) : that.slice(end - search.length, end) === search;
  }
});

var INCLUDES = 'includes';
_export(_export.P + _export.F * _failsIsRegexp(INCLUDES), 'String', {
  includes: function includes(searchString
  /* , position = 0 */
  ) {
    return !!~_stringContext(this, searchString, INCLUDES).indexOf(searchString, arguments.length > 1 ? arguments[1] : undefined);
  }
});

_export(_export.P, 'String', {
  // 21.1.3.13 String.prototype.repeat(count)
  repeat: _stringRepeat
});

var STARTS_WITH = 'startsWith';
var $startsWith = ''[STARTS_WITH];
_export(_export.P + _export.F * _failsIsRegexp(STARTS_WITH), 'String', {
  startsWith: function startsWith(searchString
  /* , position = 0 */
  ) {
    var that = _stringContext(this, searchString, STARTS_WITH);
    var index = _toLength(Math.min(arguments.length > 1 ? arguments[1] : undefined, that.length));
    var search = String(searchString);
    return $startsWith ? $startsWith.call(that, search, index) : that.slice(index, index + search.length) === search;
  }
});

var quot = /"/g; // B.2.3.2.1 CreateHTML(string, tag, attribute, value)

var createHTML = function (string, tag, attribute, value) {
  var S = String(_defined(string));
  var p1 = '<' + tag;
  if (attribute !== '') p1 += ' ' + attribute + '="' + String(value).replace(quot, '&quot;') + '"';
  return p1 + '>' + S + '</' + tag + '>';
};

var _stringHtml = function (NAME, exec) {
  var O = {};
  O[NAME] = exec(createHTML);
  _export(_export.P + _export.F * _fails(function () {
    var test = ''[NAME]('"');
    return test !== test.toLowerCase() || test.split('"').length > 3;
  }), 'String', O);
};

_stringHtml('anchor', function (createHTML) {
  return function anchor(name) {
    return createHTML(this, 'a', 'name', name);
  };
});

_stringHtml('big', function (createHTML) {
  return function big() {
    return createHTML(this, 'big', '', '');
  };
});

_stringHtml('blink', function (createHTML) {
  return function blink() {
    return createHTML(this, 'blink', '', '');
  };
});

_stringHtml('bold', function (createHTML) {
  return function bold() {
    return createHTML(this, 'b', '', '');
  };
});

_stringHtml('fixed', function (createHTML) {
  return function fixed() {
    return createHTML(this, 'tt', '', '');
  };
});

_stringHtml('fontcolor', function (createHTML) {
  return function fontcolor(color) {
    return createHTML(this, 'font', 'color', color);
  };
});

_stringHtml('fontsize', function (createHTML) {
  return function fontsize(size) {
    return createHTML(this, 'font', 'size', size);
  };
});

_stringHtml('italics', function (createHTML) {
  return function italics() {
    return createHTML(this, 'i', '', '');
  };
});

_stringHtml('link', function (createHTML) {
  return function link(url) {
    return createHTML(this, 'a', 'href', url);
  };
});

_stringHtml('small', function (createHTML) {
  return function small() {
    return createHTML(this, 'small', '', '');
  };
});

_stringHtml('strike', function (createHTML) {
  return function strike() {
    return createHTML(this, 'strike', '', '');
  };
});

_stringHtml('sub', function (createHTML) {
  return function sub() {
    return createHTML(this, 'sub', '', '');
  };
});

_stringHtml('sup', function (createHTML) {
  return function sup() {
    return createHTML(this, 'sup', '', '');
  };
});

// 20.3.3.1 / 15.9.4.4 Date.now()


_export(_export.S, 'Date', {
  now: function () {
    return new Date().getTime();
  }
});

_export(_export.P + _export.F * _fails(function () {
  return new Date(NaN).toJSON() !== null || Date.prototype.toJSON.call({
    toISOString: function () {
      return 1;
    }
  }) !== 1;
}), 'Date', {
  // eslint-disable-next-line no-unused-vars
  toJSON: function toJSON(key) {
    var O = _toObject(this);
    var pv = _toPrimitive(O);
    return typeof pv == 'number' && !isFinite(pv) ? null : O.toISOString();
  }
});

var getTime = Date.prototype.getTime;
var $toISOString = Date.prototype.toISOString;

var lz = function (num) {
  return num > 9 ? num : '0' + num;
}; // PhantomJS / old WebKit has a broken implementations


var _dateToIsoString = _fails(function () {
  return $toISOString.call(new Date(-5e13 - 1)) != '0385-07-25T07:06:39.999Z';
}) || !_fails(function () {
  $toISOString.call(new Date(NaN));
}) ? function toISOString() {
  if (!isFinite(getTime.call(this))) throw RangeError('Invalid time value');
  var d = this;
  var y = d.getUTCFullYear();
  var m = d.getUTCMilliseconds();
  var s = y < 0 ? '-' : y > 9999 ? '+' : '';
  return s + ('00000' + Math.abs(y)).slice(s ? -6 : -4) + '-' + lz(d.getUTCMonth() + 1) + '-' + lz(d.getUTCDate()) + 'T' + lz(d.getUTCHours()) + ':' + lz(d.getUTCMinutes()) + ':' + lz(d.getUTCSeconds()) + '.' + (m > 99 ? m : '0' + lz(m)) + 'Z';
} : $toISOString;

// 20.3.4.36 / 15.9.5.43 Date.prototype.toISOString()


 // PhantomJS / old WebKit has a broken implementations


_export(_export.P + _export.F * (Date.prototype.toISOString !== _dateToIsoString), 'Date', {
  toISOString: _dateToIsoString
});

var DateProto = Date.prototype;
var INVALID_DATE = 'Invalid Date';
var TO_STRING = 'toString';
var $toString = DateProto[TO_STRING];
var getTime$1 = DateProto.getTime;

if (new Date(NaN) + '' != INVALID_DATE) {
  _redefine(DateProto, TO_STRING, function toString() {
    var value = getTime$1.call(this); // eslint-disable-next-line no-self-compare

    return value === value ? $toString.call(this) : INVALID_DATE;
  });
}

var NUMBER$1 = 'number';

var _dateToPrimitive = function (hint) {
  if (hint !== 'string' && hint !== NUMBER$1 && hint !== 'default') throw TypeError('Incorrect hint');
  return _toPrimitive(_anObject(this), hint != NUMBER$1);
};

var TO_PRIMITIVE$1 = _wks('toPrimitive');

var proto$1 = Date.prototype;
if (!(TO_PRIMITIVE$1 in proto$1)) _hide(proto$1, TO_PRIMITIVE$1, _dateToPrimitive);

// 22.1.2.2 / 15.4.3.2 Array.isArray(arg)


_export(_export.S, 'Array', {
  isArray: _isArray
});

// call something on iterator step with safe closing on error


var _iterCall = function (iterator, fn, value, entries) {
  try {
    return entries ? fn(_anObject(value)[0], value[1]) : fn(value); // 7.4.6 IteratorClose(iterator, completion)
  } catch (e) {
    var ret = iterator['return'];
    if (ret !== undefined) _anObject(ret.call(iterator));
    throw e;
  }
};

// check on default Array iterator


var ITERATOR$1 = _wks('iterator');

var ArrayProto = Array.prototype;

var _isArrayIter = function (it) {
  return it !== undefined && (_iterators.Array === it || ArrayProto[ITERATOR$1] === it);
};

var _createProperty = function (object, index, value) {
  if (index in object) _objectDp.f(object, index, _propertyDesc(0, value));else object[index] = value;
};

var ITERATOR$2 = _wks('iterator');



var core_getIteratorMethod = _core.getIteratorMethod = function (it) {
  if (it != undefined) return it[ITERATOR$2] || it['@@iterator'] || _iterators[_classof(it)];
};

var ITERATOR$3 = _wks('iterator');

var SAFE_CLOSING = false;

try {
  var riter = [7][ITERATOR$3]();

  riter['return'] = function () {
    SAFE_CLOSING = true;
  }; // eslint-disable-next-line no-throw-literal


  Array.from(riter, function () {
    throw 2;
  });
} catch (e) {
  /* empty */
}

var _iterDetect = function (exec, skipClosing) {
  if (!skipClosing && !SAFE_CLOSING) return false;
  var safe = false;

  try {
    var arr = [7];
    var iter = arr[ITERATOR$3]();

    iter.next = function () {
      return {
        done: safe = true
      };
    };

    arr[ITERATOR$3] = function () {
      return iter;
    };

    exec(arr);
  } catch (e) {
    /* empty */
  }

  return safe;
};

_export(_export.S + _export.F * !_iterDetect(function (iter) {
  Array.from(iter);
}), 'Array', {
  // 22.1.2.1 Array.from(arrayLike, mapfn = undefined, thisArg = undefined)
  from: function from(arrayLike
  /* , mapfn = undefined, thisArg = undefined */
  ) {
    var O = _toObject(arrayLike);
    var C = typeof this == 'function' ? this : Array;
    var aLen = arguments.length;
    var mapfn = aLen > 1 ? arguments[1] : undefined;
    var mapping = mapfn !== undefined;
    var index = 0;
    var iterFn = core_getIteratorMethod(O);
    var length, result, step, iterator;
    if (mapping) mapfn = _ctx(mapfn, aLen > 2 ? arguments[2] : undefined, 2); // if object isn't iterable or it's array with default iterator - use simple case

    if (iterFn != undefined && !(C == Array && _isArrayIter(iterFn))) {
      for (iterator = iterFn.call(O), result = new C(); !(step = iterator.next()).done; index++) {
        _createProperty(result, index, mapping ? _iterCall(iterator, mapfn, [step.value, index], true) : step.value);
      }
    } else {
      length = _toLength(O.length);

      for (result = new C(length); length > index; index++) {
        _createProperty(result, index, mapping ? mapfn(O[index], index) : O[index]);
      }
    }

    result.length = index;
    return result;
  }
});

// WebKit Array.of isn't generic


_export(_export.S + _export.F * _fails(function () {
  function F() {
    /* empty */
  }

  return !(Array.of.call(F) instanceof F);
}), 'Array', {
  // 22.1.2.3 Array.of( ...items)
  of: function of()
  /* ...args */
  {
    var index = 0;
    var aLen = arguments.length;
    var result = new (typeof this == 'function' ? this : Array)(aLen);

    while (aLen > index) _createProperty(result, index, arguments[index++]);

    result.length = aLen;
    return result;
  }
});

var _strictMethod = function (method, arg) {
  return !!method && _fails(function () {
    // eslint-disable-next-line no-useless-call
    arg ? method.call(null, function () {
      /* empty */
    }, 1) : method.call(null);
  });
};

var arrayJoin = [].join; // fallback for not array-like strings

_export(_export.P + _export.F * (_iobject != Object || !_strictMethod(arrayJoin)), 'Array', {
  join: function join(separator) {
    return arrayJoin.call(_toIobject(this), separator === undefined ? ',' : separator);
  }
});

var arraySlice$1 = [].slice; // fallback for not array-like ES3 strings and DOM objects

_export(_export.P + _export.F * _fails(function () {
  if (_html) arraySlice$1.call(_html);
}), 'Array', {
  slice: function slice(begin, end) {
    var len = _toLength(this.length);
    var klass = _cof(this);
    end = end === undefined ? len : end;
    if (klass == 'Array') return arraySlice$1.call(this, begin, end);
    var start = _toAbsoluteIndex(begin, len);
    var upTo = _toAbsoluteIndex(end, len);
    var size = _toLength(upTo - start);
    var cloned = new Array(size);
    var i = 0;

    for (; i < size; i++) cloned[i] = klass == 'String' ? this.charAt(start + i) : this[start + i];

    return cloned;
  }
});

var $sort = [].sort;
var test$1 = [1, 2, 3];
_export(_export.P + _export.F * (_fails(function () {
  // IE8-
  test$1.sort(undefined);
}) || !_fails(function () {
  // V8 bug
  test$1.sort(null); // Old WebKit
}) || !_strictMethod($sort)), 'Array', {
  // 22.1.3.25 Array.prototype.sort(comparefn)
  sort: function sort(comparefn) {
    return comparefn === undefined ? $sort.call(_toObject(this)) : $sort.call(_toObject(this), _aFunction(comparefn));
  }
});

var SPECIES = _wks('species');

var _arraySpeciesConstructor = function (original) {
  var C;

  if (_isArray(original)) {
    C = original.constructor; // cross-realm fallback

    if (typeof C == 'function' && (C === Array || _isArray(C.prototype))) C = undefined;

    if (_isObject(C)) {
      C = C[SPECIES];
      if (C === null) C = undefined;
    }
  }

  return C === undefined ? Array : C;
};

// 9.4.2.3 ArraySpeciesCreate(originalArray, length)


var _arraySpeciesCreate = function (original, length) {
  return new (_arraySpeciesConstructor(original))(length);
};

// 0 -> Array#forEach
// 1 -> Array#map
// 2 -> Array#filter
// 3 -> Array#some
// 4 -> Array#every
// 5 -> Array#find
// 6 -> Array#findIndex










var _arrayMethods = function (TYPE, $create) {
  var IS_MAP = TYPE == 1;
  var IS_FILTER = TYPE == 2;
  var IS_SOME = TYPE == 3;
  var IS_EVERY = TYPE == 4;
  var IS_FIND_INDEX = TYPE == 6;
  var NO_HOLES = TYPE == 5 || IS_FIND_INDEX;
  var create = $create || _arraySpeciesCreate;
  return function ($this, callbackfn, that) {
    var O = _toObject($this);
    var self = _iobject(O);
    var f = _ctx(callbackfn, that, 3);
    var length = _toLength(self.length);
    var index = 0;
    var result = IS_MAP ? create($this, length) : IS_FILTER ? create($this, 0) : undefined;
    var val, res;

    for (; length > index; index++) if (NO_HOLES || index in self) {
      val = self[index];
      res = f(val, index, O);

      if (TYPE) {
        if (IS_MAP) result[index] = res; // map
        else if (res) switch (TYPE) {
            case 3:
              return true;
            // some

            case 5:
              return val;
            // find

            case 6:
              return index;
            // findIndex

            case 2:
              result.push(val);
            // filter
          } else if (IS_EVERY) return false; // every
      }
    }

    return IS_FIND_INDEX ? -1 : IS_SOME || IS_EVERY ? IS_EVERY : result;
  };
};

var $forEach = _arrayMethods(0);

var STRICT = _strictMethod([].forEach, true);

_export(_export.P + _export.F * !STRICT, 'Array', {
  // 22.1.3.10 / 15.4.4.18 Array.prototype.forEach(callbackfn [, thisArg])
  forEach: function forEach(callbackfn
  /* , thisArg */
  ) {
    return $forEach(this, callbackfn, arguments[1]);
  }
});

var $map = _arrayMethods(1);

_export(_export.P + _export.F * !_strictMethod([].map, true), 'Array', {
  // 22.1.3.15 / 15.4.4.19 Array.prototype.map(callbackfn [, thisArg])
  map: function map(callbackfn
  /* , thisArg */
  ) {
    return $map(this, callbackfn, arguments[1]);
  }
});

var $filter = _arrayMethods(2);

_export(_export.P + _export.F * !_strictMethod([].filter, true), 'Array', {
  // 22.1.3.7 / 15.4.4.20 Array.prototype.filter(callbackfn [, thisArg])
  filter: function filter(callbackfn
  /* , thisArg */
  ) {
    return $filter(this, callbackfn, arguments[1]);
  }
});

var $some = _arrayMethods(3);

_export(_export.P + _export.F * !_strictMethod([].some, true), 'Array', {
  // 22.1.3.23 / 15.4.4.17 Array.prototype.some(callbackfn [, thisArg])
  some: function some(callbackfn
  /* , thisArg */
  ) {
    return $some(this, callbackfn, arguments[1]);
  }
});

var $every = _arrayMethods(4);

_export(_export.P + _export.F * !_strictMethod([].every, true), 'Array', {
  // 22.1.3.5 / 15.4.4.16 Array.prototype.every(callbackfn [, thisArg])
  every: function every(callbackfn
  /* , thisArg */
  ) {
    return $every(this, callbackfn, arguments[1]);
  }
});

var _arrayReduce = function (that, callbackfn, aLen, memo, isRight) {
  _aFunction(callbackfn);
  var O = _toObject(that);
  var self = _iobject(O);
  var length = _toLength(O.length);
  var index = isRight ? length - 1 : 0;
  var i = isRight ? -1 : 1;
  if (aLen < 2) for (;;) {
    if (index in self) {
      memo = self[index];
      index += i;
      break;
    }

    index += i;

    if (isRight ? index < 0 : length <= index) {
      throw TypeError('Reduce of empty array with no initial value');
    }
  }

  for (; isRight ? index >= 0 : length > index; index += i) if (index in self) {
    memo = callbackfn(memo, self[index], index, O);
  }

  return memo;
};

_export(_export.P + _export.F * !_strictMethod([].reduce, true), 'Array', {
  // 22.1.3.18 / 15.4.4.21 Array.prototype.reduce(callbackfn [, initialValue])
  reduce: function reduce(callbackfn
  /* , initialValue */
  ) {
    return _arrayReduce(this, callbackfn, arguments.length, arguments[1], false);
  }
});

_export(_export.P + _export.F * !_strictMethod([].reduceRight, true), 'Array', {
  // 22.1.3.19 / 15.4.4.22 Array.prototype.reduceRight(callbackfn [, initialValue])
  reduceRight: function reduceRight(callbackfn
  /* , initialValue */
  ) {
    return _arrayReduce(this, callbackfn, arguments.length, arguments[1], true);
  }
});

var $indexOf = _arrayIncludes(false);

var $native = [].indexOf;
var NEGATIVE_ZERO = !!$native && 1 / [1].indexOf(1, -0) < 0;
_export(_export.P + _export.F * (NEGATIVE_ZERO || !_strictMethod($native)), 'Array', {
  // 22.1.3.11 / 15.4.4.14 Array.prototype.indexOf(searchElement [, fromIndex])
  indexOf: function indexOf(searchElement
  /* , fromIndex = 0 */
  ) {
    return NEGATIVE_ZERO // convert -0 to +0
    ? $native.apply(this, arguments) || 0 : $indexOf(this, searchElement, arguments[1]);
  }
});

var $native$1 = [].lastIndexOf;
var NEGATIVE_ZERO$1 = !!$native$1 && 1 / [1].lastIndexOf(1, -0) < 0;
_export(_export.P + _export.F * (NEGATIVE_ZERO$1 || !_strictMethod($native$1)), 'Array', {
  // 22.1.3.14 / 15.4.4.15 Array.prototype.lastIndexOf(searchElement [, fromIndex])
  lastIndexOf: function lastIndexOf(searchElement
  /* , fromIndex = @[*-1] */
  ) {
    // convert -0 to +0
    if (NEGATIVE_ZERO$1) return $native$1.apply(this, arguments) || 0;
    var O = _toIobject(this);
    var length = _toLength(O.length);
    var index = length - 1;
    if (arguments.length > 1) index = Math.min(index, _toInteger(arguments[1]));
    if (index < 0) index = length + index;

    for (; index >= 0; index--) if (index in O) if (O[index] === searchElement) return index || 0;

    return -1;
  }
});

var _arrayCopyWithin = [].copyWithin || function copyWithin(target
/* = 0 */
, start
/* = 0, end = @length */
) {
  var O = _toObject(this);
  var len = _toLength(O.length);
  var to = _toAbsoluteIndex(target, len);
  var from = _toAbsoluteIndex(start, len);
  var end = arguments.length > 2 ? arguments[2] : undefined;
  var count = Math.min((end === undefined ? len : _toAbsoluteIndex(end, len)) - from, len - to);
  var inc = 1;

  if (from < to && to < from + count) {
    inc = -1;
    from += count - 1;
    to += count - 1;
  }

  while (count-- > 0) {
    if (from in O) O[to] = O[from];else delete O[to];
    to += inc;
    from += inc;
  }

  return O;
};

// 22.1.3.31 Array.prototype[@@unscopables]
var UNSCOPABLES = _wks('unscopables');

var ArrayProto$1 = Array.prototype;
if (ArrayProto$1[UNSCOPABLES] == undefined) _hide(ArrayProto$1, UNSCOPABLES, {});

var _addToUnscopables = function (key) {
  ArrayProto$1[UNSCOPABLES][key] = true;
};

// 22.1.3.3 Array.prototype.copyWithin(target, start, end = this.length)


_export(_export.P, 'Array', {
  copyWithin: _arrayCopyWithin
});

_addToUnscopables('copyWithin');

var _arrayFill = function fill(value
/* , start = 0, end = @length */
) {
  var O = _toObject(this);
  var length = _toLength(O.length);
  var aLen = arguments.length;
  var index = _toAbsoluteIndex(aLen > 1 ? arguments[1] : undefined, length);
  var end = aLen > 2 ? arguments[2] : undefined;
  var endPos = end === undefined ? length : _toAbsoluteIndex(end, length);

  while (endPos > index) O[index++] = value;

  return O;
};

// 22.1.3.6 Array.prototype.fill(value, start = 0, end = this.length)


_export(_export.P, 'Array', {
  fill: _arrayFill
});

_addToUnscopables('fill');

var $find = _arrayMethods(5);

var KEY = 'find';
var forced = true; // Shouldn't skip holes

if (KEY in []) Array(1)[KEY](function () {
  forced = false;
});
_export(_export.P + _export.F * forced, 'Array', {
  find: function find(callbackfn
  /* , that = undefined */
  ) {
    return $find(this, callbackfn, arguments.length > 1 ? arguments[1] : undefined);
  }
});

_addToUnscopables(KEY);

var $find$1 = _arrayMethods(6);

var KEY$1 = 'findIndex';
var forced$1 = true; // Shouldn't skip holes

if (KEY$1 in []) Array(1)[KEY$1](function () {
  forced$1 = false;
});
_export(_export.P + _export.F * forced$1, 'Array', {
  findIndex: function findIndex(callbackfn
  /* , that = undefined */
  ) {
    return $find$1(this, callbackfn, arguments.length > 1 ? arguments[1] : undefined);
  }
});

_addToUnscopables(KEY$1);

var SPECIES$1 = _wks('species');

var _setSpecies = function (KEY) {
  var C = _global[KEY];
  if (_descriptors && C && !C[SPECIES$1]) _objectDp.f(C, SPECIES$1, {
    configurable: true,
    get: function () {
      return this;
    }
  });
};

_setSpecies('Array');

var _iterStep = function (done, value) {
  return {
    value: value,
    done: !!done
  };
};

// 22.1.3.4 Array.prototype.entries()
// 22.1.3.13 Array.prototype.keys()
// 22.1.3.29 Array.prototype.values()
// 22.1.3.30 Array.prototype[@@iterator]()


var es6_array_iterator = _iterDefine(Array, 'Array', function (iterated, kind) {
  this._t = _toIobject(iterated); // target

  this._i = 0; // next index

  this._k = kind; // kind
  // 22.1.5.2.1 %ArrayIteratorPrototype%.next()
}, function () {
  var O = this._t;
  var kind = this._k;
  var index = this._i++;

  if (!O || index >= O.length) {
    this._t = undefined;
    return _iterStep(1);
  }

  if (kind == 'keys') return _iterStep(0, index);
  if (kind == 'values') return _iterStep(0, O[index]);
  return _iterStep(0, [index, O[index]]);
}, 'values'); // argumentsList[@@iterator] is %ArrayProto_values% (9.4.4.6, 9.4.4.7)

_iterators.Arguments = _iterators.Array;
_addToUnscopables('keys');
_addToUnscopables('values');
_addToUnscopables('entries');

var _flags = function () {
  var that = _anObject(this);
  var result = '';
  if (that.global) result += 'g';
  if (that.ignoreCase) result += 'i';
  if (that.multiline) result += 'm';
  if (that.unicode) result += 'u';
  if (that.sticky) result += 'y';
  return result;
};

var dP$4 = _objectDp.f;

var gOPN$3 = _objectGopn.f;





var $RegExp = _global.RegExp;
var Base$1 = $RegExp;
var proto$2 = $RegExp.prototype;
var re1 = /a/g;
var re2 = /a/g; // "new" creates a new object, old webkit buggy here

var CORRECT_NEW = new $RegExp(re1) !== re1;

if (_descriptors && (!CORRECT_NEW || _fails(function () {
  re2[_wks('match')] = false; // RegExp constructor can alter flags and IsRegExp works correct with @@match

  return $RegExp(re1) != re1 || $RegExp(re2) == re2 || $RegExp(re1, 'i') != '/a/i';
}))) {
  $RegExp = function RegExp(p, f) {
    var tiRE = this instanceof $RegExp;
    var piRE = _isRegexp(p);
    var fiU = f === undefined;
    return !tiRE && piRE && p.constructor === $RegExp && fiU ? p : _inheritIfRequired(CORRECT_NEW ? new Base$1(piRE && !fiU ? p.source : p, f) : Base$1((piRE = p instanceof $RegExp) ? p.source : p, piRE && fiU ? _flags.call(p) : f), tiRE ? this : proto$2, $RegExp);
  };

  var proxy = function (key) {
    key in $RegExp || dP$4($RegExp, key, {
      configurable: true,
      get: function () {
        return Base$1[key];
      },
      set: function (it) {
        Base$1[key] = it;
      }
    });
  };

  for (var keys$1 = gOPN$3(Base$1), i = 0; keys$1.length > i;) proxy(keys$1[i++]);

  proto$2.constructor = $RegExp;
  $RegExp.prototype = proto$2;

  _redefine(_global, 'RegExp', $RegExp);
}

_setSpecies('RegExp');

var nativeExec = RegExp.prototype.exec; // This always refers to the native implementation, because the
// String#replace polyfill uses ./fix-regexp-well-known-symbol-logic.js,
// which loads this file before patching the method.

var nativeReplace = String.prototype.replace;
var patchedExec = nativeExec;
var LAST_INDEX = 'lastIndex';

var UPDATES_LAST_INDEX_WRONG = function () {
  var re1 = /a/,
      re2 = /b*/g;
  nativeExec.call(re1, 'a');
  nativeExec.call(re2, 'a');
  return re1[LAST_INDEX] !== 0 || re2[LAST_INDEX] !== 0;
}(); // nonparticipating capturing group, copied from es5-shim's String#split patch.


var NPCG_INCLUDED = /()??/.exec('')[1] !== undefined;
var PATCH = UPDATES_LAST_INDEX_WRONG || NPCG_INCLUDED;

if (PATCH) {
  patchedExec = function exec(str) {
    var re = this;
    var lastIndex, reCopy, match, i;

    if (NPCG_INCLUDED) {
      reCopy = new RegExp('^' + re.source + '$(?!\\s)', _flags.call(re));
    }

    if (UPDATES_LAST_INDEX_WRONG) lastIndex = re[LAST_INDEX];
    match = nativeExec.call(re, str);

    if (UPDATES_LAST_INDEX_WRONG && match) {
      re[LAST_INDEX] = re.global ? match.index + match[0].length : lastIndex;
    }

    if (NPCG_INCLUDED && match && match.length > 1) {
      // Fix browsers whose `exec` methods don't consistently return `undefined`
      // for NPCG, like IE8. NOTE: This doesn' work for /(.?)?/
      // eslint-disable-next-line no-loop-func
      nativeReplace.call(match[0], reCopy, function () {
        for (i = 1; i < arguments.length - 2; i++) {
          if (arguments[i] === undefined) match[i] = undefined;
        }
      });
    }

    return match;
  };
}

var _regexpExec = patchedExec;

_export({
  target: 'RegExp',
  proto: true,
  forced: _regexpExec !== /./.exec
}, {
  exec: _regexpExec
});

// 21.2.5.3 get RegExp.prototype.flags()
if (_descriptors && /./g.flags != 'g') _objectDp.f(RegExp.prototype, 'flags', {
  configurable: true,
  get: _flags
});

var TO_STRING$1 = 'toString';
var $toString$1 = /./[TO_STRING$1];

var define = function (fn) {
  _redefine(RegExp.prototype, TO_STRING$1, fn, true);
}; // 21.2.5.14 RegExp.prototype.toString()


if (_fails(function () {
  return $toString$1.call({
    source: 'a',
    flags: 'b'
  }) != '/a/b';
})) {
  define(function toString() {
    var R = _anObject(this);
    return '/'.concat(R.source, '/', 'flags' in R ? R.flags : !_descriptors && R instanceof RegExp ? _flags.call(R) : undefined);
  }); // FF44- RegExp#toString has a wrong name
} else if ($toString$1.name != TO_STRING$1) {
  define(function toString() {
    return $toString$1.call(this);
  });
}

var at = _stringAt(true); // `AdvanceStringIndex` abstract operation
// https://tc39.github.io/ecma262/#sec-advancestringindex


var _advanceStringIndex = function (S, index, unicode) {
  return index + (unicode ? at(S, index).length : 1);
};

var builtinExec = RegExp.prototype.exec; // `RegExpExec` abstract operation
// https://tc39.github.io/ecma262/#sec-regexpexec

var _regexpExecAbstract = function (R, S) {
  var exec = R.exec;

  if (typeof exec === 'function') {
    var result = exec.call(R, S);

    if (typeof result !== 'object') {
      throw new TypeError('RegExp exec method returned something other than an Object or null');
    }

    return result;
  }

  if (_classof(R) !== 'RegExp') {
    throw new TypeError('RegExp#exec called on incompatible receiver');
  }

  return builtinExec.call(R, S);
};

var SPECIES$2 = _wks('species');
var REPLACE_SUPPORTS_NAMED_GROUPS = !_fails(function () {
  // #replace needs built-in support for named groups.
  // #match works fine because it just return the exec results, even if it has
  // a "grops" property.
  var re = /./;

  re.exec = function () {
    var result = [];
    result.groups = {
      a: '7'
    };
    return result;
  };

  return ''.replace(re, '$<a>') !== '7';
});

var SPLIT_WORKS_WITH_OVERWRITTEN_EXEC = function () {
  // Chrome 51 has a buggy "split" implementation when RegExp#exec !== nativeExec
  var re = /(?:)/;
  var originalExec = re.exec;

  re.exec = function () {
    return originalExec.apply(this, arguments);
  };

  var result = 'ab'.split(re);
  return result.length === 2 && result[0] === 'a' && result[1] === 'b';
}();

var _fixReWks = function (KEY, length, exec) {
  var SYMBOL = _wks(KEY);
  var DELEGATES_TO_SYMBOL = !_fails(function () {
    // String methods call symbol-named RegEp methods
    var O = {};

    O[SYMBOL] = function () {
      return 7;
    };

    return ''[KEY](O) != 7;
  });
  var DELEGATES_TO_EXEC = DELEGATES_TO_SYMBOL ? !_fails(function () {
    // Symbol-named RegExp methods call .exec
    var execCalled = false;
    var re = /a/;

    re.exec = function () {
      execCalled = true;
      return null;
    };

    if (KEY === 'split') {
      // RegExp[@@split] doesn't call the regex's exec method, but first creates
      // a new one. We need to return the patched regex when creating the new one.
      re.constructor = {};

      re.constructor[SPECIES$2] = function () {
        return re;
      };
    }

    re[SYMBOL]('');
    return !execCalled;
  }) : undefined;

  if (!DELEGATES_TO_SYMBOL || !DELEGATES_TO_EXEC || KEY === 'replace' && !REPLACE_SUPPORTS_NAMED_GROUPS || KEY === 'split' && !SPLIT_WORKS_WITH_OVERWRITTEN_EXEC) {
    var nativeRegExpMethod = /./[SYMBOL];
    var fns = exec(_defined, SYMBOL, ''[KEY], function maybeCallNative(nativeMethod, regexp, str, arg2, forceStringMethod) {
      if (regexp.exec === _regexpExec) {
        if (DELEGATES_TO_SYMBOL && !forceStringMethod) {
          // The native String method already delegates to @@method (this
          // polyfilled function), leasing to infinite recursion.
          // We avoid it by directly calling the native @@method method.
          return {
            done: true,
            value: nativeRegExpMethod.call(regexp, str, arg2)
          };
        }

        return {
          done: true,
          value: nativeMethod.call(str, regexp, arg2)
        };
      }

      return {
        done: false
      };
    });
    var strfn = fns[0];
    var rxfn = fns[1];
    _redefine(String.prototype, KEY, strfn);
    _hide(RegExp.prototype, SYMBOL, length == 2 // 21.2.5.8 RegExp.prototype[@@replace](string, replaceValue)
    // 21.2.5.11 RegExp.prototype[@@split](string, limit)
    ? function (string, arg) {
      return rxfn.call(string, this, arg);
    } // 21.2.5.6 RegExp.prototype[@@match](string)
    // 21.2.5.9 RegExp.prototype[@@search](string)
    : function (string) {
      return rxfn.call(string, this);
    });
  }
};

// @@match logic


_fixReWks('match', 1, function (defined, MATCH, $match, maybeCallNative) {
  return [// `String.prototype.match` method
  // https://tc39.github.io/ecma262/#sec-string.prototype.match
  function match(regexp) {
    var O = defined(this);
    var fn = regexp == undefined ? undefined : regexp[MATCH];
    return fn !== undefined ? fn.call(regexp, O) : new RegExp(regexp)[MATCH](String(O));
  }, // `RegExp.prototype[@@match]` method
  // https://tc39.github.io/ecma262/#sec-regexp.prototype-@@match
  function (regexp) {
    var res = maybeCallNative($match, regexp, this);
    if (res.done) return res.value;
    var rx = _anObject(regexp);
    var S = String(this);
    if (!rx.global) return _regexpExecAbstract(rx, S);
    var fullUnicode = rx.unicode;
    rx.lastIndex = 0;
    var A = [];
    var n = 0;
    var result;

    while ((result = _regexpExecAbstract(rx, S)) !== null) {
      var matchStr = String(result[0]);
      A[n] = matchStr;
      if (matchStr === '') rx.lastIndex = _advanceStringIndex(S, _toLength(rx.lastIndex), fullUnicode);
      n++;
    }

    return n === 0 ? null : A;
  }];
});

var max$1 = Math.max;
var min$2 = Math.min;
var floor$3 = Math.floor;
var SUBSTITUTION_SYMBOLS = /\$([$&`']|\d\d?|<[^>]*>)/g;
var SUBSTITUTION_SYMBOLS_NO_NAMED = /\$([$&`']|\d\d?)/g;

var maybeToString = function (it) {
  return it === undefined ? it : String(it);
}; // @@replace logic


_fixReWks('replace', 2, function (defined, REPLACE, $replace, maybeCallNative) {
  return [// `String.prototype.replace` method
  // https://tc39.github.io/ecma262/#sec-string.prototype.replace
  function replace(searchValue, replaceValue) {
    var O = defined(this);
    var fn = searchValue == undefined ? undefined : searchValue[REPLACE];
    return fn !== undefined ? fn.call(searchValue, O, replaceValue) : $replace.call(String(O), searchValue, replaceValue);
  }, // `RegExp.prototype[@@replace]` method
  // https://tc39.github.io/ecma262/#sec-regexp.prototype-@@replace
  function (regexp, replaceValue) {
    var res = maybeCallNative($replace, regexp, this, replaceValue);
    if (res.done) return res.value;
    var rx = _anObject(regexp);
    var S = String(this);
    var functionalReplace = typeof replaceValue === 'function';
    if (!functionalReplace) replaceValue = String(replaceValue);
    var global = rx.global;

    if (global) {
      var fullUnicode = rx.unicode;
      rx.lastIndex = 0;
    }

    var results = [];

    while (true) {
      var result = _regexpExecAbstract(rx, S);
      if (result === null) break;
      results.push(result);
      if (!global) break;
      var matchStr = String(result[0]);
      if (matchStr === '') rx.lastIndex = _advanceStringIndex(S, _toLength(rx.lastIndex), fullUnicode);
    }

    var accumulatedResult = '';
    var nextSourcePosition = 0;

    for (var i = 0; i < results.length; i++) {
      result = results[i];
      var matched = String(result[0]);
      var position = max$1(min$2(_toInteger(result.index), S.length), 0);
      var captures = []; // NOTE: This is equivalent to
      //   captures = result.slice(1).map(maybeToString)
      // but for some reason `nativeSlice.call(result, 1, result.length)` (called in
      // the slice polyfill when slicing native arrays) "doesn't work" in safari 9 and
      // causes a crash (https://pastebin.com/N21QzeQA) when trying to debug it.

      for (var j = 1; j < result.length; j++) captures.push(maybeToString(result[j]));

      var namedCaptures = result.groups;

      if (functionalReplace) {
        var replacerArgs = [matched].concat(captures, position, S);
        if (namedCaptures !== undefined) replacerArgs.push(namedCaptures);
        var replacement = String(replaceValue.apply(undefined, replacerArgs));
      } else {
        replacement = getSubstitution(matched, S, position, captures, namedCaptures, replaceValue);
      }

      if (position >= nextSourcePosition) {
        accumulatedResult += S.slice(nextSourcePosition, position) + replacement;
        nextSourcePosition = position + matched.length;
      }
    }

    return accumulatedResult + S.slice(nextSourcePosition);
  }]; // https://tc39.github.io/ecma262/#sec-getsubstitution

  function getSubstitution(matched, str, position, captures, namedCaptures, replacement) {
    var tailPos = position + matched.length;
    var m = captures.length;
    var symbols = SUBSTITUTION_SYMBOLS_NO_NAMED;

    if (namedCaptures !== undefined) {
      namedCaptures = _toObject(namedCaptures);
      symbols = SUBSTITUTION_SYMBOLS;
    }

    return $replace.call(replacement, symbols, function (match, ch) {
      var capture;

      switch (ch.charAt(0)) {
        case '$':
          return '$';

        case '&':
          return matched;

        case '`':
          return str.slice(0, position);

        case "'":
          return str.slice(tailPos);

        case '<':
          capture = namedCaptures[ch.slice(1, -1)];
          break;

        default:
          // \d\d?
          var n = +ch;
          if (n === 0) return match;

          if (n > m) {
            var f = floor$3(n / 10);
            if (f === 0) return match;
            if (f <= m) return captures[f - 1] === undefined ? ch.charAt(1) : captures[f - 1] + ch.charAt(1);
            return match;
          }

          capture = captures[n - 1];
      }

      return capture === undefined ? '' : capture;
    });
  }
});

// @@search logic


_fixReWks('search', 1, function (defined, SEARCH, $search, maybeCallNative) {
  return [// `String.prototype.search` method
  // https://tc39.github.io/ecma262/#sec-string.prototype.search
  function search(regexp) {
    var O = defined(this);
    var fn = regexp == undefined ? undefined : regexp[SEARCH];
    return fn !== undefined ? fn.call(regexp, O) : new RegExp(regexp)[SEARCH](String(O));
  }, // `RegExp.prototype[@@search]` method
  // https://tc39.github.io/ecma262/#sec-regexp.prototype-@@search
  function (regexp) {
    var res = maybeCallNative($search, regexp, this);
    if (res.done) return res.value;
    var rx = _anObject(regexp);
    var S = String(this);
    var previousLastIndex = rx.lastIndex;
    if (!_sameValue(previousLastIndex, 0)) rx.lastIndex = 0;
    var result = _regexpExecAbstract(rx, S);
    if (!_sameValue(rx.lastIndex, previousLastIndex)) rx.lastIndex = previousLastIndex;
    return result === null ? -1 : result.index;
  }];
});

// 7.3.20 SpeciesConstructor(O, defaultConstructor)




var SPECIES$3 = _wks('species');

var _speciesConstructor = function (O, D) {
  var C = _anObject(O).constructor;
  var S;
  return C === undefined || (S = _anObject(C)[SPECIES$3]) == undefined ? D : _aFunction(S);
};

var $min = Math.min;
var $push = [].push;
var $SPLIT = 'split';
var LENGTH = 'length';
var LAST_INDEX$1 = 'lastIndex';
var MAX_UINT32 = 0xffffffff; // babel-minify transpiles RegExp('x', 'y') -> /x/y and it causes SyntaxError

var SUPPORTS_Y = !_fails(function () {
  RegExp(MAX_UINT32, 'y');
}); // @@split logic

_fixReWks('split', 2, function (defined, SPLIT, $split, maybeCallNative) {
  var internalSplit;

  if ('abbc'[$SPLIT](/(b)*/)[1] == 'c' || 'test'[$SPLIT](/(?:)/, -1)[LENGTH] != 4 || 'ab'[$SPLIT](/(?:ab)*/)[LENGTH] != 2 || '.'[$SPLIT](/(.?)(.?)/)[LENGTH] != 4 || '.'[$SPLIT](/()()/)[LENGTH] > 1 || ''[$SPLIT](/.?/)[LENGTH]) {
    // based on es5-shim implementation, need to rework it
    internalSplit = function (separator, limit) {
      var string = String(this);
      if (separator === undefined && limit === 0) return []; // If `separator` is not a regex, use native split

      if (!_isRegexp(separator)) return $split.call(string, separator, limit);
      var output = [];
      var flags = (separator.ignoreCase ? 'i' : '') + (separator.multiline ? 'm' : '') + (separator.unicode ? 'u' : '') + (separator.sticky ? 'y' : '');
      var lastLastIndex = 0;
      var splitLimit = limit === undefined ? MAX_UINT32 : limit >>> 0; // Make `global` and avoid `lastIndex` issues by working with a copy

      var separatorCopy = new RegExp(separator.source, flags + 'g');
      var match, lastIndex, lastLength;

      while (match = _regexpExec.call(separatorCopy, string)) {
        lastIndex = separatorCopy[LAST_INDEX$1];

        if (lastIndex > lastLastIndex) {
          output.push(string.slice(lastLastIndex, match.index));
          if (match[LENGTH] > 1 && match.index < string[LENGTH]) $push.apply(output, match.slice(1));
          lastLength = match[0][LENGTH];
          lastLastIndex = lastIndex;
          if (output[LENGTH] >= splitLimit) break;
        }

        if (separatorCopy[LAST_INDEX$1] === match.index) separatorCopy[LAST_INDEX$1]++; // Avoid an infinite loop
      }

      if (lastLastIndex === string[LENGTH]) {
        if (lastLength || !separatorCopy.test('')) output.push('');
      } else output.push(string.slice(lastLastIndex));

      return output[LENGTH] > splitLimit ? output.slice(0, splitLimit) : output;
    }; // Chakra, V8

  } else if ('0'[$SPLIT](undefined, 0)[LENGTH]) {
    internalSplit = function (separator, limit) {
      return separator === undefined && limit === 0 ? [] : $split.call(this, separator, limit);
    };
  } else {
    internalSplit = $split;
  }

  return [// `String.prototype.split` method
  // https://tc39.github.io/ecma262/#sec-string.prototype.split
  function split(separator, limit) {
    var O = defined(this);
    var splitter = separator == undefined ? undefined : separator[SPLIT];
    return splitter !== undefined ? splitter.call(separator, O, limit) : internalSplit.call(String(O), separator, limit);
  }, // `RegExp.prototype[@@split]` method
  // https://tc39.github.io/ecma262/#sec-regexp.prototype-@@split
  //
  // NOTE: This cannot be properly polyfilled in engines that don't support
  // the 'y' flag.
  function (regexp, limit) {
    var res = maybeCallNative(internalSplit, regexp, this, limit, internalSplit !== $split);
    if (res.done) return res.value;
    var rx = _anObject(regexp);
    var S = String(this);
    var C = _speciesConstructor(rx, RegExp);
    var unicodeMatching = rx.unicode;
    var flags = (rx.ignoreCase ? 'i' : '') + (rx.multiline ? 'm' : '') + (rx.unicode ? 'u' : '') + (SUPPORTS_Y ? 'y' : 'g'); // ^(? + rx + ) is needed, in combination with some S slicing, to
    // simulate the 'y' flag.

    var splitter = new C(SUPPORTS_Y ? rx : '^(?:' + rx.source + ')', flags);
    var lim = limit === undefined ? MAX_UINT32 : limit >>> 0;
    if (lim === 0) return [];
    if (S.length === 0) return _regexpExecAbstract(splitter, S) === null ? [S] : [];
    var p = 0;
    var q = 0;
    var A = [];

    while (q < S.length) {
      splitter.lastIndex = SUPPORTS_Y ? q : 0;
      var z = _regexpExecAbstract(splitter, SUPPORTS_Y ? S : S.slice(q));
      var e;

      if (z === null || (e = $min(_toLength(splitter.lastIndex + (SUPPORTS_Y ? 0 : q)), S.length)) === p) {
        q = _advanceStringIndex(S, q, unicodeMatching);
      } else {
        A.push(S.slice(p, q));
        if (A.length === lim) return A;

        for (var i = 1; i <= z.length - 1; i++) {
          A.push(z[i]);
          if (A.length === lim) return A;
        }

        q = p = e;
      }
    }

    A.push(S.slice(p));
    return A;
  }];
});

var _anInstance = function (it, Constructor, name, forbiddenField) {
  if (!(it instanceof Constructor) || forbiddenField !== undefined && forbiddenField in it) {
    throw TypeError(name + ': incorrect invocation!');
  }

  return it;
};

var _forOf = createCommonjsModule(function (module) {
var BREAK = {};
var RETURN = {};

var exports = module.exports = function (iterable, entries, fn, that, ITERATOR) {
  var iterFn = ITERATOR ? function () {
    return iterable;
  } : core_getIteratorMethod(iterable);
  var f = _ctx(fn, that, entries ? 2 : 1);
  var index = 0;
  var length, step, iterator, result;
  if (typeof iterFn != 'function') throw TypeError(iterable + ' is not iterable!'); // fast case for arrays with default iterator

  if (_isArrayIter(iterFn)) for (length = _toLength(iterable.length); length > index; index++) {
    result = entries ? f(_anObject(step = iterable[index])[0], step[1]) : f(iterable[index]);
    if (result === BREAK || result === RETURN) return result;
  } else for (iterator = iterFn.call(iterable); !(step = iterator.next()).done;) {
    result = _iterCall(iterator, f, step.value, entries);
    if (result === BREAK || result === RETURN) return result;
  }
};

exports.BREAK = BREAK;
exports.RETURN = RETURN;
});

var process = _global.process;
var setTask = _global.setImmediate;
var clearTask = _global.clearImmediate;
var MessageChannel = _global.MessageChannel;
var Dispatch = _global.Dispatch;
var counter = 0;
var queue = {};
var ONREADYSTATECHANGE = 'onreadystatechange';
var defer, channel, port;

var run = function () {
  var id = +this; // eslint-disable-next-line no-prototype-builtins

  if (queue.hasOwnProperty(id)) {
    var fn = queue[id];
    delete queue[id];
    fn();
  }
};

var listener = function (event) {
  run.call(event.data);
}; // Node.js 0.9+ & IE10+ has setImmediate, otherwise:


if (!setTask || !clearTask) {
  setTask = function setImmediate(fn) {
    var args = [];
    var i = 1;

    while (arguments.length > i) args.push(arguments[i++]);

    queue[++counter] = function () {
      // eslint-disable-next-line no-new-func
      _invoke(typeof fn == 'function' ? fn : Function(fn), args);
    };

    defer(counter);
    return counter;
  };

  clearTask = function clearImmediate(id) {
    delete queue[id];
  }; // Node.js 0.8-


  if (_cof(process) == 'process') {
    defer = function (id) {
      process.nextTick(_ctx(run, id, 1));
    }; // Sphere (JS game engine) Dispatch API

  } else if (Dispatch && Dispatch.now) {
    defer = function (id) {
      Dispatch.now(_ctx(run, id, 1));
    }; // Browsers with MessageChannel, includes WebWorkers

  } else if (MessageChannel) {
    channel = new MessageChannel();
    port = channel.port2;
    channel.port1.onmessage = listener;
    defer = _ctx(port.postMessage, port, 1); // Browsers with postMessage, skip WebWorkers
    // IE8 has postMessage, but it's sync & typeof its postMessage is 'object'
  } else if (_global.addEventListener && typeof postMessage == 'function' && !_global.importScripts) {
    defer = function (id) {
      _global.postMessage(id + '', '*');
    };

    _global.addEventListener('message', listener, false); // IE8-
  } else if (ONREADYSTATECHANGE in _domCreate('script')) {
    defer = function (id) {
      _html.appendChild(_domCreate('script'))[ONREADYSTATECHANGE] = function () {
        _html.removeChild(this);
        run.call(id);
      };
    }; // Rest old browsers

  } else {
    defer = function (id) {
      setTimeout(_ctx(run, id, 1), 0);
    };
  }
}

var _task = {
  set: setTask,
  clear: clearTask
};

var macrotask = _task.set;

var Observer = _global.MutationObserver || _global.WebKitMutationObserver;
var process$1 = _global.process;
var Promise$1 = _global.Promise;
var isNode = _cof(process$1) == 'process';

var _microtask = function () {
  var head, last, notify;

  var flush = function () {
    var parent, fn;
    if (isNode && (parent = process$1.domain)) parent.exit();

    while (head) {
      fn = head.fn;
      head = head.next;

      try {
        fn();
      } catch (e) {
        if (head) notify();else last = undefined;
        throw e;
      }
    }

    last = undefined;
    if (parent) parent.enter();
  }; // Node.js


  if (isNode) {
    notify = function () {
      process$1.nextTick(flush);
    }; // browsers with MutationObserver, except iOS Safari - https://github.com/zloirock/core-js/issues/339

  } else if (Observer && !(_global.navigator && _global.navigator.standalone)) {
    var toggle = true;
    var node = document.createTextNode('');
    new Observer(flush).observe(node, {
      characterData: true
    }); // eslint-disable-line no-new

    notify = function () {
      node.data = toggle = !toggle;
    }; // environments with maybe non-completely correct, but existent Promise

  } else if (Promise$1 && Promise$1.resolve) {
    // Promise.resolve without an argument throws an error in LG WebOS 2
    var promise = Promise$1.resolve(undefined);

    notify = function () {
      promise.then(flush);
    }; // for other environments - macrotask based on:
    // - setImmediate
    // - MessageChannel
    // - window.postMessag
    // - onreadystatechange
    // - setTimeout

  } else {
    notify = function () {
      // strange IE + webpack dev server bug - use .call(global)
      macrotask.call(_global, flush);
    };
  }

  return function (fn) {
    var task = {
      fn: fn,
      next: undefined
    };
    if (last) last.next = task;

    if (!head) {
      head = task;
      notify();
    }

    last = task;
  };
};

function PromiseCapability(C) {
  var resolve, reject;
  this.promise = new C(function ($$resolve, $$reject) {
    if (resolve !== undefined || reject !== undefined) throw TypeError('Bad Promise constructor');
    resolve = $$resolve;
    reject = $$reject;
  });
  this.resolve = _aFunction(resolve);
  this.reject = _aFunction(reject);
}

var f$7 = function (C) {
  return new PromiseCapability(C);
};

var _newPromiseCapability = {
	f: f$7
};

var _perform = function (exec) {
  try {
    return {
      e: false,
      v: exec()
    };
  } catch (e) {
    return {
      e: true,
      v: e
    };
  }
};

var navigator$1 = _global.navigator;
var _userAgent = navigator$1 && navigator$1.userAgent || '';

var _promiseResolve = function (C, x) {
  _anObject(C);
  if (_isObject(x) && x.constructor === C) return x;
  var promiseCapability = _newPromiseCapability.f(C);
  var resolve = promiseCapability.resolve;
  resolve(x);
  return promiseCapability.promise;
};

var _redefineAll = function (target, src, safe) {
  for (var key in src) _redefine(target, key, src[key], safe);

  return target;
};

var task = _task.set;

var microtask = _microtask();









var PROMISE = 'Promise';
var TypeError$1 = _global.TypeError;
var process$2 = _global.process;
var versions = process$2 && process$2.versions;
var v8 = versions && versions.v8 || '';
var $Promise = _global[PROMISE];
var isNode$1 = _classof(process$2) == 'process';

var empty = function () {
  /* empty */
};

var Internal, newGenericPromiseCapability, OwnPromiseCapability, Wrapper;
var newPromiseCapability = newGenericPromiseCapability = _newPromiseCapability.f;
var USE_NATIVE$1 = !!function () {
  try {
    // correct subclassing with @@species support
    var promise = $Promise.resolve(1);

    var FakePromise = (promise.constructor = {})[_wks('species')] = function (exec) {
      exec(empty, empty);
    }; // unhandled rejections tracking support, NodeJS Promise without it fails @@species test


    return (isNode$1 || typeof PromiseRejectionEvent == 'function') && promise.then(empty) instanceof FakePromise // v8 6.6 (Node 10 and Chrome 66) have a bug with resolving custom thenables
    // https://bugs.chromium.org/p/chromium/issues/detail?id=830565
    // we can't detect it synchronously, so just check versions
    && v8.indexOf('6.6') !== 0 && _userAgent.indexOf('Chrome/66') === -1;
  } catch (e) {
    /* empty */
  }
}(); // helpers

var isThenable = function (it) {
  var then;
  return _isObject(it) && typeof (then = it.then) == 'function' ? then : false;
};

var notify = function (promise, isReject) {
  if (promise._n) return;
  promise._n = true;
  var chain = promise._c;
  microtask(function () {
    var value = promise._v;
    var ok = promise._s == 1;
    var i = 0;

    var run = function (reaction) {
      var handler = ok ? reaction.ok : reaction.fail;
      var resolve = reaction.resolve;
      var reject = reaction.reject;
      var domain = reaction.domain;
      var result, then, exited;

      try {
        if (handler) {
          if (!ok) {
            if (promise._h == 2) onHandleUnhandled(promise);
            promise._h = 1;
          }

          if (handler === true) result = value;else {
            if (domain) domain.enter();
            result = handler(value); // may throw

            if (domain) {
              domain.exit();
              exited = true;
            }
          }

          if (result === reaction.promise) {
            reject(TypeError$1('Promise-chain cycle'));
          } else if (then = isThenable(result)) {
            then.call(result, resolve, reject);
          } else resolve(result);
        } else reject(value);
      } catch (e) {
        if (domain && !exited) domain.exit();
        reject(e);
      }
    };

    while (chain.length > i) run(chain[i++]); // variable length - can't use forEach


    promise._c = [];
    promise._n = false;
    if (isReject && !promise._h) onUnhandled(promise);
  });
};

var onUnhandled = function (promise) {
  task.call(_global, function () {
    var value = promise._v;
    var unhandled = isUnhandled(promise);
    var result, handler, console;

    if (unhandled) {
      result = _perform(function () {
        if (isNode$1) {
          process$2.emit('unhandledRejection', value, promise);
        } else if (handler = _global.onunhandledrejection) {
          handler({
            promise: promise,
            reason: value
          });
        } else if ((console = _global.console) && console.error) {
          console.error('Unhandled promise rejection', value);
        }
      }); // Browsers should not trigger `rejectionHandled` event if it was handled here, NodeJS - should

      promise._h = isNode$1 || isUnhandled(promise) ? 2 : 1;
    }

    promise._a = undefined;
    if (unhandled && result.e) throw result.v;
  });
};

var isUnhandled = function (promise) {
  return promise._h !== 1 && (promise._a || promise._c).length === 0;
};

var onHandleUnhandled = function (promise) {
  task.call(_global, function () {
    var handler;

    if (isNode$1) {
      process$2.emit('rejectionHandled', promise);
    } else if (handler = _global.onrejectionhandled) {
      handler({
        promise: promise,
        reason: promise._v
      });
    }
  });
};

var $reject = function (value) {
  var promise = this;
  if (promise._d) return;
  promise._d = true;
  promise = promise._w || promise; // unwrap

  promise._v = value;
  promise._s = 2;
  if (!promise._a) promise._a = promise._c.slice();
  notify(promise, true);
};

var $resolve = function (value) {
  var promise = this;
  var then;
  if (promise._d) return;
  promise._d = true;
  promise = promise._w || promise; // unwrap

  try {
    if (promise === value) throw TypeError$1("Promise can't be resolved itself");

    if (then = isThenable(value)) {
      microtask(function () {
        var wrapper = {
          _w: promise,
          _d: false
        }; // wrap

        try {
          then.call(value, _ctx($resolve, wrapper, 1), _ctx($reject, wrapper, 1));
        } catch (e) {
          $reject.call(wrapper, e);
        }
      });
    } else {
      promise._v = value;
      promise._s = 1;
      notify(promise, false);
    }
  } catch (e) {
    $reject.call({
      _w: promise,
      _d: false
    }, e); // wrap
  }
}; // constructor polyfill


if (!USE_NATIVE$1) {
  // 25.4.3.1 Promise(executor)
  $Promise = function Promise(executor) {
    _anInstance(this, $Promise, PROMISE, '_h');
    _aFunction(executor);
    Internal.call(this);

    try {
      executor(_ctx($resolve, this, 1), _ctx($reject, this, 1));
    } catch (err) {
      $reject.call(this, err);
    }
  }; // eslint-disable-next-line no-unused-vars


  Internal = function Promise(executor) {
    this._c = []; // <- awaiting reactions

    this._a = undefined; // <- checked in isUnhandled reactions

    this._s = 0; // <- state

    this._d = false; // <- done

    this._v = undefined; // <- value

    this._h = 0; // <- rejection state, 0 - default, 1 - handled, 2 - unhandled

    this._n = false; // <- notify
  };

  Internal.prototype = _redefineAll($Promise.prototype, {
    // 25.4.5.3 Promise.prototype.then(onFulfilled, onRejected)
    then: function then(onFulfilled, onRejected) {
      var reaction = newPromiseCapability(_speciesConstructor(this, $Promise));
      reaction.ok = typeof onFulfilled == 'function' ? onFulfilled : true;
      reaction.fail = typeof onRejected == 'function' && onRejected;
      reaction.domain = isNode$1 ? process$2.domain : undefined;

      this._c.push(reaction);

      if (this._a) this._a.push(reaction);
      if (this._s) notify(this, false);
      return reaction.promise;
    },
    // 25.4.5.1 Promise.prototype.catch(onRejected)
    'catch': function (onRejected) {
      return this.then(undefined, onRejected);
    }
  });

  OwnPromiseCapability = function () {
    var promise = new Internal();
    this.promise = promise;
    this.resolve = _ctx($resolve, promise, 1);
    this.reject = _ctx($reject, promise, 1);
  };

  _newPromiseCapability.f = newPromiseCapability = function (C) {
    return C === $Promise || C === Wrapper ? new OwnPromiseCapability(C) : newGenericPromiseCapability(C);
  };
}

_export(_export.G + _export.W + _export.F * !USE_NATIVE$1, {
  Promise: $Promise
});

_setToStringTag($Promise, PROMISE);

_setSpecies(PROMISE);

Wrapper = _core[PROMISE]; // statics

_export(_export.S + _export.F * !USE_NATIVE$1, PROMISE, {
  // 25.4.4.5 Promise.reject(r)
  reject: function reject(r) {
    var capability = newPromiseCapability(this);
    var $$reject = capability.reject;
    $$reject(r);
    return capability.promise;
  }
});
_export(_export.S + _export.F * ( !USE_NATIVE$1), PROMISE, {
  // 25.4.4.6 Promise.resolve(x)
  resolve: function resolve(x) {
    return _promiseResolve( this, x);
  }
});
_export(_export.S + _export.F * !(USE_NATIVE$1 && _iterDetect(function (iter) {
  $Promise.all(iter)['catch'](empty);
})), PROMISE, {
  // 25.4.4.1 Promise.all(iterable)
  all: function all(iterable) {
    var C = this;
    var capability = newPromiseCapability(C);
    var resolve = capability.resolve;
    var reject = capability.reject;
    var result = _perform(function () {
      var values = [];
      var index = 0;
      var remaining = 1;
      _forOf(iterable, false, function (promise) {
        var $index = index++;
        var alreadyCalled = false;
        values.push(undefined);
        remaining++;
        C.resolve(promise).then(function (value) {
          if (alreadyCalled) return;
          alreadyCalled = true;
          values[$index] = value;
          --remaining || resolve(values);
        }, reject);
      });
      --remaining || resolve(values);
    });
    if (result.e) reject(result.v);
    return capability.promise;
  },
  // 25.4.4.4 Promise.race(iterable)
  race: function race(iterable) {
    var C = this;
    var capability = newPromiseCapability(C);
    var reject = capability.reject;
    var result = _perform(function () {
      _forOf(iterable, false, function (promise) {
        C.resolve(promise).then(capability.resolve, reject);
      });
    });
    if (result.e) reject(result.v);
    return capability.promise;
  }
});

var _validateCollection = function (it, TYPE) {
  if (!_isObject(it) || it._t !== TYPE) throw TypeError('Incompatible receiver, ' + TYPE + ' required!');
  return it;
};

var dP$5 = _objectDp.f;



















var fastKey = _meta.fastKey;



var SIZE = _descriptors ? '_s' : 'size';

var getEntry = function (that, key) {
  // fast case
  var index = fastKey(key);
  var entry;
  if (index !== 'F') return that._i[index]; // frozen object case

  for (entry = that._f; entry; entry = entry.n) {
    if (entry.k == key) return entry;
  }
};

var _collectionStrong = {
  getConstructor: function (wrapper, NAME, IS_MAP, ADDER) {
    var C = wrapper(function (that, iterable) {
      _anInstance(that, C, NAME, '_i');
      that._t = NAME; // collection type

      that._i = _objectCreate(null); // index

      that._f = undefined; // first entry

      that._l = undefined; // last entry

      that[SIZE] = 0; // size

      if (iterable != undefined) _forOf(iterable, IS_MAP, that[ADDER], that);
    });
    _redefineAll(C.prototype, {
      // 23.1.3.1 Map.prototype.clear()
      // 23.2.3.2 Set.prototype.clear()
      clear: function clear() {
        for (var that = _validateCollection(this, NAME), data = that._i, entry = that._f; entry; entry = entry.n) {
          entry.r = true;
          if (entry.p) entry.p = entry.p.n = undefined;
          delete data[entry.i];
        }

        that._f = that._l = undefined;
        that[SIZE] = 0;
      },
      // 23.1.3.3 Map.prototype.delete(key)
      // 23.2.3.4 Set.prototype.delete(value)
      'delete': function (key) {
        var that = _validateCollection(this, NAME);
        var entry = getEntry(that, key);

        if (entry) {
          var next = entry.n;
          var prev = entry.p;
          delete that._i[entry.i];
          entry.r = true;
          if (prev) prev.n = next;
          if (next) next.p = prev;
          if (that._f == entry) that._f = next;
          if (that._l == entry) that._l = prev;
          that[SIZE]--;
        }

        return !!entry;
      },
      // 23.2.3.6 Set.prototype.forEach(callbackfn, thisArg = undefined)
      // 23.1.3.5 Map.prototype.forEach(callbackfn, thisArg = undefined)
      forEach: function forEach(callbackfn
      /* , that = undefined */
      ) {
        _validateCollection(this, NAME);
        var f = _ctx(callbackfn, arguments.length > 1 ? arguments[1] : undefined, 3);
        var entry;

        while (entry = entry ? entry.n : this._f) {
          f(entry.v, entry.k, this); // revert to the last existing entry

          while (entry && entry.r) entry = entry.p;
        }
      },
      // 23.1.3.7 Map.prototype.has(key)
      // 23.2.3.7 Set.prototype.has(value)
      has: function has(key) {
        return !!getEntry(_validateCollection(this, NAME), key);
      }
    });
    if (_descriptors) dP$5(C.prototype, 'size', {
      get: function () {
        return _validateCollection(this, NAME)[SIZE];
      }
    });
    return C;
  },
  def: function (that, key, value) {
    var entry = getEntry(that, key);
    var prev, index; // change existing entry

    if (entry) {
      entry.v = value; // create new entry
    } else {
      that._l = entry = {
        i: index = fastKey(key, true),
        // <- index
        k: key,
        // <- key
        v: value,
        // <- value
        p: prev = that._l,
        // <- previous entry
        n: undefined,
        // <- next entry
        r: false // <- removed

      };
      if (!that._f) that._f = entry;
      if (prev) prev.n = entry;
      that[SIZE]++; // add to index

      if (index !== 'F') that._i[index] = entry;
    }

    return that;
  },
  getEntry: getEntry,
  setStrong: function (C, NAME, IS_MAP) {
    // add .keys, .values, .entries, [@@iterator]
    // 23.1.3.4, 23.1.3.8, 23.1.3.11, 23.1.3.12, 23.2.3.5, 23.2.3.8, 23.2.3.10, 23.2.3.11
    _iterDefine(C, NAME, function (iterated, kind) {
      this._t = _validateCollection(iterated, NAME); // target

      this._k = kind; // kind

      this._l = undefined; // previous
    }, function () {
      var that = this;
      var kind = that._k;
      var entry = that._l; // revert to the last existing entry

      while (entry && entry.r) entry = entry.p; // get next entry


      if (!that._t || !(that._l = entry = entry ? entry.n : that._t._f)) {
        // or finish the iteration
        that._t = undefined;
        return _iterStep(1);
      } // return step by kind


      if (kind == 'keys') return _iterStep(0, entry.k);
      if (kind == 'values') return _iterStep(0, entry.v);
      return _iterStep(0, [entry.k, entry.v]);
    }, IS_MAP ? 'entries' : 'values', !IS_MAP, true); // add [@@species], 23.1.2.2, 23.2.2.2

    _setSpecies(NAME);
  }
};

var _collection = function (NAME, wrapper, methods, common, IS_MAP, IS_WEAK) {
  var Base = _global[NAME];
  var C = Base;
  var ADDER = IS_MAP ? 'set' : 'add';
  var proto = C && C.prototype;
  var O = {};

  var fixMethod = function (KEY) {
    var fn = proto[KEY];
    _redefine(proto, KEY, KEY == 'delete' ? function (a) {
      return IS_WEAK && !_isObject(a) ? false : fn.call(this, a === 0 ? 0 : a);
    } : KEY == 'has' ? function has(a) {
      return IS_WEAK && !_isObject(a) ? false : fn.call(this, a === 0 ? 0 : a);
    } : KEY == 'get' ? function get(a) {
      return IS_WEAK && !_isObject(a) ? undefined : fn.call(this, a === 0 ? 0 : a);
    } : KEY == 'add' ? function add(a) {
      fn.call(this, a === 0 ? 0 : a);
      return this;
    } : function set(a, b) {
      fn.call(this, a === 0 ? 0 : a, b);
      return this;
    });
  };

  if (typeof C != 'function' || !(IS_WEAK || proto.forEach && !_fails(function () {
    new C().entries().next();
  }))) {
    // create collection constructor
    C = common.getConstructor(wrapper, NAME, IS_MAP, ADDER);
    _redefineAll(C.prototype, methods);
    _meta.NEED = true;
  } else {
    var instance = new C(); // early implementations not supports chaining

    var HASNT_CHAINING = instance[ADDER](IS_WEAK ? {} : -0, 1) != instance; // V8 ~  Chromium 40- weak-collections throws on primitives, but should return false

    var THROWS_ON_PRIMITIVES = _fails(function () {
      instance.has(1);
    }); // most early implementations doesn't supports iterables, most modern - not close it correctly

    var ACCEPT_ITERABLES = _iterDetect(function (iter) {
      new C(iter);
    }); // eslint-disable-line no-new
    // for early implementations -0 and +0 not the same

    var BUGGY_ZERO = !IS_WEAK && _fails(function () {
      // V8 ~ Chromium 42- fails only with 5+ elements
      var $instance = new C();
      var index = 5;

      while (index--) $instance[ADDER](index, index);

      return !$instance.has(-0);
    });

    if (!ACCEPT_ITERABLES) {
      C = wrapper(function (target, iterable) {
        _anInstance(target, C, NAME);
        var that = _inheritIfRequired(new Base(), target, C);
        if (iterable != undefined) _forOf(iterable, IS_MAP, that[ADDER], that);
        return that;
      });
      C.prototype = proto;
      proto.constructor = C;
    }

    if (THROWS_ON_PRIMITIVES || BUGGY_ZERO) {
      fixMethod('delete');
      fixMethod('has');
      IS_MAP && fixMethod('get');
    }

    if (BUGGY_ZERO || HASNT_CHAINING) fixMethod(ADDER); // weak collections should not contains .clear method

    if (IS_WEAK && proto.clear) delete proto.clear;
  }

  _setToStringTag(C, NAME);
  O[NAME] = C;
  _export(_export.G + _export.W + _export.F * (C != Base), O);
  if (!IS_WEAK) common.setStrong(C, NAME, IS_MAP);
  return C;
};

var MAP = 'Map'; // 23.1 Map Objects

var es6_map = _collection(MAP, function (get) {
  return function Map() {
    return get(this, arguments.length > 0 ? arguments[0] : undefined);
  };
}, {
  // 23.1.3.6 Map.prototype.get(key)
  get: function get(key) {
    var entry = _collectionStrong.getEntry(_validateCollection(this, MAP), key);
    return entry && entry.v;
  },
  // 23.1.3.9 Map.prototype.set(key, value)
  set: function set(key, value) {
    return _collectionStrong.def(_validateCollection(this, MAP), key === 0 ? 0 : key, value);
  }
}, _collectionStrong, true);

var SET = 'Set'; // 23.2 Set Objects

var es6_set = _collection(SET, function (get) {
  return function Set() {
    return get(this, arguments.length > 0 ? arguments[0] : undefined);
  };
}, {
  // 23.2.3.1 Set.prototype.add(value)
  add: function add(value) {
    return _collectionStrong.def(_validateCollection(this, SET), value = value === 0 ? 0 : value, value);
  }
}, _collectionStrong);

var getWeak = _meta.getWeak;















var arrayFind = _arrayMethods(5);
var arrayFindIndex = _arrayMethods(6);
var id$1 = 0; // fallback for uncaught frozen keys

var uncaughtFrozenStore = function (that) {
  return that._l || (that._l = new UncaughtFrozenStore());
};

var UncaughtFrozenStore = function () {
  this.a = [];
};

var findUncaughtFrozen = function (store, key) {
  return arrayFind(store.a, function (it) {
    return it[0] === key;
  });
};

UncaughtFrozenStore.prototype = {
  get: function (key) {
    var entry = findUncaughtFrozen(this, key);
    if (entry) return entry[1];
  },
  has: function (key) {
    return !!findUncaughtFrozen(this, key);
  },
  set: function (key, value) {
    var entry = findUncaughtFrozen(this, key);
    if (entry) entry[1] = value;else this.a.push([key, value]);
  },
  'delete': function (key) {
    var index = arrayFindIndex(this.a, function (it) {
      return it[0] === key;
    });
    if (~index) this.a.splice(index, 1);
    return !!~index;
  }
};
var _collectionWeak = {
  getConstructor: function (wrapper, NAME, IS_MAP, ADDER) {
    var C = wrapper(function (that, iterable) {
      _anInstance(that, C, NAME, '_i');
      that._t = NAME; // collection type

      that._i = id$1++; // collection id

      that._l = undefined; // leak store for uncaught frozen objects

      if (iterable != undefined) _forOf(iterable, IS_MAP, that[ADDER], that);
    });
    _redefineAll(C.prototype, {
      // 23.3.3.2 WeakMap.prototype.delete(key)
      // 23.4.3.3 WeakSet.prototype.delete(value)
      'delete': function (key) {
        if (!_isObject(key)) return false;
        var data = getWeak(key);
        if (data === true) return uncaughtFrozenStore(_validateCollection(this, NAME))['delete'](key);
        return data && _has(data, this._i) && delete data[this._i];
      },
      // 23.3.3.4 WeakMap.prototype.has(key)
      // 23.4.3.4 WeakSet.prototype.has(value)
      has: function has(key) {
        if (!_isObject(key)) return false;
        var data = getWeak(key);
        if (data === true) return uncaughtFrozenStore(_validateCollection(this, NAME)).has(key);
        return data && _has(data, this._i);
      }
    });
    return C;
  },
  def: function (that, key, value) {
    var data = getWeak(_anObject(key), true);
    if (data === true) uncaughtFrozenStore(that).set(key, value);else data[that._i] = value;
    return that;
  },
  ufstore: uncaughtFrozenStore
};

var es6_weakMap = createCommonjsModule(function (module) {



var each = _arrayMethods(0);













var NATIVE_WEAK_MAP = _validateCollection;

var IS_IE11 = !_global.ActiveXObject && 'ActiveXObject' in _global;
var WEAK_MAP = 'WeakMap';
var getWeak = _meta.getWeak;
var isExtensible = Object.isExtensible;
var uncaughtFrozenStore = _collectionWeak.ufstore;
var InternalMap;

var wrapper = function (get) {
  return function WeakMap() {
    return get(this, arguments.length > 0 ? arguments[0] : undefined);
  };
};

var methods = {
  // 23.3.3.3 WeakMap.prototype.get(key)
  get: function get(key) {
    if (_isObject(key)) {
      var data = getWeak(key);
      if (data === true) return uncaughtFrozenStore(_validateCollection(this, WEAK_MAP)).get(key);
      return data ? data[this._i] : undefined;
    }
  },
  // 23.3.3.5 WeakMap.prototype.set(key, value)
  set: function set(key, value) {
    return _collectionWeak.def(_validateCollection(this, WEAK_MAP), key, value);
  }
}; // 23.3 WeakMap Objects

var $WeakMap = module.exports = _collection(WEAK_MAP, wrapper, methods, _collectionWeak, true, true); // IE11 WeakMap frozen keys fix


if (NATIVE_WEAK_MAP && IS_IE11) {
  InternalMap = _collectionWeak.getConstructor(wrapper, WEAK_MAP);
  _objectAssign(InternalMap.prototype, methods);
  _meta.NEED = true;
  each(['delete', 'has', 'get', 'set'], function (key) {
    var proto = $WeakMap.prototype;
    var method = proto[key];
    _redefine(proto, key, function (a, b) {
      // store frozen objects on internal weakmap shim
      if (_isObject(a) && !isExtensible(a)) {
        if (!this._f) this._f = new InternalMap();

        var result = this._f[key](a, b);

        return key == 'set' ? this : result; // store all the rest on native weakmap
      }

      return method.call(this, a, b);
    });
  });
}
});

var WEAK_SET = 'WeakSet'; // 23.4 WeakSet Objects

_collection(WEAK_SET, function (get) {
  return function WeakSet() {
    return get(this, arguments.length > 0 ? arguments[0] : undefined);
  };
}, {
  // 23.4.3.1 WeakSet.prototype.add(value)
  add: function add(value) {
    return _collectionWeak.def(_validateCollection(this, WEAK_SET), value, true);
  }
}, _collectionWeak, false, true);

var TYPED = _uid('typed_array');
var VIEW = _uid('view');
var ABV = !!(_global.ArrayBuffer && _global.DataView);
var CONSTR = ABV;
var i$1 = 0;
var l = 9;
var Typed;
var TypedArrayConstructors = 'Int8Array,Uint8Array,Uint8ClampedArray,Int16Array,Uint16Array,Int32Array,Uint32Array,Float32Array,Float64Array'.split(',');

while (i$1 < l) {
  if (Typed = _global[TypedArrayConstructors[i$1++]]) {
    _hide(Typed.prototype, TYPED, true);
    _hide(Typed.prototype, VIEW, true);
  } else CONSTR = false;
}

var _typed = {
  ABV: ABV,
  CONSTR: CONSTR,
  TYPED: TYPED,
  VIEW: VIEW
};

// https://tc39.github.io/ecma262/#sec-toindex




var _toIndex = function (it) {
  if (it === undefined) return 0;
  var number = _toInteger(it);
  var length = _toLength(number);
  if (number !== length) throw RangeError('Wrong length!');
  return length;
};

var _typedBuffer = createCommonjsModule(function (module, exports) {























var gOPN = _objectGopn.f;

var dP = _objectDp.f;





var ARRAY_BUFFER = 'ArrayBuffer';
var DATA_VIEW = 'DataView';
var PROTOTYPE = 'prototype';
var WRONG_LENGTH = 'Wrong length!';
var WRONG_INDEX = 'Wrong index!';
var $ArrayBuffer = _global[ARRAY_BUFFER];
var $DataView = _global[DATA_VIEW];
var Math = _global.Math;
var RangeError = _global.RangeError; // eslint-disable-next-line no-shadow-restricted-names

var Infinity = _global.Infinity;
var BaseBuffer = $ArrayBuffer;
var abs = Math.abs;
var pow = Math.pow;
var floor = Math.floor;
var log = Math.log;
var LN2 = Math.LN2;
var BUFFER = 'buffer';
var BYTE_LENGTH = 'byteLength';
var BYTE_OFFSET = 'byteOffset';
var $BUFFER = _descriptors ? '_b' : BUFFER;
var $LENGTH = _descriptors ? '_l' : BYTE_LENGTH;
var $OFFSET = _descriptors ? '_o' : BYTE_OFFSET; // IEEE754 conversions based on https://github.com/feross/ieee754

function packIEEE754(value, mLen, nBytes) {
  var buffer = new Array(nBytes);
  var eLen = nBytes * 8 - mLen - 1;
  var eMax = (1 << eLen) - 1;
  var eBias = eMax >> 1;
  var rt = mLen === 23 ? pow(2, -24) - pow(2, -77) : 0;
  var i = 0;
  var s = value < 0 || value === 0 && 1 / value < 0 ? 1 : 0;
  var e, m, c;
  value = abs(value); // eslint-disable-next-line no-self-compare

  if (value != value || value === Infinity) {
    // eslint-disable-next-line no-self-compare
    m = value != value ? 1 : 0;
    e = eMax;
  } else {
    e = floor(log(value) / LN2);

    if (value * (c = pow(2, -e)) < 1) {
      e--;
      c *= 2;
    }

    if (e + eBias >= 1) {
      value += rt / c;
    } else {
      value += rt * pow(2, 1 - eBias);
    }

    if (value * c >= 2) {
      e++;
      c /= 2;
    }

    if (e + eBias >= eMax) {
      m = 0;
      e = eMax;
    } else if (e + eBias >= 1) {
      m = (value * c - 1) * pow(2, mLen);
      e = e + eBias;
    } else {
      m = value * pow(2, eBias - 1) * pow(2, mLen);
      e = 0;
    }
  }

  for (; mLen >= 8; buffer[i++] = m & 255, m /= 256, mLen -= 8);

  e = e << mLen | m;
  eLen += mLen;

  for (; eLen > 0; buffer[i++] = e & 255, e /= 256, eLen -= 8);

  buffer[--i] |= s * 128;
  return buffer;
}

function unpackIEEE754(buffer, mLen, nBytes) {
  var eLen = nBytes * 8 - mLen - 1;
  var eMax = (1 << eLen) - 1;
  var eBias = eMax >> 1;
  var nBits = eLen - 7;
  var i = nBytes - 1;
  var s = buffer[i--];
  var e = s & 127;
  var m;
  s >>= 7;

  for (; nBits > 0; e = e * 256 + buffer[i], i--, nBits -= 8);

  m = e & (1 << -nBits) - 1;
  e >>= -nBits;
  nBits += mLen;

  for (; nBits > 0; m = m * 256 + buffer[i], i--, nBits -= 8);

  if (e === 0) {
    e = 1 - eBias;
  } else if (e === eMax) {
    return m ? NaN : s ? -Infinity : Infinity;
  } else {
    m = m + pow(2, mLen);
    e = e - eBias;
  }

  return (s ? -1 : 1) * m * pow(2, e - mLen);
}

function unpackI32(bytes) {
  return bytes[3] << 24 | bytes[2] << 16 | bytes[1] << 8 | bytes[0];
}

function packI8(it) {
  return [it & 0xff];
}

function packI16(it) {
  return [it & 0xff, it >> 8 & 0xff];
}

function packI32(it) {
  return [it & 0xff, it >> 8 & 0xff, it >> 16 & 0xff, it >> 24 & 0xff];
}

function packF64(it) {
  return packIEEE754(it, 52, 8);
}

function packF32(it) {
  return packIEEE754(it, 23, 4);
}

function addGetter(C, key, internal) {
  dP(C[PROTOTYPE], key, {
    get: function () {
      return this[internal];
    }
  });
}

function get(view, bytes, index, isLittleEndian) {
  var numIndex = +index;
  var intIndex = _toIndex(numIndex);
  if (intIndex + bytes > view[$LENGTH]) throw RangeError(WRONG_INDEX);
  var store = view[$BUFFER]._b;
  var start = intIndex + view[$OFFSET];
  var pack = store.slice(start, start + bytes);
  return isLittleEndian ? pack : pack.reverse();
}

function set(view, bytes, index, conversion, value, isLittleEndian) {
  var numIndex = +index;
  var intIndex = _toIndex(numIndex);
  if (intIndex + bytes > view[$LENGTH]) throw RangeError(WRONG_INDEX);
  var store = view[$BUFFER]._b;
  var start = intIndex + view[$OFFSET];
  var pack = conversion(+value);

  for (var i = 0; i < bytes; i++) store[start + i] = pack[isLittleEndian ? i : bytes - i - 1];
}

if (!_typed.ABV) {
  $ArrayBuffer = function ArrayBuffer(length) {
    _anInstance(this, $ArrayBuffer, ARRAY_BUFFER);
    var byteLength = _toIndex(length);
    this._b = _arrayFill.call(new Array(byteLength), 0);
    this[$LENGTH] = byteLength;
  };

  $DataView = function DataView(buffer, byteOffset, byteLength) {
    _anInstance(this, $DataView, DATA_VIEW);
    _anInstance(buffer, $ArrayBuffer, DATA_VIEW);
    var bufferLength = buffer[$LENGTH];
    var offset = _toInteger(byteOffset);
    if (offset < 0 || offset > bufferLength) throw RangeError('Wrong offset!');
    byteLength = byteLength === undefined ? bufferLength - offset : _toLength(byteLength);
    if (offset + byteLength > bufferLength) throw RangeError(WRONG_LENGTH);
    this[$BUFFER] = buffer;
    this[$OFFSET] = offset;
    this[$LENGTH] = byteLength;
  };

  if (_descriptors) {
    addGetter($ArrayBuffer, BYTE_LENGTH, '_l');
    addGetter($DataView, BUFFER, '_b');
    addGetter($DataView, BYTE_LENGTH, '_l');
    addGetter($DataView, BYTE_OFFSET, '_o');
  }

  _redefineAll($DataView[PROTOTYPE], {
    getInt8: function getInt8(byteOffset) {
      return get(this, 1, byteOffset)[0] << 24 >> 24;
    },
    getUint8: function getUint8(byteOffset) {
      return get(this, 1, byteOffset)[0];
    },
    getInt16: function getInt16(byteOffset
    /* , littleEndian */
    ) {
      var bytes = get(this, 2, byteOffset, arguments[1]);
      return (bytes[1] << 8 | bytes[0]) << 16 >> 16;
    },
    getUint16: function getUint16(byteOffset
    /* , littleEndian */
    ) {
      var bytes = get(this, 2, byteOffset, arguments[1]);
      return bytes[1] << 8 | bytes[0];
    },
    getInt32: function getInt32(byteOffset
    /* , littleEndian */
    ) {
      return unpackI32(get(this, 4, byteOffset, arguments[1]));
    },
    getUint32: function getUint32(byteOffset
    /* , littleEndian */
    ) {
      return unpackI32(get(this, 4, byteOffset, arguments[1])) >>> 0;
    },
    getFloat32: function getFloat32(byteOffset
    /* , littleEndian */
    ) {
      return unpackIEEE754(get(this, 4, byteOffset, arguments[1]), 23, 4);
    },
    getFloat64: function getFloat64(byteOffset
    /* , littleEndian */
    ) {
      return unpackIEEE754(get(this, 8, byteOffset, arguments[1]), 52, 8);
    },
    setInt8: function setInt8(byteOffset, value) {
      set(this, 1, byteOffset, packI8, value);
    },
    setUint8: function setUint8(byteOffset, value) {
      set(this, 1, byteOffset, packI8, value);
    },
    setInt16: function setInt16(byteOffset, value
    /* , littleEndian */
    ) {
      set(this, 2, byteOffset, packI16, value, arguments[2]);
    },
    setUint16: function setUint16(byteOffset, value
    /* , littleEndian */
    ) {
      set(this, 2, byteOffset, packI16, value, arguments[2]);
    },
    setInt32: function setInt32(byteOffset, value
    /* , littleEndian */
    ) {
      set(this, 4, byteOffset, packI32, value, arguments[2]);
    },
    setUint32: function setUint32(byteOffset, value
    /* , littleEndian */
    ) {
      set(this, 4, byteOffset, packI32, value, arguments[2]);
    },
    setFloat32: function setFloat32(byteOffset, value
    /* , littleEndian */
    ) {
      set(this, 4, byteOffset, packF32, value, arguments[2]);
    },
    setFloat64: function setFloat64(byteOffset, value
    /* , littleEndian */
    ) {
      set(this, 8, byteOffset, packF64, value, arguments[2]);
    }
  });
} else {
  if (!_fails(function () {
    $ArrayBuffer(1);
  }) || !_fails(function () {
    new $ArrayBuffer(-1); // eslint-disable-line no-new
  }) || _fails(function () {
    new $ArrayBuffer(); // eslint-disable-line no-new

    new $ArrayBuffer(1.5); // eslint-disable-line no-new

    new $ArrayBuffer(NaN); // eslint-disable-line no-new

    return $ArrayBuffer.name != ARRAY_BUFFER;
  })) {
    $ArrayBuffer = function ArrayBuffer(length) {
      _anInstance(this, $ArrayBuffer);
      return new BaseBuffer(_toIndex(length));
    };

    var ArrayBufferProto = $ArrayBuffer[PROTOTYPE] = BaseBuffer[PROTOTYPE];

    for (var keys = gOPN(BaseBuffer), j = 0, key; keys.length > j;) {
      if (!((key = keys[j++]) in $ArrayBuffer)) _hide($ArrayBuffer, key, BaseBuffer[key]);
    }

    ArrayBufferProto.constructor = $ArrayBuffer;
  } // iOS Safari 7.x bug


  var view = new $DataView(new $ArrayBuffer(2));
  var $setInt8 = $DataView[PROTOTYPE].setInt8;
  view.setInt8(0, 2147483648);
  view.setInt8(1, 2147483649);
  if (view.getInt8(0) || !view.getInt8(1)) _redefineAll($DataView[PROTOTYPE], {
    setInt8: function setInt8(byteOffset, value) {
      $setInt8.call(this, byteOffset, value << 24 >> 24);
    },
    setUint8: function setUint8(byteOffset, value) {
      $setInt8.call(this, byteOffset, value << 24 >> 24);
    }
  }, true);
}

_setToStringTag($ArrayBuffer, ARRAY_BUFFER);
_setToStringTag($DataView, DATA_VIEW);
_hide($DataView[PROTOTYPE], _typed.VIEW, true);
exports[ARRAY_BUFFER] = $ArrayBuffer;
exports[DATA_VIEW] = $DataView;
});

var ArrayBuffer = _global.ArrayBuffer;



var $ArrayBuffer = _typedBuffer.ArrayBuffer;
var $DataView = _typedBuffer.DataView;
var $isView = _typed.ABV && ArrayBuffer.isView;
var $slice = $ArrayBuffer.prototype.slice;
var VIEW$1 = _typed.VIEW;
var ARRAY_BUFFER = 'ArrayBuffer';
_export(_export.G + _export.W + _export.F * (ArrayBuffer !== $ArrayBuffer), {
  ArrayBuffer: $ArrayBuffer
});
_export(_export.S + _export.F * !_typed.CONSTR, ARRAY_BUFFER, {
  // 24.1.3.1 ArrayBuffer.isView(arg)
  isView: function isView(it) {
    return $isView && $isView(it) || _isObject(it) && VIEW$1 in it;
  }
});
_export(_export.P + _export.U + _export.F * _fails(function () {
  return !new $ArrayBuffer(2).slice(1, undefined).byteLength;
}), ARRAY_BUFFER, {
  // 24.1.4.3 ArrayBuffer.prototype.slice(start, end)
  slice: function slice(start, end) {
    if ($slice !== undefined && end === undefined) return $slice.call(_anObject(this), start); // FF fix

    var len = _anObject(this).byteLength;
    var first = _toAbsoluteIndex(start, len);
    var fin = _toAbsoluteIndex(end === undefined ? len : end, len);
    var result = new (_speciesConstructor(this, $ArrayBuffer))(_toLength(fin - first));
    var viewS = new $DataView(this);
    var viewT = new $DataView(result);
    var index = 0;

    while (first < fin) {
      viewT.setUint8(index++, viewS.getUint8(first++));
    }

    return result;
  }
});

_setSpecies(ARRAY_BUFFER);

_export(_export.G + _export.W + _export.F * !_typed.ABV, {
  DataView: _typedBuffer.DataView
});

var _typedArray = createCommonjsModule(function (module) {

if (_descriptors) {
  var LIBRARY = _library;

  var global = _global;

  var fails = _fails;

  var $export = _export;

  var $typed = _typed;

  var $buffer = _typedBuffer;

  var ctx = _ctx;

  var anInstance = _anInstance;

  var propertyDesc = _propertyDesc;

  var hide = _hide;

  var redefineAll = _redefineAll;

  var toInteger = _toInteger;

  var toLength = _toLength;

  var toIndex = _toIndex;

  var toAbsoluteIndex = _toAbsoluteIndex;

  var toPrimitive = _toPrimitive;

  var has = _has;

  var classof = _classof;

  var isObject = _isObject;

  var toObject = _toObject;

  var isArrayIter = _isArrayIter;

  var create = _objectCreate;

  var getPrototypeOf = _objectGpo;

  var gOPN = _objectGopn.f;

  var getIterFn = core_getIteratorMethod;

  var uid = _uid;

  var wks = _wks;

  var createArrayMethod = _arrayMethods;

  var createArrayIncludes = _arrayIncludes;

  var speciesConstructor = _speciesConstructor;

  var ArrayIterators = es6_array_iterator;

  var Iterators = _iterators;

  var $iterDetect = _iterDetect;

  var setSpecies = _setSpecies;

  var arrayFill = _arrayFill;

  var arrayCopyWithin = _arrayCopyWithin;

  var $DP = _objectDp;

  var $GOPD = _objectGopd;

  var dP = $DP.f;
  var gOPD = $GOPD.f;
  var RangeError = global.RangeError;
  var TypeError = global.TypeError;
  var Uint8Array = global.Uint8Array;
  var ARRAY_BUFFER = 'ArrayBuffer';
  var SHARED_BUFFER = 'Shared' + ARRAY_BUFFER;
  var BYTES_PER_ELEMENT = 'BYTES_PER_ELEMENT';
  var PROTOTYPE = 'prototype';
  var ArrayProto = Array[PROTOTYPE];
  var $ArrayBuffer = $buffer.ArrayBuffer;
  var $DataView = $buffer.DataView;
  var arrayForEach = createArrayMethod(0);
  var arrayFilter = createArrayMethod(2);
  var arraySome = createArrayMethod(3);
  var arrayEvery = createArrayMethod(4);
  var arrayFind = createArrayMethod(5);
  var arrayFindIndex = createArrayMethod(6);
  var arrayIncludes = createArrayIncludes(true);
  var arrayIndexOf = createArrayIncludes(false);
  var arrayValues = ArrayIterators.values;
  var arrayKeys = ArrayIterators.keys;
  var arrayEntries = ArrayIterators.entries;
  var arrayLastIndexOf = ArrayProto.lastIndexOf;
  var arrayReduce = ArrayProto.reduce;
  var arrayReduceRight = ArrayProto.reduceRight;
  var arrayJoin = ArrayProto.join;
  var arraySort = ArrayProto.sort;
  var arraySlice = ArrayProto.slice;
  var arrayToString = ArrayProto.toString;
  var arrayToLocaleString = ArrayProto.toLocaleString;
  var ITERATOR = wks('iterator');
  var TAG = wks('toStringTag');
  var TYPED_CONSTRUCTOR = uid('typed_constructor');
  var DEF_CONSTRUCTOR = uid('def_constructor');
  var ALL_CONSTRUCTORS = $typed.CONSTR;
  var TYPED_ARRAY = $typed.TYPED;
  var VIEW = $typed.VIEW;
  var WRONG_LENGTH = 'Wrong length!';
  var $map = createArrayMethod(1, function (O, length) {
    return allocate(speciesConstructor(O, O[DEF_CONSTRUCTOR]), length);
  });
  var LITTLE_ENDIAN = fails(function () {
    // eslint-disable-next-line no-undef
    return new Uint8Array(new Uint16Array([1]).buffer)[0] === 1;
  });
  var FORCED_SET = !!Uint8Array && !!Uint8Array[PROTOTYPE].set && fails(function () {
    new Uint8Array(1).set({});
  });

  var toOffset = function (it, BYTES) {
    var offset = toInteger(it);
    if (offset < 0 || offset % BYTES) throw RangeError('Wrong offset!');
    return offset;
  };

  var validate = function (it) {
    if (isObject(it) && TYPED_ARRAY in it) return it;
    throw TypeError(it + ' is not a typed array!');
  };

  var allocate = function (C, length) {
    if (!(isObject(C) && TYPED_CONSTRUCTOR in C)) {
      throw TypeError('It is not a typed array constructor!');
    }

    return new C(length);
  };

  var speciesFromList = function (O, list) {
    return fromList(speciesConstructor(O, O[DEF_CONSTRUCTOR]), list);
  };

  var fromList = function (C, list) {
    var index = 0;
    var length = list.length;
    var result = allocate(C, length);

    while (length > index) result[index] = list[index++];

    return result;
  };

  var addGetter = function (it, key, internal) {
    dP(it, key, {
      get: function () {
        return this._d[internal];
      }
    });
  };

  var $from = function from(source
  /* , mapfn, thisArg */
  ) {
    var O = toObject(source);
    var aLen = arguments.length;
    var mapfn = aLen > 1 ? arguments[1] : undefined;
    var mapping = mapfn !== undefined;
    var iterFn = getIterFn(O);
    var i, length, values, result, step, iterator;

    if (iterFn != undefined && !isArrayIter(iterFn)) {
      for (iterator = iterFn.call(O), values = [], i = 0; !(step = iterator.next()).done; i++) {
        values.push(step.value);
      }

      O = values;
    }

    if (mapping && aLen > 2) mapfn = ctx(mapfn, arguments[2], 2);

    for (i = 0, length = toLength(O.length), result = allocate(this, length); length > i; i++) {
      result[i] = mapping ? mapfn(O[i], i) : O[i];
    }

    return result;
  };

  var $of = function of()
  /* ...items */
  {
    var index = 0;
    var length = arguments.length;
    var result = allocate(this, length);

    while (length > index) result[index] = arguments[index++];

    return result;
  }; // iOS Safari 6.x fails here


  var TO_LOCALE_BUG = !!Uint8Array && fails(function () {
    arrayToLocaleString.call(new Uint8Array(1));
  });

  var $toLocaleString = function toLocaleString() {
    return arrayToLocaleString.apply(TO_LOCALE_BUG ? arraySlice.call(validate(this)) : validate(this), arguments);
  };

  var proto = {
    copyWithin: function copyWithin(target, start
    /* , end */
    ) {
      return arrayCopyWithin.call(validate(this), target, start, arguments.length > 2 ? arguments[2] : undefined);
    },
    every: function every(callbackfn
    /* , thisArg */
    ) {
      return arrayEvery(validate(this), callbackfn, arguments.length > 1 ? arguments[1] : undefined);
    },
    fill: function fill(value
    /* , start, end */
    ) {
      // eslint-disable-line no-unused-vars
      return arrayFill.apply(validate(this), arguments);
    },
    filter: function filter(callbackfn
    /* , thisArg */
    ) {
      return speciesFromList(this, arrayFilter(validate(this), callbackfn, arguments.length > 1 ? arguments[1] : undefined));
    },
    find: function find(predicate
    /* , thisArg */
    ) {
      return arrayFind(validate(this), predicate, arguments.length > 1 ? arguments[1] : undefined);
    },
    findIndex: function findIndex(predicate
    /* , thisArg */
    ) {
      return arrayFindIndex(validate(this), predicate, arguments.length > 1 ? arguments[1] : undefined);
    },
    forEach: function forEach(callbackfn
    /* , thisArg */
    ) {
      arrayForEach(validate(this), callbackfn, arguments.length > 1 ? arguments[1] : undefined);
    },
    indexOf: function indexOf(searchElement
    /* , fromIndex */
    ) {
      return arrayIndexOf(validate(this), searchElement, arguments.length > 1 ? arguments[1] : undefined);
    },
    includes: function includes(searchElement
    /* , fromIndex */
    ) {
      return arrayIncludes(validate(this), searchElement, arguments.length > 1 ? arguments[1] : undefined);
    },
    join: function join(separator) {
      // eslint-disable-line no-unused-vars
      return arrayJoin.apply(validate(this), arguments);
    },
    lastIndexOf: function lastIndexOf(searchElement
    /* , fromIndex */
    ) {
      // eslint-disable-line no-unused-vars
      return arrayLastIndexOf.apply(validate(this), arguments);
    },
    map: function map(mapfn
    /* , thisArg */
    ) {
      return $map(validate(this), mapfn, arguments.length > 1 ? arguments[1] : undefined);
    },
    reduce: function reduce(callbackfn
    /* , initialValue */
    ) {
      // eslint-disable-line no-unused-vars
      return arrayReduce.apply(validate(this), arguments);
    },
    reduceRight: function reduceRight(callbackfn
    /* , initialValue */
    ) {
      // eslint-disable-line no-unused-vars
      return arrayReduceRight.apply(validate(this), arguments);
    },
    reverse: function reverse() {
      var that = this;
      var length = validate(that).length;
      var middle = Math.floor(length / 2);
      var index = 0;
      var value;

      while (index < middle) {
        value = that[index];
        that[index++] = that[--length];
        that[length] = value;
      }

      return that;
    },
    some: function some(callbackfn
    /* , thisArg */
    ) {
      return arraySome(validate(this), callbackfn, arguments.length > 1 ? arguments[1] : undefined);
    },
    sort: function sort(comparefn) {
      return arraySort.call(validate(this), comparefn);
    },
    subarray: function subarray(begin, end) {
      var O = validate(this);
      var length = O.length;
      var $begin = toAbsoluteIndex(begin, length);
      return new (speciesConstructor(O, O[DEF_CONSTRUCTOR]))(O.buffer, O.byteOffset + $begin * O.BYTES_PER_ELEMENT, toLength((end === undefined ? length : toAbsoluteIndex(end, length)) - $begin));
    }
  };

  var $slice = function slice(start, end) {
    return speciesFromList(this, arraySlice.call(validate(this), start, end));
  };

  var $set = function set(arrayLike
  /* , offset */
  ) {
    validate(this);
    var offset = toOffset(arguments[1], 1);
    var length = this.length;
    var src = toObject(arrayLike);
    var len = toLength(src.length);
    var index = 0;
    if (len + offset > length) throw RangeError(WRONG_LENGTH);

    while (index < len) this[offset + index] = src[index++];
  };

  var $iterators = {
    entries: function entries() {
      return arrayEntries.call(validate(this));
    },
    keys: function keys() {
      return arrayKeys.call(validate(this));
    },
    values: function values() {
      return arrayValues.call(validate(this));
    }
  };

  var isTAIndex = function (target, key) {
    return isObject(target) && target[TYPED_ARRAY] && typeof key != 'symbol' && key in target && String(+key) == String(key);
  };

  var $getDesc = function getOwnPropertyDescriptor(target, key) {
    return isTAIndex(target, key = toPrimitive(key, true)) ? propertyDesc(2, target[key]) : gOPD(target, key);
  };

  var $setDesc = function defineProperty(target, key, desc) {
    if (isTAIndex(target, key = toPrimitive(key, true)) && isObject(desc) && has(desc, 'value') && !has(desc, 'get') && !has(desc, 'set') // TODO: add validation descriptor w/o calling accessors
    && !desc.configurable && (!has(desc, 'writable') || desc.writable) && (!has(desc, 'enumerable') || desc.enumerable)) {
      target[key] = desc.value;
      return target;
    }

    return dP(target, key, desc);
  };

  if (!ALL_CONSTRUCTORS) {
    $GOPD.f = $getDesc;
    $DP.f = $setDesc;
  }

  $export($export.S + $export.F * !ALL_CONSTRUCTORS, 'Object', {
    getOwnPropertyDescriptor: $getDesc,
    defineProperty: $setDesc
  });

  if (fails(function () {
    arrayToString.call({});
  })) {
    arrayToString = arrayToLocaleString = function toString() {
      return arrayJoin.call(this);
    };
  }

  var $TypedArrayPrototype$ = redefineAll({}, proto);
  redefineAll($TypedArrayPrototype$, $iterators);
  hide($TypedArrayPrototype$, ITERATOR, $iterators.values);
  redefineAll($TypedArrayPrototype$, {
    slice: $slice,
    set: $set,
    constructor: function () {
      /* noop */
    },
    toString: arrayToString,
    toLocaleString: $toLocaleString
  });
  addGetter($TypedArrayPrototype$, 'buffer', 'b');
  addGetter($TypedArrayPrototype$, 'byteOffset', 'o');
  addGetter($TypedArrayPrototype$, 'byteLength', 'l');
  addGetter($TypedArrayPrototype$, 'length', 'e');
  dP($TypedArrayPrototype$, TAG, {
    get: function () {
      return this[TYPED_ARRAY];
    }
  }); // eslint-disable-next-line max-statements

  module.exports = function (KEY, BYTES, wrapper, CLAMPED) {
    CLAMPED = !!CLAMPED;
    var NAME = KEY + (CLAMPED ? 'Clamped' : '') + 'Array';
    var GETTER = 'get' + KEY;
    var SETTER = 'set' + KEY;
    var TypedArray = global[NAME];
    var Base = TypedArray || {};
    var TAC = TypedArray && getPrototypeOf(TypedArray);
    var FORCED = !TypedArray || !$typed.ABV;
    var O = {};
    var TypedArrayPrototype = TypedArray && TypedArray[PROTOTYPE];

    var getter = function (that, index) {
      var data = that._d;
      return data.v[GETTER](index * BYTES + data.o, LITTLE_ENDIAN);
    };

    var setter = function (that, index, value) {
      var data = that._d;
      if (CLAMPED) value = (value = Math.round(value)) < 0 ? 0 : value > 0xff ? 0xff : value & 0xff;
      data.v[SETTER](index * BYTES + data.o, value, LITTLE_ENDIAN);
    };

    var addElement = function (that, index) {
      dP(that, index, {
        get: function () {
          return getter(this, index);
        },
        set: function (value) {
          return setter(this, index, value);
        },
        enumerable: true
      });
    };

    if (FORCED) {
      TypedArray = wrapper(function (that, data, $offset, $length) {
        anInstance(that, TypedArray, NAME, '_d');
        var index = 0;
        var offset = 0;
        var buffer, byteLength, length, klass;

        if (!isObject(data)) {
          length = toIndex(data);
          byteLength = length * BYTES;
          buffer = new $ArrayBuffer(byteLength);
        } else if (data instanceof $ArrayBuffer || (klass = classof(data)) == ARRAY_BUFFER || klass == SHARED_BUFFER) {
          buffer = data;
          offset = toOffset($offset, BYTES);
          var $len = data.byteLength;

          if ($length === undefined) {
            if ($len % BYTES) throw RangeError(WRONG_LENGTH);
            byteLength = $len - offset;
            if (byteLength < 0) throw RangeError(WRONG_LENGTH);
          } else {
            byteLength = toLength($length) * BYTES;
            if (byteLength + offset > $len) throw RangeError(WRONG_LENGTH);
          }

          length = byteLength / BYTES;
        } else if (TYPED_ARRAY in data) {
          return fromList(TypedArray, data);
        } else {
          return $from.call(TypedArray, data);
        }

        hide(that, '_d', {
          b: buffer,
          o: offset,
          l: byteLength,
          e: length,
          v: new $DataView(buffer)
        });

        while (index < length) addElement(that, index++);
      });
      TypedArrayPrototype = TypedArray[PROTOTYPE] = create($TypedArrayPrototype$);
      hide(TypedArrayPrototype, 'constructor', TypedArray);
    } else if (!fails(function () {
      TypedArray(1);
    }) || !fails(function () {
      new TypedArray(-1); // eslint-disable-line no-new
    }) || !$iterDetect(function (iter) {
      new TypedArray(); // eslint-disable-line no-new

      new TypedArray(null); // eslint-disable-line no-new

      new TypedArray(1.5); // eslint-disable-line no-new

      new TypedArray(iter); // eslint-disable-line no-new
    }, true)) {
      TypedArray = wrapper(function (that, data, $offset, $length) {
        anInstance(that, TypedArray, NAME);
        var klass; // `ws` module bug, temporarily remove validation length for Uint8Array
        // https://github.com/websockets/ws/pull/645

        if (!isObject(data)) return new Base(toIndex(data));

        if (data instanceof $ArrayBuffer || (klass = classof(data)) == ARRAY_BUFFER || klass == SHARED_BUFFER) {
          return $length !== undefined ? new Base(data, toOffset($offset, BYTES), $length) : $offset !== undefined ? new Base(data, toOffset($offset, BYTES)) : new Base(data);
        }

        if (TYPED_ARRAY in data) return fromList(TypedArray, data);
        return $from.call(TypedArray, data);
      });
      arrayForEach(TAC !== Function.prototype ? gOPN(Base).concat(gOPN(TAC)) : gOPN(Base), function (key) {
        if (!(key in TypedArray)) hide(TypedArray, key, Base[key]);
      });
      TypedArray[PROTOTYPE] = TypedArrayPrototype;
      if (!LIBRARY) TypedArrayPrototype.constructor = TypedArray;
    }

    var $nativeIterator = TypedArrayPrototype[ITERATOR];
    var CORRECT_ITER_NAME = !!$nativeIterator && ($nativeIterator.name == 'values' || $nativeIterator.name == undefined);
    var $iterator = $iterators.values;
    hide(TypedArray, TYPED_CONSTRUCTOR, true);
    hide(TypedArrayPrototype, TYPED_ARRAY, NAME);
    hide(TypedArrayPrototype, VIEW, true);
    hide(TypedArrayPrototype, DEF_CONSTRUCTOR, TypedArray);

    if (CLAMPED ? new TypedArray(1)[TAG] != NAME : !(TAG in TypedArrayPrototype)) {
      dP(TypedArrayPrototype, TAG, {
        get: function () {
          return NAME;
        }
      });
    }

    O[NAME] = TypedArray;
    $export($export.G + $export.W + $export.F * (TypedArray != Base), O);
    $export($export.S, NAME, {
      BYTES_PER_ELEMENT: BYTES
    });
    $export($export.S + $export.F * fails(function () {
      Base.of.call(TypedArray, 1);
    }), NAME, {
      from: $from,
      of: $of
    });
    if (!(BYTES_PER_ELEMENT in TypedArrayPrototype)) hide(TypedArrayPrototype, BYTES_PER_ELEMENT, BYTES);
    $export($export.P, NAME, proto);
    setSpecies(NAME);
    $export($export.P + $export.F * FORCED_SET, NAME, {
      set: $set
    });
    $export($export.P + $export.F * !CORRECT_ITER_NAME, NAME, $iterators);
    if (!LIBRARY && TypedArrayPrototype.toString != arrayToString) TypedArrayPrototype.toString = arrayToString;
    $export($export.P + $export.F * fails(function () {
      new TypedArray(1).slice();
    }), NAME, {
      slice: $slice
    });
    $export($export.P + $export.F * (fails(function () {
      return [1, 2].toLocaleString() != new TypedArray([1, 2]).toLocaleString();
    }) || !fails(function () {
      TypedArrayPrototype.toLocaleString.call([1, 2]);
    })), NAME, {
      toLocaleString: $toLocaleString
    });
    Iterators[NAME] = CORRECT_ITER_NAME ? $nativeIterator : $iterator;
    if (!LIBRARY && !CORRECT_ITER_NAME) hide(TypedArrayPrototype, ITERATOR, $iterator);
  };
} else module.exports = function () {
  /* empty */
};
});

_typedArray('Int8', 1, function (init) {
  return function Int8Array(data, byteOffset, length) {
    return init(this, data, byteOffset, length);
  };
});

_typedArray('Uint8', 1, function (init) {
  return function Uint8Array(data, byteOffset, length) {
    return init(this, data, byteOffset, length);
  };
});

_typedArray('Uint8', 1, function (init) {
  return function Uint8ClampedArray(data, byteOffset, length) {
    return init(this, data, byteOffset, length);
  };
}, true);

_typedArray('Int16', 2, function (init) {
  return function Int16Array(data, byteOffset, length) {
    return init(this, data, byteOffset, length);
  };
});

_typedArray('Uint16', 2, function (init) {
  return function Uint16Array(data, byteOffset, length) {
    return init(this, data, byteOffset, length);
  };
});

_typedArray('Int32', 4, function (init) {
  return function Int32Array(data, byteOffset, length) {
    return init(this, data, byteOffset, length);
  };
});

_typedArray('Uint32', 4, function (init) {
  return function Uint32Array(data, byteOffset, length) {
    return init(this, data, byteOffset, length);
  };
});

_typedArray('Float32', 4, function (init) {
  return function Float32Array(data, byteOffset, length) {
    return init(this, data, byteOffset, length);
  };
});

_typedArray('Float64', 8, function (init) {
  return function Float64Array(data, byteOffset, length) {
    return init(this, data, byteOffset, length);
  };
});

// 26.1.1 Reflect.apply(target, thisArgument, argumentsList)






var rApply = (_global.Reflect || {}).apply;
var fApply = Function.apply; // MS Edge argumentsList argument is optional

_export(_export.S + _export.F * !_fails(function () {
  rApply(function () {
    /* empty */
  });
}), 'Reflect', {
  apply: function apply(target, thisArgument, argumentsList) {
    var T = _aFunction(target);
    var L = _anObject(argumentsList);
    return rApply ? rApply(T, thisArgument, L) : fApply.call(T, thisArgument, L);
  }
});

// 26.1.2 Reflect.construct(target, argumentsList [, newTarget])














var rConstruct = (_global.Reflect || {}).construct; // MS Edge supports only 2 arguments and argumentsList argument is optional
// FF Nightly sets third argument as `new.target`, but does not create `this` from it

var NEW_TARGET_BUG = _fails(function () {
  function F() {
    /* empty */
  }

  return !(rConstruct(function () {
    /* empty */
  }, [], F) instanceof F);
});
var ARGS_BUG = !_fails(function () {
  rConstruct(function () {
    /* empty */
  });
});
_export(_export.S + _export.F * (NEW_TARGET_BUG || ARGS_BUG), 'Reflect', {
  construct: function construct(Target, args
  /* , newTarget */
  ) {
    _aFunction(Target);
    _anObject(args);
    var newTarget = arguments.length < 3 ? Target : _aFunction(arguments[2]);
    if (ARGS_BUG && !NEW_TARGET_BUG) return rConstruct(Target, args, newTarget);

    if (Target == newTarget) {
      // w/o altered newTarget, optimization for 0-4 arguments
      switch (args.length) {
        case 0:
          return new Target();

        case 1:
          return new Target(args[0]);

        case 2:
          return new Target(args[0], args[1]);

        case 3:
          return new Target(args[0], args[1], args[2]);

        case 4:
          return new Target(args[0], args[1], args[2], args[3]);
      } // w/o altered newTarget, lot of arguments case


      var $args = [null];
      $args.push.apply($args, args);
      return new (_bind.apply(Target, $args))();
    } // with altered newTarget, not support built-in constructors


    var proto = newTarget.prototype;
    var instance = _objectCreate(_isObject(proto) ? proto : Object.prototype);
    var result = Function.apply.call(Target, instance, args);
    return _isObject(result) ? result : instance;
  }
});

// 26.1.3 Reflect.defineProperty(target, propertyKey, attributes)






 // MS Edge has broken Reflect.defineProperty - throwing instead of returning false


_export(_export.S + _export.F * _fails(function () {
  // eslint-disable-next-line no-undef
  Reflect.defineProperty(_objectDp.f({}, 1, {
    value: 1
  }), 1, {
    value: 2
  });
}), 'Reflect', {
  defineProperty: function defineProperty(target, propertyKey, attributes) {
    _anObject(target);
    propertyKey = _toPrimitive(propertyKey, true);
    _anObject(attributes);

    try {
      _objectDp.f(target, propertyKey, attributes);
      return true;
    } catch (e) {
      return false;
    }
  }
});

// 26.1.4 Reflect.deleteProperty(target, propertyKey)


var gOPD$3 = _objectGopd.f;



_export(_export.S, 'Reflect', {
  deleteProperty: function deleteProperty(target, propertyKey) {
    var desc = gOPD$3(_anObject(target), propertyKey);
    return desc && !desc.configurable ? false : delete target[propertyKey];
  }
});

var Enumerate = function (iterated) {
  this._t = _anObject(iterated); // target

  this._i = 0; // next index

  var keys = this._k = []; // keys

  var key;

  for (key in iterated) keys.push(key);
};

_iterCreate(Enumerate, 'Object', function () {
  var that = this;
  var keys = that._k;
  var key;

  do {
    if (that._i >= keys.length) return {
      value: undefined,
      done: true
    };
  } while (!((key = keys[that._i++]) in that._t));

  return {
    value: key,
    done: false
  };
});

_export(_export.S, 'Reflect', {
  enumerate: function enumerate(target) {
    return new Enumerate(target);
  }
});

// 26.1.6 Reflect.get(target, propertyKey [, receiver])












function get(target, propertyKey
/* , receiver */
) {
  var receiver = arguments.length < 3 ? target : arguments[2];
  var desc, proto;
  if (_anObject(target) === receiver) return target[propertyKey];
  if (desc = _objectGopd.f(target, propertyKey)) return _has(desc, 'value') ? desc.value : desc.get !== undefined ? desc.get.call(receiver) : undefined;
  if (_isObject(proto = _objectGpo(target))) return get(proto, propertyKey, receiver);
}

_export(_export.S, 'Reflect', {
  get: get
});

// 26.1.7 Reflect.getOwnPropertyDescriptor(target, propertyKey)






_export(_export.S, 'Reflect', {
  getOwnPropertyDescriptor: function getOwnPropertyDescriptor(target, propertyKey) {
    return _objectGopd.f(_anObject(target), propertyKey);
  }
});

// 26.1.8 Reflect.getPrototypeOf(target)






_export(_export.S, 'Reflect', {
  getPrototypeOf: function getPrototypeOf(target) {
    return _objectGpo(_anObject(target));
  }
});

// 26.1.9 Reflect.has(target, propertyKey)


_export(_export.S, 'Reflect', {
  has: function has(target, propertyKey) {
    return propertyKey in target;
  }
});

// 26.1.10 Reflect.isExtensible(target)




var $isExtensible = Object.isExtensible;
_export(_export.S, 'Reflect', {
  isExtensible: function isExtensible(target) {
    _anObject(target);
    return $isExtensible ? $isExtensible(target) : true;
  }
});

// all object keys, includes non-enumerable and symbols






var Reflect$1 = _global.Reflect;

var _ownKeys = Reflect$1 && Reflect$1.ownKeys || function ownKeys(it) {
  var keys = _objectGopn.f(_anObject(it));
  var getSymbols = _objectGops.f;
  return getSymbols ? keys.concat(getSymbols(it)) : keys;
};

// 26.1.11 Reflect.ownKeys(target)


_export(_export.S, 'Reflect', {
  ownKeys: _ownKeys
});

// 26.1.12 Reflect.preventExtensions(target)




var $preventExtensions = Object.preventExtensions;
_export(_export.S, 'Reflect', {
  preventExtensions: function preventExtensions(target) {
    _anObject(target);

    try {
      if ($preventExtensions) $preventExtensions(target);
      return true;
    } catch (e) {
      return false;
    }
  }
});

// 26.1.13 Reflect.set(target, propertyKey, V [, receiver])
















function set(target, propertyKey, V
/* , receiver */
) {
  var receiver = arguments.length < 4 ? target : arguments[3];
  var ownDesc = _objectGopd.f(_anObject(target), propertyKey);
  var existingDescriptor, proto;

  if (!ownDesc) {
    if (_isObject(proto = _objectGpo(target))) {
      return set(proto, propertyKey, V, receiver);
    }

    ownDesc = _propertyDesc(0);
  }

  if (_has(ownDesc, 'value')) {
    if (ownDesc.writable === false || !_isObject(receiver)) return false;

    if (existingDescriptor = _objectGopd.f(receiver, propertyKey)) {
      if (existingDescriptor.get || existingDescriptor.set || existingDescriptor.writable === false) return false;
      existingDescriptor.value = V;
      _objectDp.f(receiver, propertyKey, existingDescriptor);
    } else _objectDp.f(receiver, propertyKey, _propertyDesc(0, V));

    return true;
  }

  return ownDesc.set === undefined ? false : (ownDesc.set.call(receiver, V), true);
}

_export(_export.S, 'Reflect', {
  set: set
});

// 26.1.14 Reflect.setPrototypeOf(target, proto)




if (_setProto) _export(_export.S, 'Reflect', {
  setPrototypeOf: function setPrototypeOf(target, proto) {
    _setProto.check(target, proto);

    try {
      _setProto.set(target, proto);
      return true;
    } catch (e) {
      return false;
    }
  }
});

var $includes = _arrayIncludes(true);

_export(_export.P, 'Array', {
  includes: function includes(el
  /* , fromIndex = 0 */
  ) {
    return $includes(this, el, arguments.length > 1 ? arguments[1] : undefined);
  }
});

_addToUnscopables('includes');

var includes = _core.Array.includes;

var IS_CONCAT_SPREADABLE = _wks('isConcatSpreadable');

function flattenIntoArray(target, original, source, sourceLen, start, depth, mapper, thisArg) {
  var targetIndex = start;
  var sourceIndex = 0;
  var mapFn = mapper ? _ctx(mapper, thisArg, 3) : false;
  var element, spreadable;

  while (sourceIndex < sourceLen) {
    if (sourceIndex in source) {
      element = mapFn ? mapFn(source[sourceIndex], sourceIndex, original) : source[sourceIndex];
      spreadable = false;

      if (_isObject(element)) {
        spreadable = element[IS_CONCAT_SPREADABLE];
        spreadable = spreadable !== undefined ? !!spreadable : _isArray(element);
      }

      if (spreadable && depth > 0) {
        targetIndex = flattenIntoArray(target, original, element, _toLength(element.length), targetIndex, depth - 1) - 1;
      } else {
        if (targetIndex >= 0x1fffffffffffff) throw TypeError();
        target[targetIndex] = element;
      }

      targetIndex++;
    }

    sourceIndex++;
  }

  return targetIndex;
}

var _flattenIntoArray = flattenIntoArray;

_export(_export.P, 'Array', {
  flatMap: function flatMap(callbackfn
  /* , thisArg */
  ) {
    var O = _toObject(this);
    var sourceLen, A;
    _aFunction(callbackfn);
    sourceLen = _toLength(O.length);
    A = _arraySpeciesCreate(O, 0);
    _flattenIntoArray(A, O, O, sourceLen, 0, 1, callbackfn, arguments[1]);
    return A;
  }
});

_addToUnscopables('flatMap');

var flatMap = _core.Array.flatMap;

// https://github.com/tc39/proposal-string-pad-start-end






var _stringPad = function (that, maxLength, fillString, left) {
  var S = String(_defined(that));
  var stringLength = S.length;
  var fillStr = fillString === undefined ? ' ' : String(fillString);
  var intMaxLength = _toLength(maxLength);
  if (intMaxLength <= stringLength || fillStr == '') return S;
  var fillLen = intMaxLength - stringLength;
  var stringFiller = _stringRepeat.call(fillStr, Math.ceil(fillLen / fillStr.length));
  if (stringFiller.length > fillLen) stringFiller = stringFiller.slice(0, fillLen);
  return left ? stringFiller + S : S + stringFiller;
};

// https://github.com/zloirock/core-js/issues/280


var WEBKIT_BUG = /Version\/10\.\d+(\.\d+)?( Mobile\/\w+)? Safari\//.test(_userAgent);
_export(_export.P + _export.F * WEBKIT_BUG, 'String', {
  padStart: function padStart(maxLength
  /* , fillString = ' ' */
  ) {
    return _stringPad(this, maxLength, arguments.length > 1 ? arguments[1] : undefined, true);
  }
});

var padStart = _core.String.padStart;

// https://github.com/zloirock/core-js/issues/280


var WEBKIT_BUG$1 = /Version\/10\.\d+(\.\d+)?( Mobile\/\w+)? Safari\//.test(_userAgent);
_export(_export.P + _export.F * WEBKIT_BUG$1, 'String', {
  padEnd: function padEnd(maxLength
  /* , fillString = ' ' */
  ) {
    return _stringPad(this, maxLength, arguments.length > 1 ? arguments[1] : undefined, false);
  }
});

var padEnd = _core.String.padEnd;

_stringTrim('trimLeft', function ($trim) {
  return function trimLeft() {
    return $trim(this, 1);
  };
}, 'trimStart');

var trimStart = _core.String.trimLeft;

_stringTrim('trimRight', function ($trim) {
  return function trimRight() {
    return $trim(this, 2);
  };
}, 'trimEnd');

var trimEnd = _core.String.trimRight;

_wksDefine('asyncIterator');

var asyncIterator = _wksExt.f('asyncIterator');

// https://github.com/tc39/proposal-object-getownpropertydescriptors










_export(_export.S, 'Object', {
  getOwnPropertyDescriptors: function getOwnPropertyDescriptors(object) {
    var O = _toIobject(object);
    var getDesc = _objectGopd.f;
    var keys = _ownKeys(O);
    var result = {};
    var i = 0;
    var key, desc;

    while (keys.length > i) {
      desc = getDesc(O, key = keys[i++]);
      if (desc !== undefined) _createProperty(result, key, desc);
    }

    return result;
  }
});

var getOwnPropertyDescriptors = _core.Object.getOwnPropertyDescriptors;

var isEnum$1 = _objectPie.f;

var _objectToArray = function (isEntries) {
  return function (it) {
    var O = _toIobject(it);
    var keys = _objectKeys(O);
    var length = keys.length;
    var i = 0;
    var result = [];
    var key;

    while (length > i) {
      key = keys[i++];

      if (!_descriptors || isEnum$1.call(O, key)) {
        result.push(isEntries ? [key, O[key]] : O[key]);
      }
    }

    return result;
  };
};

// https://github.com/tc39/proposal-object-values-entries


var $values = _objectToArray(false);

_export(_export.S, 'Object', {
  values: function values(it) {
    return $values(it);
  }
});

var values = _core.Object.values;

// https://github.com/tc39/proposal-object-values-entries


var $entries = _objectToArray(true);

_export(_export.S, 'Object', {
  entries: function entries(it) {
    return $entries(it);
  }
});

var entries = _core.Object.entries;

_export(_export.P + _export.R, 'Promise', {
  'finally': function (onFinally) {
    var C = _speciesConstructor(this, _core.Promise || _global.Promise);
    var isFunction = typeof onFinally == 'function';
    return this.then(isFunction ? function (x) {
      return _promiseResolve(C, onFinally()).then(function () {
        return x;
      });
    } : onFinally, isFunction ? function (e) {
      return _promiseResolve(C, onFinally()).then(function () {
        throw e;
      });
    } : onFinally);
  }
});

var _finally = _core.Promise['finally'];

// ie9- setTimeout & setInterval additional parameters fix






var slice = [].slice;
var MSIE = /MSIE .\./.test(_userAgent); // <- dirty ie9- check

var wrap$1 = function (set) {
  return function (fn, time
  /* , ...args */
  ) {
    var boundArgs = arguments.length > 2;
    var args = boundArgs ? slice.call(arguments, 2) : false;
    return set(boundArgs ? function () {
      // eslint-disable-next-line no-new-func
      (typeof fn == 'function' ? fn : Function(fn)).apply(this, args);
    } : fn, time);
  };
};

_export(_export.G + _export.B + _export.F * MSIE, {
  setTimeout: wrap$1(_global.setTimeout),
  setInterval: wrap$1(_global.setInterval)
});

_export(_export.G + _export.B, {
  setImmediate: _task.set,
  clearImmediate: _task.clear
});

var ITERATOR$4 = _wks('iterator');
var TO_STRING_TAG = _wks('toStringTag');
var ArrayValues = _iterators.Array;
var DOMIterables = {
  CSSRuleList: true,
  // TODO: Not spec compliant, should be false.
  CSSStyleDeclaration: false,
  CSSValueList: false,
  ClientRectList: false,
  DOMRectList: false,
  DOMStringList: false,
  DOMTokenList: true,
  DataTransferItemList: false,
  FileList: false,
  HTMLAllCollection: false,
  HTMLCollection: false,
  HTMLFormElement: false,
  HTMLSelectElement: false,
  MediaList: true,
  // TODO: Not spec compliant, should be false.
  MimeTypeArray: false,
  NamedNodeMap: false,
  NodeList: true,
  PaintRequestList: false,
  Plugin: false,
  PluginArray: false,
  SVGLengthList: false,
  SVGNumberList: false,
  SVGPathSegList: false,
  SVGPointList: false,
  SVGStringList: false,
  SVGTransformList: false,
  SourceBufferList: false,
  StyleSheetList: true,
  // TODO: Not spec compliant, should be false.
  TextTrackCueList: false,
  TextTrackList: false,
  TouchList: false
};

for (var collections = _objectKeys(DOMIterables), i$2 = 0; i$2 < collections.length; i$2++) {
  var NAME$1 = collections[i$2];
  var explicit = DOMIterables[NAME$1];
  var Collection = _global[NAME$1];
  var proto$3 = Collection && Collection.prototype;
  var key$1;

  if (proto$3) {
    if (!proto$3[ITERATOR$4]) _hide(proto$3, ITERATOR$4, ArrayValues);
    if (!proto$3[TO_STRING_TAG]) _hide(proto$3, TO_STRING_TAG, NAME$1);
    _iterators[NAME$1] = ArrayValues;
    if (explicit) for (key$1 in es6_array_iterator) if (!proto$3[key$1]) _redefine(proto$3, key$1, es6_array_iterator[key$1], true);
  }
}

var runtime_1 = createCommonjsModule(function (module) {
/**
 * Copyright (c) 2014-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var runtime = function (exports) {

  var Op = Object.prototype;
  var hasOwn = Op.hasOwnProperty;
  var undefined$1; // More compressible than void 0.

  var $Symbol = typeof Symbol === "function" ? Symbol : {};
  var iteratorSymbol = $Symbol.iterator || "@@iterator";
  var asyncIteratorSymbol = $Symbol.asyncIterator || "@@asyncIterator";
  var toStringTagSymbol = $Symbol.toStringTag || "@@toStringTag";

  function wrap(innerFn, outerFn, self, tryLocsList) {
    // If outerFn provided and outerFn.prototype is a Generator, then outerFn.prototype instanceof Generator.
    var protoGenerator = outerFn && outerFn.prototype instanceof Generator ? outerFn : Generator;
    var generator = Object.create(protoGenerator.prototype);
    var context = new Context(tryLocsList || []); // The ._invoke method unifies the implementations of the .next,
    // .throw, and .return methods.

    generator._invoke = makeInvokeMethod(innerFn, self, context);
    return generator;
  }

  exports.wrap = wrap; // Try/catch helper to minimize deoptimizations. Returns a completion
  // record like context.tryEntries[i].completion. This interface could
  // have been (and was previously) designed to take a closure to be
  // invoked without arguments, but in all the cases we care about we
  // already have an existing method we want to call, so there's no need
  // to create a new function object. We can even get away with assuming
  // the method takes exactly one argument, since that happens to be true
  // in every case, so we don't have to touch the arguments object. The
  // only additional allocation required is the completion record, which
  // has a stable shape and so hopefully should be cheap to allocate.

  function tryCatch(fn, obj, arg) {
    try {
      return {
        type: "normal",
        arg: fn.call(obj, arg)
      };
    } catch (err) {
      return {
        type: "throw",
        arg: err
      };
    }
  }

  var GenStateSuspendedStart = "suspendedStart";
  var GenStateSuspendedYield = "suspendedYield";
  var GenStateExecuting = "executing";
  var GenStateCompleted = "completed"; // Returning this object from the innerFn has the same effect as
  // breaking out of the dispatch switch statement.

  var ContinueSentinel = {}; // Dummy constructor functions that we use as the .constructor and
  // .constructor.prototype properties for functions that return Generator
  // objects. For full spec compliance, you may wish to configure your
  // minifier not to mangle the names of these two functions.

  function Generator() {}

  function GeneratorFunction() {}

  function GeneratorFunctionPrototype() {} // This is a polyfill for %IteratorPrototype% for environments that
  // don't natively support it.


  var IteratorPrototype = {};

  IteratorPrototype[iteratorSymbol] = function () {
    return this;
  };

  var getProto = Object.getPrototypeOf;
  var NativeIteratorPrototype = getProto && getProto(getProto(values([])));

  if (NativeIteratorPrototype && NativeIteratorPrototype !== Op && hasOwn.call(NativeIteratorPrototype, iteratorSymbol)) {
    // This environment has a native %IteratorPrototype%; use it instead
    // of the polyfill.
    IteratorPrototype = NativeIteratorPrototype;
  }

  var Gp = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(IteratorPrototype);
  GeneratorFunction.prototype = Gp.constructor = GeneratorFunctionPrototype;
  GeneratorFunctionPrototype.constructor = GeneratorFunction;
  GeneratorFunctionPrototype[toStringTagSymbol] = GeneratorFunction.displayName = "GeneratorFunction"; // Helper for defining the .next, .throw, and .return methods of the
  // Iterator interface in terms of a single ._invoke method.

  function defineIteratorMethods(prototype) {
    ["next", "throw", "return"].forEach(function (method) {
      prototype[method] = function (arg) {
        return this._invoke(method, arg);
      };
    });
  }

  exports.isGeneratorFunction = function (genFun) {
    var ctor = typeof genFun === "function" && genFun.constructor;
    return ctor ? ctor === GeneratorFunction || // For the native GeneratorFunction constructor, the best we can
    // do is to check its .name property.
    (ctor.displayName || ctor.name) === "GeneratorFunction" : false;
  };

  exports.mark = function (genFun) {
    if (Object.setPrototypeOf) {
      Object.setPrototypeOf(genFun, GeneratorFunctionPrototype);
    } else {
      genFun.__proto__ = GeneratorFunctionPrototype;

      if (!(toStringTagSymbol in genFun)) {
        genFun[toStringTagSymbol] = "GeneratorFunction";
      }
    }

    genFun.prototype = Object.create(Gp);
    return genFun;
  }; // Within the body of any async function, `await x` is transformed to
  // `yield regeneratorRuntime.awrap(x)`, so that the runtime can test
  // `hasOwn.call(value, "__await")` to determine if the yielded value is
  // meant to be awaited.


  exports.awrap = function (arg) {
    return {
      __await: arg
    };
  };

  function AsyncIterator(generator) {
    function invoke(method, arg, resolve, reject) {
      var record = tryCatch(generator[method], generator, arg);

      if (record.type === "throw") {
        reject(record.arg);
      } else {
        var result = record.arg;
        var value = result.value;

        if (value && typeof value === "object" && hasOwn.call(value, "__await")) {
          return Promise.resolve(value.__await).then(function (value) {
            invoke("next", value, resolve, reject);
          }, function (err) {
            invoke("throw", err, resolve, reject);
          });
        }

        return Promise.resolve(value).then(function (unwrapped) {
          // When a yielded Promise is resolved, its final value becomes
          // the .value of the Promise<{value,done}> result for the
          // current iteration.
          result.value = unwrapped;
          resolve(result);
        }, function (error) {
          // If a rejected Promise was yielded, throw the rejection back
          // into the async generator function so it can be handled there.
          return invoke("throw", error, resolve, reject);
        });
      }
    }

    var previousPromise;

    function enqueue(method, arg) {
      function callInvokeWithMethodAndArg() {
        return new Promise(function (resolve, reject) {
          invoke(method, arg, resolve, reject);
        });
      }

      return previousPromise = // If enqueue has been called before, then we want to wait until
      // all previous Promises have been resolved before calling invoke,
      // so that results are always delivered in the correct order. If
      // enqueue has not been called before, then it is important to
      // call invoke immediately, without waiting on a callback to fire,
      // so that the async generator function has the opportunity to do
      // any necessary setup in a predictable way. This predictability
      // is why the Promise constructor synchronously invokes its
      // executor callback, and why async functions synchronously
      // execute code before the first await. Since we implement simple
      // async functions in terms of async generators, it is especially
      // important to get this right, even though it requires care.
      previousPromise ? previousPromise.then(callInvokeWithMethodAndArg, // Avoid propagating failures to Promises returned by later
      // invocations of the iterator.
      callInvokeWithMethodAndArg) : callInvokeWithMethodAndArg();
    } // Define the unified helper method that is used to implement .next,
    // .throw, and .return (see defineIteratorMethods).


    this._invoke = enqueue;
  }

  defineIteratorMethods(AsyncIterator.prototype);

  AsyncIterator.prototype[asyncIteratorSymbol] = function () {
    return this;
  };

  exports.AsyncIterator = AsyncIterator; // Note that simple async functions are implemented on top of
  // AsyncIterator objects; they just return a Promise for the value of
  // the final result produced by the iterator.

  exports.async = function (innerFn, outerFn, self, tryLocsList) {
    var iter = new AsyncIterator(wrap(innerFn, outerFn, self, tryLocsList));
    return exports.isGeneratorFunction(outerFn) ? iter // If outerFn is a generator, return the full iterator.
    : iter.next().then(function (result) {
      return result.done ? result.value : iter.next();
    });
  };

  function makeInvokeMethod(innerFn, self, context) {
    var state = GenStateSuspendedStart;
    return function invoke(method, arg) {
      if (state === GenStateExecuting) {
        throw new Error("Generator is already running");
      }

      if (state === GenStateCompleted) {
        if (method === "throw") {
          throw arg;
        } // Be forgiving, per 25.3.3.3.3 of the spec:
        // https://people.mozilla.org/~jorendorff/es6-draft.html#sec-generatorresume


        return doneResult();
      }

      context.method = method;
      context.arg = arg;

      while (true) {
        var delegate = context.delegate;

        if (delegate) {
          var delegateResult = maybeInvokeDelegate(delegate, context);

          if (delegateResult) {
            if (delegateResult === ContinueSentinel) continue;
            return delegateResult;
          }
        }

        if (context.method === "next") {
          // Setting context._sent for legacy support of Babel's
          // function.sent implementation.
          context.sent = context._sent = context.arg;
        } else if (context.method === "throw") {
          if (state === GenStateSuspendedStart) {
            state = GenStateCompleted;
            throw context.arg;
          }

          context.dispatchException(context.arg);
        } else if (context.method === "return") {
          context.abrupt("return", context.arg);
        }

        state = GenStateExecuting;
        var record = tryCatch(innerFn, self, context);

        if (record.type === "normal") {
          // If an exception is thrown from innerFn, we leave state ===
          // GenStateExecuting and loop back for another invocation.
          state = context.done ? GenStateCompleted : GenStateSuspendedYield;

          if (record.arg === ContinueSentinel) {
            continue;
          }

          return {
            value: record.arg,
            done: context.done
          };
        } else if (record.type === "throw") {
          state = GenStateCompleted; // Dispatch the exception by looping back around to the
          // context.dispatchException(context.arg) call above.

          context.method = "throw";
          context.arg = record.arg;
        }
      }
    };
  } // Call delegate.iterator[context.method](context.arg) and handle the
  // result, either by returning a { value, done } result from the
  // delegate iterator, or by modifying context.method and context.arg,
  // setting context.delegate to null, and returning the ContinueSentinel.


  function maybeInvokeDelegate(delegate, context) {
    var method = delegate.iterator[context.method];

    if (method === undefined$1) {
      // A .throw or .return when the delegate iterator has no .throw
      // method always terminates the yield* loop.
      context.delegate = null;

      if (context.method === "throw") {
        // Note: ["return"] must be used for ES3 parsing compatibility.
        if (delegate.iterator["return"]) {
          // If the delegate iterator has a return method, give it a
          // chance to clean up.
          context.method = "return";
          context.arg = undefined$1;
          maybeInvokeDelegate(delegate, context);

          if (context.method === "throw") {
            // If maybeInvokeDelegate(context) changed context.method from
            // "return" to "throw", let that override the TypeError below.
            return ContinueSentinel;
          }
        }

        context.method = "throw";
        context.arg = new TypeError("The iterator does not provide a 'throw' method");
      }

      return ContinueSentinel;
    }

    var record = tryCatch(method, delegate.iterator, context.arg);

    if (record.type === "throw") {
      context.method = "throw";
      context.arg = record.arg;
      context.delegate = null;
      return ContinueSentinel;
    }

    var info = record.arg;

    if (!info) {
      context.method = "throw";
      context.arg = new TypeError("iterator result is not an object");
      context.delegate = null;
      return ContinueSentinel;
    }

    if (info.done) {
      // Assign the result of the finished delegate to the temporary
      // variable specified by delegate.resultName (see delegateYield).
      context[delegate.resultName] = info.value; // Resume execution at the desired location (see delegateYield).

      context.next = delegate.nextLoc; // If context.method was "throw" but the delegate handled the
      // exception, let the outer generator proceed normally. If
      // context.method was "next", forget context.arg since it has been
      // "consumed" by the delegate iterator. If context.method was
      // "return", allow the original .return call to continue in the
      // outer generator.

      if (context.method !== "return") {
        context.method = "next";
        context.arg = undefined$1;
      }
    } else {
      // Re-yield the result returned by the delegate method.
      return info;
    } // The delegate iterator is finished, so forget it and continue with
    // the outer generator.


    context.delegate = null;
    return ContinueSentinel;
  } // Define Generator.prototype.{next,throw,return} in terms of the
  // unified ._invoke helper method.


  defineIteratorMethods(Gp);
  Gp[toStringTagSymbol] = "Generator"; // A Generator should always return itself as the iterator object when the
  // @@iterator function is called on it. Some browsers' implementations of the
  // iterator prototype chain incorrectly implement this, causing the Generator
  // object to not be returned from this call. This ensures that doesn't happen.
  // See https://github.com/facebook/regenerator/issues/274 for more details.

  Gp[iteratorSymbol] = function () {
    return this;
  };

  Gp.toString = function () {
    return "[object Generator]";
  };

  function pushTryEntry(locs) {
    var entry = {
      tryLoc: locs[0]
    };

    if (1 in locs) {
      entry.catchLoc = locs[1];
    }

    if (2 in locs) {
      entry.finallyLoc = locs[2];
      entry.afterLoc = locs[3];
    }

    this.tryEntries.push(entry);
  }

  function resetTryEntry(entry) {
    var record = entry.completion || {};
    record.type = "normal";
    delete record.arg;
    entry.completion = record;
  }

  function Context(tryLocsList) {
    // The root entry object (effectively a try statement without a catch
    // or a finally block) gives us a place to store values thrown from
    // locations where there is no enclosing try statement.
    this.tryEntries = [{
      tryLoc: "root"
    }];
    tryLocsList.forEach(pushTryEntry, this);
    this.reset(true);
  }

  exports.keys = function (object) {
    var keys = [];

    for (var key in object) {
      keys.push(key);
    }

    keys.reverse(); // Rather than returning an object with a next method, we keep
    // things simple and return the next function itself.

    return function next() {
      while (keys.length) {
        var key = keys.pop();

        if (key in object) {
          next.value = key;
          next.done = false;
          return next;
        }
      } // To avoid creating an additional object, we just hang the .value
      // and .done properties off the next function object itself. This
      // also ensures that the minifier will not anonymize the function.


      next.done = true;
      return next;
    };
  };

  function values(iterable) {
    if (iterable) {
      var iteratorMethod = iterable[iteratorSymbol];

      if (iteratorMethod) {
        return iteratorMethod.call(iterable);
      }

      if (typeof iterable.next === "function") {
        return iterable;
      }

      if (!isNaN(iterable.length)) {
        var i = -1,
            next = function next() {
          while (++i < iterable.length) {
            if (hasOwn.call(iterable, i)) {
              next.value = iterable[i];
              next.done = false;
              return next;
            }
          }

          next.value = undefined$1;
          next.done = true;
          return next;
        };

        return next.next = next;
      }
    } // Return an iterator with no values.


    return {
      next: doneResult
    };
  }

  exports.values = values;

  function doneResult() {
    return {
      value: undefined$1,
      done: true
    };
  }

  Context.prototype = {
    constructor: Context,
    reset: function (skipTempReset) {
      this.prev = 0;
      this.next = 0; // Resetting context._sent for legacy support of Babel's
      // function.sent implementation.

      this.sent = this._sent = undefined$1;
      this.done = false;
      this.delegate = null;
      this.method = "next";
      this.arg = undefined$1;
      this.tryEntries.forEach(resetTryEntry);

      if (!skipTempReset) {
        for (var name in this) {
          // Not sure about the optimal order of these conditions:
          if (name.charAt(0) === "t" && hasOwn.call(this, name) && !isNaN(+name.slice(1))) {
            this[name] = undefined$1;
          }
        }
      }
    },
    stop: function () {
      this.done = true;
      var rootEntry = this.tryEntries[0];
      var rootRecord = rootEntry.completion;

      if (rootRecord.type === "throw") {
        throw rootRecord.arg;
      }

      return this.rval;
    },
    dispatchException: function (exception) {
      if (this.done) {
        throw exception;
      }

      var context = this;

      function handle(loc, caught) {
        record.type = "throw";
        record.arg = exception;
        context.next = loc;

        if (caught) {
          // If the dispatched exception was caught by a catch block,
          // then let that catch block handle the exception normally.
          context.method = "next";
          context.arg = undefined$1;
        }

        return !!caught;
      }

      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        var record = entry.completion;

        if (entry.tryLoc === "root") {
          // Exception thrown outside of any try block that could handle
          // it, so set the completion value of the entire function to
          // throw the exception.
          return handle("end");
        }

        if (entry.tryLoc <= this.prev) {
          var hasCatch = hasOwn.call(entry, "catchLoc");
          var hasFinally = hasOwn.call(entry, "finallyLoc");

          if (hasCatch && hasFinally) {
            if (this.prev < entry.catchLoc) {
              return handle(entry.catchLoc, true);
            } else if (this.prev < entry.finallyLoc) {
              return handle(entry.finallyLoc);
            }
          } else if (hasCatch) {
            if (this.prev < entry.catchLoc) {
              return handle(entry.catchLoc, true);
            }
          } else if (hasFinally) {
            if (this.prev < entry.finallyLoc) {
              return handle(entry.finallyLoc);
            }
          } else {
            throw new Error("try statement without catch or finally");
          }
        }
      }
    },
    abrupt: function (type, arg) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];

        if (entry.tryLoc <= this.prev && hasOwn.call(entry, "finallyLoc") && this.prev < entry.finallyLoc) {
          var finallyEntry = entry;
          break;
        }
      }

      if (finallyEntry && (type === "break" || type === "continue") && finallyEntry.tryLoc <= arg && arg <= finallyEntry.finallyLoc) {
        // Ignore the finally entry if control is not jumping to a
        // location outside the try/catch block.
        finallyEntry = null;
      }

      var record = finallyEntry ? finallyEntry.completion : {};
      record.type = type;
      record.arg = arg;

      if (finallyEntry) {
        this.method = "next";
        this.next = finallyEntry.finallyLoc;
        return ContinueSentinel;
      }

      return this.complete(record);
    },
    complete: function (record, afterLoc) {
      if (record.type === "throw") {
        throw record.arg;
      }

      if (record.type === "break" || record.type === "continue") {
        this.next = record.arg;
      } else if (record.type === "return") {
        this.rval = this.arg = record.arg;
        this.method = "return";
        this.next = "end";
      } else if (record.type === "normal" && afterLoc) {
        this.next = afterLoc;
      }

      return ContinueSentinel;
    },
    finish: function (finallyLoc) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];

        if (entry.finallyLoc === finallyLoc) {
          this.complete(entry.completion, entry.afterLoc);
          resetTryEntry(entry);
          return ContinueSentinel;
        }
      }
    },
    "catch": function (tryLoc) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];

        if (entry.tryLoc === tryLoc) {
          var record = entry.completion;

          if (record.type === "throw") {
            var thrown = record.arg;
            resetTryEntry(entry);
          }

          return thrown;
        }
      } // The context.catch method must only be called with a location
      // argument that corresponds to a known catch block.


      throw new Error("illegal catch attempt");
    },
    delegateYield: function (iterable, resultName, nextLoc) {
      this.delegate = {
        iterator: values(iterable),
        resultName: resultName,
        nextLoc: nextLoc
      };

      if (this.method === "next") {
        // Deliberately forget the last sent value so that we don't
        // accidentally pass it on to the delegate.
        this.arg = undefined$1;
      }

      return ContinueSentinel;
    }
  }; // Regardless of whether this script is executing as a CommonJS module
  // or not, return the runtime object so that we can declare the variable
  // regeneratorRuntime in the outer scope, which allows this module to be
  // injected easily by `bin/regenerator --include-runtime script.js`.

  return exports;
}( // If this script is executing as a CommonJS module, use module.exports
// as the regeneratorRuntime namespace. Otherwise create a new empty
// object. Either way, the resulting object will be used to initialize
// the regeneratorRuntime variable at the top of this file.
 module.exports );

try {
  regeneratorRuntime = runtime;
} catch (accidentalStrictMode) {
  // This module should not be running in strict mode, so the above
  // assignment should always work unless something is misconfigured. Just
  // in case runtime.js accidentally runs in strict mode, we can escape
  // strict mode using a global Function call. This could conceivably fail
  // if a Content Security Policy forbids using Function, but in that case
  // the proper solution is to fix the accidental strict mode problem. If
  // you've misconfigured your bundler to force strict mode and applied a
  // CSP to forbid Function, and you're not willing to fix either of those
  // problems, please detail your unique predicament in a GitHub issue.
  Function("r", "regeneratorRuntime = r")(runtime);
}
});

var _global$1 = createCommonjsModule(function (module) {
// https://github.com/zloirock/core-js/issues/86#issuecomment-115759028
var global = module.exports = typeof window != 'undefined' && window.Math == Math ? window : typeof self != 'undefined' && self.Math == Math ? self // eslint-disable-next-line no-new-func
: Function('return this')();
if (typeof __g == 'number') __g = global; // eslint-disable-line no-undef
});

var _core$1 = createCommonjsModule(function (module) {
var core = module.exports = {
  version: '2.6.11'
};
if (typeof __e == 'number') __e = core; // eslint-disable-line no-undef
});
var _core_1$1 = _core$1.version;

var _aFunction$1 = function (it) {
  if (typeof it != 'function') throw TypeError(it + ' is not a function!');
  return it;
};

// optional / simple context binding


var _ctx$1 = function (fn, that, length) {
  _aFunction$1(fn);
  if (that === undefined) return fn;

  switch (length) {
    case 1:
      return function (a) {
        return fn.call(that, a);
      };

    case 2:
      return function (a, b) {
        return fn.call(that, a, b);
      };

    case 3:
      return function (a, b, c) {
        return fn.call(that, a, b, c);
      };
  }

  return function ()
  /* ...args */
  {
    return fn.apply(that, arguments);
  };
};

var _isObject$1 = function (it) {
  return typeof it === 'object' ? it !== null : typeof it === 'function';
};

var _anObject$1 = function (it) {
  if (!_isObject$1(it)) throw TypeError(it + ' is not an object!');
  return it;
};

var _fails$1 = function (exec) {
  try {
    return !!exec();
  } catch (e) {
    return true;
  }
};

// Thank's IE8 for his funny defineProperty
var _descriptors$1 = !_fails$1(function () {
  return Object.defineProperty({}, 'a', {
    get: function () {
      return 7;
    }
  }).a != 7;
});

var document$3 = _global$1.document; // typeof document.createElement is 'object' in old IE


var is$1 = _isObject$1(document$3) && _isObject$1(document$3.createElement);

var _domCreate$1 = function (it) {
  return is$1 ? document$3.createElement(it) : {};
};

var _ie8DomDefine$1 = !_descriptors$1 && !_fails$1(function () {
  return Object.defineProperty(_domCreate$1('div'), 'a', {
    get: function () {
      return 7;
    }
  }).a != 7;
});

// 7.1.1 ToPrimitive(input [, PreferredType])
 // instead of the ES6 spec version, we didn't implement @@toPrimitive case
// and the second argument - flag - preferred type is a string


var _toPrimitive$1 = function (it, S) {
  if (!_isObject$1(it)) return it;
  var fn, val;
  if (S && typeof (fn = it.toString) == 'function' && !_isObject$1(val = fn.call(it))) return val;
  if (typeof (fn = it.valueOf) == 'function' && !_isObject$1(val = fn.call(it))) return val;
  if (!S && typeof (fn = it.toString) == 'function' && !_isObject$1(val = fn.call(it))) return val;
  throw TypeError("Can't convert object to primitive value");
};

var dP$6 = Object.defineProperty;
var f$8 = _descriptors$1 ? Object.defineProperty : function defineProperty(O, P, Attributes) {
  _anObject$1(O);
  P = _toPrimitive$1(P, true);
  _anObject$1(Attributes);
  if (_ie8DomDefine$1) try {
    return dP$6(O, P, Attributes);
  } catch (e) {
    /* empty */
  }
  if ('get' in Attributes || 'set' in Attributes) throw TypeError('Accessors not supported!');
  if ('value' in Attributes) O[P] = Attributes.value;
  return O;
};

var _objectDp$1 = {
	f: f$8
};

var _propertyDesc$1 = function (bitmap, value) {
  return {
    enumerable: !(bitmap & 1),
    configurable: !(bitmap & 2),
    writable: !(bitmap & 4),
    value: value
  };
};

var _hide$1 = _descriptors$1 ? function (object, key, value) {
  return _objectDp$1.f(object, key, _propertyDesc$1(1, value));
} : function (object, key, value) {
  object[key] = value;
  return object;
};

var hasOwnProperty$1 = {}.hasOwnProperty;

var _has$1 = function (it, key) {
  return hasOwnProperty$1.call(it, key);
};

var PROTOTYPE$3 = 'prototype';

var $export$1 = function (type, name, source) {
  var IS_FORCED = type & $export$1.F;
  var IS_GLOBAL = type & $export$1.G;
  var IS_STATIC = type & $export$1.S;
  var IS_PROTO = type & $export$1.P;
  var IS_BIND = type & $export$1.B;
  var IS_WRAP = type & $export$1.W;
  var exports = IS_GLOBAL ? _core$1 : _core$1[name] || (_core$1[name] = {});
  var expProto = exports[PROTOTYPE$3];
  var target = IS_GLOBAL ? _global$1 : IS_STATIC ? _global$1[name] : (_global$1[name] || {})[PROTOTYPE$3];
  var key, own, out;
  if (IS_GLOBAL) source = name;

  for (key in source) {
    // contains in native
    own = !IS_FORCED && target && target[key] !== undefined;
    if (own && _has$1(exports, key)) continue; // export native or passed

    out = own ? target[key] : source[key]; // prevent global pollution for namespaces

    exports[key] = IS_GLOBAL && typeof target[key] != 'function' ? source[key] // bind timers to global for call from export context
    : IS_BIND && own ? _ctx$1(out, _global$1) // wrap global constructors for prevent change them in library
    : IS_WRAP && target[key] == out ? function (C) {
      var F = function (a, b, c) {
        if (this instanceof C) {
          switch (arguments.length) {
            case 0:
              return new C();

            case 1:
              return new C(a);

            case 2:
              return new C(a, b);
          }

          return new C(a, b, c);
        }

        return C.apply(this, arguments);
      };

      F[PROTOTYPE$3] = C[PROTOTYPE$3];
      return F; // make static versions for prototype methods
    }(out) : IS_PROTO && typeof out == 'function' ? _ctx$1(Function.call, out) : out; // export proto methods to core.%CONSTRUCTOR%.methods.%NAME%

    if (IS_PROTO) {
      (exports.virtual || (exports.virtual = {}))[key] = out; // export proto methods to core.%CONSTRUCTOR%.prototype.%NAME%

      if (type & $export$1.R && expProto && !expProto[key]) _hide$1(expProto, key, out);
    }
  }
}; // type bitmap


$export$1.F = 1; // forced

$export$1.G = 2; // global

$export$1.S = 4; // static

$export$1.P = 8; // proto

$export$1.B = 16; // bind

$export$1.W = 32; // wrap

$export$1.U = 64; // safe

$export$1.R = 128; // real proto method for `library`

var _export$1 = $export$1;

// https://github.com/tc39/proposal-global


_export$1(_export$1.G, {
  global: _global$1
});

var global = _core$1.global;

var lib = createCommonjsModule(function (module) {



var _global = _interopRequireDefault(global);

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : {
    "default": obj
  };
}

if (_global["default"]._babelPolyfill && typeof console !== "undefined" && console.warn) {
  console.warn("@babel/polyfill is loaded more than once on this page. This is probably not desirable/intended " + "and may have consequences if different versions of the polyfills are applied sequentially. " + "If you do need to load the polyfill more than once, use @babel/polyfill/noConflict " + "instead to bypass the warning.");
}

_global["default"]._babelPolyfill = true;
});

unwrapExports(lib);

console.info(`%c  CUSTOM-HEADER  \n%c  ${localize('common.version')} master  `, 'color: orange; font-weight: bold; background: black', 'color: white; font-weight: bold; background: dimgray');
buildConfig();
