/*
 * cc.js - contentcore foundation code
 * copyright (c) 2021 luis oida
 */

const CC_VERSION = '0.0dev00001';
const CC_BRANDED_VERSION = 'Apricot';

var siteDataLoaded = false;
var siteData;

var pageDataLoaded = false;
var pageData;

var currentPageLoaded = false
var currentPage;

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
    if (siteDataLoaded) {
        console.debug('Attempting to receive pages...');
        console.debug(`pages == ${siteData.pages}`)

        new Promise(function (resolve, reject) {
            read(siteData.pages, function(status, data) {
                if (status !== null) {
                    console.error(`Could not load page data with error code: ${status}`);
    
                    pageDataLoaded = false;
                    pageData = null;
    
                    reject();
                } else {
                    // set data
                    console.info('Received page data successfully.');
                    console.debug(data);
    
                    pageDataLoaded = true;
                    pageData = data;
                    console.log('Page data stored.');

                    // check if stylesheets property exists
                    if (siteData.hasOwnProperty('stylesheets')) {
                        // for each stylesheet, add a sheet element
                        Object.entries(siteData.stylesheets).forEach(([key, value]) => {
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

            siteDataLoaded = false;
            siteData = null;
        } else {
            console.info('Received site settings successfully.');
            console.debug(data);

            siteDataLoaded = true;
            siteData = data;
        }

        callback();
        return siteDataLoaded;
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
    Object.entries(pageData.pages).forEach(([key, value]) => {
        console.debug(`Skimming ${key}...`);
        if (value.id == page) {
            data = value;
        }
    });

    //let data = pageData.cc_pages.pages[page];
    if (data != null) {
        console.debug(data.data);
        currentPageLoaded = true;
        currentPage = data.data;
        
        if (currentPage.hasOwnProperty('title') && siteData.hasOwnProperty('title')) {
            document.title = `${currentPage.title} | ${siteData.title}`;
        } else if (currentPage.hasOwnProperty('title')) {
            document.title = `${currentPage.title} | ContentCore Host`
        } else if (siteData.hasOwnProperty('title')) {
            document.title = siteData.title;
        }

        let navBar = document.getElementById('cc-site-nav');
        navBar.setAttribute('update', '');

        let contents = document.getElementById('cc-site-content');
        contents.setAttribute('update', '');

        window.history.pushState(null, null, `?page=${page}`)
    } else {
        loadPage('error_404');
    }
};