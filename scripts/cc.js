/*
 * cc.js - contentcore foundation code
 * copyright (c) 2021 luis oida
 */

const CC_VERSION = '0.0dev00002';
const CC_BRANDED_VERSION = 'Apricot';

/**
 * The internal reading data of the page.
 * @type {{siteData: {loaded: boolean, data: null}, activePage: {loaded: boolean, data: null}, pageData: {loaded: boolean, data: null}}}
 */
var session = {
    siteData: {
        loaded: false,
        data: null
    },
    pageData: {
        loaded: false,
        data: null
    },
    activePage: {
        loaded: false,
        data: null
    },
    navigationReady: false
};

var elements = {
    head: document.head
};

var ccNavLoaded = false;

const searchParams = new URLSearchParams(window.location.search);
var pageId = searchParams.get('page');

/**
 * The document head element.
 */
let docHead = document.head;

/**
 * Read JSON file from a server.
 * @param {The URL of the JSON file.} url 
 * @param {A function called after the file is received.} callback 
 */
var read = function(url, callback) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.responseType = 'json';
    xhr.onload = function() {
        var status = xhr.status;
        if (status == 200) {
            callback(null, xhr.response);
        } else {
            callback(status, xhr.response);
        }
    };
    xhr.send();
};

/**
 * Loads pages from the web site JSON file.
 * @param {The callback function to be executed after pages are loaded.} callback 
 */
var loadpages = function(callback) {
    if (session.siteData.loaded) {
        console.debug('Attempting to receive pages...');
        console.debug(`pages == ${session.siteData.data.pages}`)

        new Promise(function (resolve, reject) {
            read(session.siteData.data.pages, function(status, data) {
                if (status !== null) {
                    console.error(`Could not load page data with error code: ${status}`);
    
                    session.pageData.loaded = false;
                    session.pageData.data = null;
    
                    reject();
                } else {
                    // set data
                    console.info('Received page data successfully.');
                    console.debug(data);

                    session.pageData.loaded = true;
                    session.pageData.data = data;
                    console.log('Page data stored.');

                    // check if stylesheets property exists
                    if (session.siteData.data.hasOwnProperty('stylesheets')) {
                        // for each stylesheet, add a sheet element
                        Object.entries(session.siteData.data.stylesheets).forEach(([key, value]) => {
                            let sheet = document.createElement('link');
                            sheet.setAttribute('href', value);
                            sheet.setAttribute('rel', 'stylesheet');

                            docHead.appendChild(sheet);
                        });
                    }

                    // update current page
                    if (pageId == null) {
                        pageId = 'home';
                    }
    
                    console.debug(`pageId == ${pageId}`);
                    loadPage(pageId);
    
                    resolve();
                }
            });
        }).then(
            resolve => {
                // update navigation bar
                let navBar = document.getElementById('cc-site-nav');
                if (navBar !== null) {
                    navBar.setAttribute('ready', 'true');
                } else {
                    console.error('No navigation bar detected.');
                }

                // update current page
                let contents = document.getElementById('cc-site-content');
                if (contents !== null) {
                    console.log('Setting update attribute...');
                    contents.setAttribute('update', '');
                } else {
                    console.error('No contents element detected.');
                }
            },
            reject => console.error('Could not load pages.')
        );
    } else {
        console.error('Could not load pages: site data not loaded.');
    }
};

/**
 * Loads the site settings JSON and transforms the site data.
 * @param {The function to be called after the site settings are loaded.} callback 
 */
var loadsite = function(callback) {
    read('settings.json', function(status, data) {
        if (status !== null) {
            console.error(`Could not load site settings with error code: ${status}`);

            session.siteData.loaded = false;
            session.siteData.data = null;
        } else {
            console.info('Received site settings successfully.');
            console.debug(data);

            session.siteData.loaded = true;
            session.siteData.data = data;
        }

        callback();
        return session.siteData.loaded;
    });
};

/**
 * Loads a page and modifies cc-content elements to include the contents and information that the specific page includes
 * in the page data file.
 * @param {The page ID that the cc-content element will contain.} page 
 */
var loadPage = function(page) {
    // get page
    console.log(`Loading data for page [${page}]...`);
    var data;
    Object.entries(session.pageData.data.pages).forEach(([key, value]) => {
        console.debug(`Skimming ${key}...`);
        if (value.id === page) {
            data = value;
        }
    });

    //let data = pageData.cc_pages.pages[page];
    if (data != null) {
        console.log(`Page loaded (${page})`);
        console.debug(data.data);
        session.activePage.loaded = true;
        session.activePage.data = data.data;
        
        if (session.activePage.data.hasOwnProperty('title') && session.siteData.data.hasOwnProperty('title')) {
            document.title = `${session.activePage.data.title} | ${session.siteData.data.title}`;
        } else if (session.activePage.data.hasOwnProperty('title')) {
            document.title = `${session.activePage.data.title} | ContentCore Host`
        } else if (session.siteData.data.hasOwnProperty('title')) {
            document.title = session.siteData.data.title;
        }

        let navBar = document.getElementById('cc-site-nav');
        navBar.setAttribute('update', '');

        elements.navBar = navBar;

        let contents = document.getElementById('cc-site-content');
        contents.setAttribute('update', '');

        elements.contents = contents;

        window.history.pushState(null, null, `?page=${page}`)
    } else {
        loadPage('error_404');
    }
};