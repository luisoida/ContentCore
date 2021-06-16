/*
 * cc.js - contentcore navigation core
 * copyright (c) 2021 luis oida
 */

ccNavLoaded = true;
var ccSiteNav;
var ccSiteNavList;

/**
 * The custom HTML element used to create a navigation bar atop all the web pages of a site.
 */
class CCSiteNav extends HTMLElement {
    static get observedAttributes() {
        return ['current', 'ready', 'update'];
    }

    constructor() {
        super();
    }

    connectedCallback() {
        console.info('Navigation bar attached.');
        ccSiteNav = document.createElement('nav');
        ccSiteNav.setAttribute('class', 'cc-nav-bar');

        ccSiteNavList = document.createElement('ul');
        ccSiteNav.appendChild(ccSiteNavList);

        this.appendChild(ccSiteNav);

        if (pageDataLoaded) {
            console.log('Page data received.');
        }
    }

    disconnectedCallback() {

    }

    attributeChangedCallback(attrName, oldValue, newValue) {
        let linkInsertion = window.location.href.split('?')[0];

        console.info(`Attribute shifted: ${attrName} from ${oldValue} to ${newValue}`);
        switch (attrName) {
            case 'ready':
                if (newValue) {
                    if (pageDataLoaded) {
                        console.debug(pageData.nav_bar);
                        Object.entries(pageData.nav_bar).forEach(([key, value]) => {
                            let navItem = document.createElement('li');
                            let linkItem = document.createElement('a');
                            linkItem.textContent = value.title;
                            console.log(`Creating "${value.title}" with destination ${value.target} (${value.target_location})`);
                            switch (value.target_location) {
                                case 'external':
                                    linkItem.setAttribute('href', value.target);
                                    break;
                                default:
                                    console.debug(`Setting onclick to [loadPage("${value.target}")]...`)
                                    linkItem.setAttribute('onclick', `loadPage("${value.target}")`);
                                    linkItem.setAttribute('href', 'javascript:void(0);');
                                    if (value.target === pageId || value.target === "home" && pageId === "") {
                                        linkItem.classList.add('class', 'cc-nav-link-current');
                                    } else {
                                        if (linkItem.classList.contains('cc-nav-link-current')) {
                                            linkItem.classList.remove('cc-nav-list-current');
                                        }
                                    }
                                    break;
                            }
                            
                            switch (value.target_target) {
                                case 'new_window':
                                    linkItem.setAttribute('target', '_blank');
                                    break;
                            }

                            navItem.appendChild(linkItem);
                            // TODO: Set attribute 'href' depending on the link
                            ccSiteNavList.appendChild(navItem);
                        });
                    }
                }
                break;
            case 'update':
                break;
        }
    }
}

customElements.define('cc-site-nav', CCSiteNav);