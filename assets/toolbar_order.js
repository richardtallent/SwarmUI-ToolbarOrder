/** Reorders the header controls of GenPageBrowserClass browsers (Models, LoRAs, Presets, etc). */
class ToolbarOrderHelper {

    /** Maps the end of an element's id to its token, for the controls with a recognizable id. */
    static idTokens = {
        '_refresh_button': 'refresh',
        '_up_button': 'up',
        '_multiselect_toggle': 'multiselect',
        '_multiselect_action': 'multiselect',
        '-format-selector': 'format',
        '_sort_by': 'sort',
        '_sort_reverse': 'reverse',
        '_allow_anims': 'allow-anims'
    };

    constructor() {
        let baseOrder = ['refresh', 'sort', 'reverse', 'filter', 'depth', 'up', 'multiselect'];
        this.config = {
            default: {
                order: [...baseOrder, 'format']
            },
            presetbrowser: {
                order: [...baseOrder, 'apply', '*', 'format']
            }
        };
        this.done = new WeakSet();
        this.observer = new MutationObserver(mutations => {
            for (let mutation of mutations) {
                if (mutation.addedNodes.length > 0) {
                    this.scan();
                    return;
                }
            }
        });
    }

    /** Loads the optional user config (merged per browser entry over the defaults), then starts watching for browser headers and handles any already present. */
    async start(userConfigUrl) {
        try {
            let response = await fetch(userConfigUrl);
            if (response.ok) {
                let userConfig = await response.json();
                for (let key in userConfig) {
                    this.config[key] = { ...this.config[key], ...userConfig[key] };
                }
            }
        }
        catch (e) {
            console.log(`ToolbarOrder: ignoring unreadable user config: ${e}`);
        }
        this.observer.observe(document.body, { childList: true, subtree: true });
        this.scan();
    }

    /**
     * Applies the config to any not-yet-processed browser header bars.
     */
    scan() {
        for (let header of document.getElementsByClassName('browser-header-bar')) {
            if (this.done.has(header) || !header.id.endsWith('-header')) {
                continue;
            }
            let buttons = header.querySelector('.browser-header-buttons');
            if (!buttons) {
                continue;
            }
            this.done.add(header);
            this.apply(header, buttons, header.id.substring(0, header.id.length - '-header'.length));
        }
    }

    /**
     * Converts text to a token-style slug, eg "Export All" to "export-all".
     */
    slug(text) {
        return text.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    }

    /**
     * Returns the token for a header element that is identifiable by itself, or null.
     */
    tokenFor(elem) {
        for (let suffix in ToolbarOrderHelper.idTokens) {
            if (elem.id.endsWith(suffix)) {
                return ToolbarOrderHelper.idTokens[suffix];
            }
        }
        if (elem.classList.contains('input_filter_container')) {
            return 'filter';
        }
        if (elem.querySelector('[id$="_depth_input"]')) {
            return 'depth';
        }
        if (elem.tagName == 'BUTTON') {
            return this.slug(elem.textContent);
        }
        return null;
    }

    /** Returns the index in a token list of the first entry matching the token (exactly, or as the start of a longer button name), or -1. */
    matchIndex(token, list) {
        if (!token) {
            return -1;
        }
        let index = list.indexOf(token);
        if (index < 0) {
            index = list.findIndex(want => token.startsWith(want + '-'));
        }
        return index;
    }

    /** Reorders and hides the controls of one browser header. */
    apply(header, buttons, id) {
        let config = this.config[id] || {};
        let order = config.order || this.config.default.order;
        let hide = config.hide || this.config.default.hide || [];
        let candidates = [...header.querySelectorAll('.browser-header-buttons > *, select[id$="-format-selector"]')];
        for (let node of [...buttons.childNodes]) {
            if (node.nodeType == Node.TEXT_NODE) {
                node.remove();
            }
        }
        let units = new Map();
        for (let elem of candidates) {
            let owner = (elem.tagName == 'LABEL' && elem.htmlFor ? document.getElementById(elem.htmlFor) : null) || elem;
            let token = this.tokenFor(owner);
            let key = token || elem;
            if (!units.has(key)) {
                units.set(key, { token, nodes: [] });
            }
            units.get(key).nodes.push(elem);
        }
        let star = order.includes('*') ? order.indexOf('*') : order.length;
        let rank = unit => {
            let index = this.matchIndex(unit.token, order);
            return index < 0 ? star : index;
        };
        for (let unit of [...units.values()].sort((a, b) => rank(a) - rank(b))) {
            let hidden = this.matchIndex(unit.token, hide) >= 0;
            for (let node of unit.nodes) {
                buttons.appendChild(node);
                buttons.appendChild(document.createTextNode(' '));
                if (hidden) {
                    node.style.display = 'none';
                }
            }
        }
    }
}

let toolbarOrderHelper = new ToolbarOrderHelper();
toolbarOrderHelper.start(new URL('../toolbar_order.user.json', document.currentScript.src).href);
