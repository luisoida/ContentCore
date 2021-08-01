/*
 * cc.js - contentcore content builder code
 * copyright (c) 2021 luis oida
 */

var mainSection = document.createElement('main');

var createElement = function (data) {
    console.debug(`Loading item [${data.id}]...`)
    let element = document.createElement(data.id);

    if (data.hasOwnProperty('contentType')) {
        switch (data.contentType) {
            case 'text':
                element.textContent = data.content;
                break;
            case 'elements':
                Object.entries(data.content).forEach(([key, value]) => {
                    element.appendChild(createElement(value));
                });
                break;
            case 'paragraphs':
                Object.entries(data.content).forEach(([id, object]) => {
                    let paragraph = document.createElement('p');
                    paragraph.textContent = object;
                    element.appendChild(paragraph);
                })
                break;
        }
    }

    if (data.hasOwnProperty('attributes')) {
        Object.entries(data.attributes).forEach(([key, value]) => {
            if (value.hasOwnProperty('attribute') && value.hasOwnProperty('value')) {
                console.debug(`Setting attribute [${value.attribute}] = ${value.value}`);
                element.setAttribute(value.attribute, value.value);
            }
        });
    }

    console.debug(`Modifying content for [${element.innerHTML}]...`);
    element.innerHTML = element.innerHTML.replace('%{CC_VERSION}', CC_VERSION);
    element.innerHTML = element.innerHTML.replace('%{CC_BRANDED_VERSION}', CC_BRANDED_VERSION);
    return element;
};

class CCContent extends HTMLElement {
    static get observedAttributes() {
        return ['current', 'update'];
    }

    constructor() {
        super();
    }

    connectedCallback() {
        this.appendChild(mainSection);
        console.log('Connected to CCContent...');
    }

    disconnectedCallback() {

    }

    attributeChangedCallback(attrName, oldValue, newValue) {
        console.log(`Attribute shifted: ${attrName} from ${oldValue} to ${newValue}`);
        switch (attrName) {
            case 'update':
                if (this.hasAttribute('update')) {
                    new Promise(function (resolve, reject) {
                        // clear children
                        while (mainSection.firstChild) {
                            mainSection.removeChild(mainSection.firstChild);
                        }
    
                        if (!mainSection.firstChild) {
                            resolve();
                        }
                    }).then(
                        resolve => {
                            if (this.hasAttribute('update') && session.activePage.loaded) {
                                console.log('Preparing to add content...');
                                Object.entries(session.activePage.data.contents).forEach(([key, value]) => {
                                    console.debug(`Loading item ${key} [${value.id}]...`)
                                    mainSection.appendChild(createElement(value));
                                });
                            }
                            this.removeAttribute('update');
                        }
                    );
                }
                break;
        }
    }
}

customElements.define('cc-content', CCContent);