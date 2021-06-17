/*
 * cc_builder.js - site builder
 * copyright (c) 2021 luis oida.
 */

/**
 * A class containing the site builder element and the necessary functions to operate the site builder program within
 * the web browser.
 */
class CCSiteBuilder extends HTMLElement {
    static get observedAttributes() {
        return ['mode'];
    }

    constructor() {
        super();
    }

    connectedCallback() {

    }

    disconnectedCallback() {
        
    }

    attributeChangedCallback(attrName, oldValue, newValue) {

    }
}

customElements.define('cc-site-builder', CCSiteBuilder);