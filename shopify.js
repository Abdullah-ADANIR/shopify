/* CUSTOMER_NAME */
/* Do not load Segmentify more than one to prevent potential error occurrence */
if (window['SegmentifyTrackingObject']) {
    throw new Error("Segmentify is already loaded!");
  }
  ​
  var segNamespace = "Segmentify";
  ​
  window['SegmentifyTrackingObject'] = segNamespace;
  ​
  window[segNamespace] = window[segNamespace] || function () {
    (window[segNamespace].q = window[segNamespace].q || []).push(arguments);
  };
  ​
  function waitSegmentifyJquery() {
    if (window["jQuery"]) {
      /* config details : http://cdn.segmentify.com/segmentify.debug.js */
      window[segNamespace].config = {
        /* select data center */
        /* 
        segmentifyApiUrl: '//dceX.segmentify.com/', 
        segmentifyApiUrl: '//gandalf.segmentify.com/',
        segmentifyApiUrl: '//gandalf-eu.segmentify.com/',
        */
        jq: window.jQuery
        /* push additional field */
        /* 
        segmentifyPushUrl: '//gimli.segmentify.com/',
        */
      };
      /* Initialize Segmentify with your Api Key */
      Segmentify('apikey', 'xxx');
      waitSegmentifyAndjQuery();
    } else {
      setTimeout(waitSegmentifyJquery, 100);
    }
  }
  ​
  function waitSegmentifyAndjQuery() {
    try {
      if (window["_SgmntfY_"] && window["_SgmntfY_"]._getJq()) {
        window.segJquery = window["_SgmntfY_"]._getJq();
  ​
        segJquery(document).ready(function () {
          SegmentifyIntegration(window.segJquery).init();
          /* search additional script */
          /* _SgmntfY_._initSearch('#live-search'); */
        });
      } else {
        setTimeout(waitSegmentifyAndjQuery, 100);
      }
    } catch (err) {
      // can you check it on our log system.
      segmentifyEvents.error(err);
    }
  }
  ​
  var SegmentifyIntegration = function (jQuery) {
    var segmentifyEvents = {
      viewPage: function (category, subCategory, params) {
        /* console.log("Pageview Event is going", category, subCategory, params); */
        Segmentify('view:page', {
          'category': category,
          'subCategory': subCategory,
          'params': params
        });
      },
      viewProduct: function (productObj) {
        /* console.log("Product View Event is going", productObj); */
        Segmentify('view:product', productObj);
      },
      checkoutBasket: function (basketObj) {
        /* console.log("Checkout Basket event is going", basketObj); */
        Segmentify('checkout:basket', basketObj);
      },
      checkoutPurchase: function (purchaseObj) {
        /* console.log("Checkout Purchase event is going", purchaseObj); */
        Segmentify('checkout:purchase', purchaseObj);
      },
      basketAdd: function (basketObj) {
        /* console.log("Basket Add Event is going", basketObj); */
        Segmentify('basket:add', basketObj);
      },
      basketRemove: function (basketObj) {
        /* console.log("Basket Remove Event is going", basketObj); */
        Segmentify('basket:remove', basketObj);
      },
      basketClear: function (basketObj) {
        /* console.log("Basket Clear Event is going", basketObj); */
        Segmentify('basket:clear', basketObj);
      },
      userUpdate: function (userObj) {
        /* console.log("User Update Event is going", userObj); */
        Segmentify('user:update', userObj);
      },
      userSignup: function (signupObj) {
        /* console.log("User Sign-up Event is going", signupObj); */
        Segmentify('user:signup', signupObj);
      },
      userId: function (id) {
        /* console.log("User ID is going to be changed", id); */
        Segmentify('userid', id);
      },
      custom: function (customObj) {
        /* console.log("Custom Event is going", customObj); */
        Segmentify('event:custom', customObj);
      },
      error: function (errorMessage) {
        /* console.log("Custom Event is going", customObj); */
        Segmentify('event:custom', {
          "type": "error_handler",
          "params": {
            "errorMessage": errorMessage.toString(),
            "nextPage": false
          }
        });
      }
    };
  ​
    var helperFunctions = {
      "setCookie": function (cname, cvalue, exdays) {
        window["_SgmntfY_"]._storePersistentData(cname, cvalue, exdays, false);
      },
      "getCookie": function (cname) {
        return window["_SgmntfY_"]._getPersistentData(cname, false);
      },
      "getQueryParameter": function (pname, url) {
        return window["_SgmntfY_"]._getQueryParameter(pname, url);
      },
      "priceFormatter": function (price, separators, currency_symbol) {
        try {
          var temp = (price || "").toString();
  ​
          if (temp) {
            // remove all unwanted characters if it is not a number
            var allowedChars = "0123456789.,";
  ​
            for (var i = 0; i < price.length; i++) {
              if (allowedChars.indexOf(price[i]) < 0) {
                temp = temp.replace(price[i], "");
              }
            }
  ​
            // remove redundant decimal separators
            var occurences = temp.match(/\./g);
  ​
            if (occurences && Array.isArray(occurences) && occurences.length > 1) {
              for (var i = 0; i < occurences.length - 1; i++) {
                temp = temp.replace(".", "");
              }
            }
  ​
            // if separators provided, replace them
            if (separators && Array.isArray(separators) && separators.length === 2) {
              var regexPattern = "";
              var regex = null;
  ​
              if (separators[1]) {
                regexPattern = "\\" + separators[1];
                regex = new RegExp(regexPattern, "g");
  ​
                temp = temp.replace(regex, "");
              }
  ​
              if (separators[0]) {
                regexPattern = "\\" + separators[0];
                regex = new RegExp(regexPattern, "g");
  ​
                temp = temp.replace(regex, separators[1]);
              }
            }
  ​
            // if currency symbol is valid and has a string value, replace it
            if (currency_symbol && typeof currency_symbol === "string") {
              temp = temp.replace(currency_symbol, "");
            }
  ​
            // cast the price to float
            temp = parseFloat(temp.toString().trim().replace(/\s/g, "")).toFixed(2);
  ​
            return temp;
          }
          // if given parameters are not valid, return zero
          return 0;
        } catch (err) {
          segmentifyEvents.error(err);
          // if any error occurs, return zero
          return 0;
        }
      },
      "findPropertyInArray": function (prop, arr) {
        try {
          // if property is not defined or empty string or array is empty exit function
          if (typeof prop !== "string" ||
            !prop ||
            !Array.isArray(arr)) {
            return null;
          }
  ​
          for (var i = 0; i < arr.length; i++) {
            var arr_item = arr[i];
  ​
            // if this array object contains property -prop-, so this is what we are looking for
            if (arr_item.hasOwnProperty(prop)) {
              return arr_item;
            }
          }
        } catch (err) {
          // prevent unexpected return type so return null
          segmentifyEvents.error(err);
          return null;
        }
      },
      "getOnlyElementText": function (obj) {
        try {
          // if type of object is string, to prevent any unexpected result we trim it
          if (typeof obj === "string") {
            obj = obj.trim();
          }
          // if this jquery/dom object/element is not valid, exit function
          if (!obj || !jQuery(obj).length) {
            return "";
          }
          // if the object does not have any child, so return its text
          if (!jQuery(obj).children().length) {
            return jQuery(obj).text();
          }
          var temp = jQuery(obj)
            .clone() // clone the element
            .children() // select all the children
            .remove() // remove all the children
            .end() // again go back to selected element
            .text(); // get the text of element;
          return temp;
        } catch (err) {
          return null;
        }
      }
    };
  ​     var pageType = ShopifyAnalytics.meta.page.pageType;
    var pageVariables = {
      category: "",
      subCategory: "",
      params: {}
    };
  ​
    var findPageType = function () {
      try {
        /* Home Page, Category Page, Product Page, Basket Page, Search Page, Checkout Success Page */
        if (pageType=="home") {
          pageVariables.category = "Home Page";
          return;
        }
  ​
        if (pageType=="collection") {
          pageVariables.category = "Category Page";
          pageVariables.subCategory = "";
          return;
        }
  ​
        if (pageType=="product") {
          pageVariables.category = "Product Page";
          return;
        }
  ​
        if (window.location.pathname=="/cart") {
          pageVariables.category = "Basket Page";
          return;
        }
  ​
        if (pageType=="searchresults") {
          pageVariables.category = "Search Page";
          pageVariables.subCategory = "";
          return;
        }
  ​
        if (jQuery("body:contains(404)").length > 0)  {
          pageVariables.category = "404 Page";
          return;
        }
  ​
        if (0) {
          pageVariables.category = "Checkout Success Page";
          return;
        }
  ​
        pageVariables.category = "Unknown Page";
      } catch (err) {
        // can you check it on our log system.
        segmentifyEvents.error(err);
      }
    };
  ​
    var triggerPageFunction = function (category) {
      try {
        if (category && pageFunctions.hasOwnProperty(category)) {
          pageFunctions[category]();
        }
  ​
        pageFunctions["All Pages"]();
      } catch (err) {
        // can you check it on our log system.
        segmentifyEvents.error(err);
      }
    };
  ​
    var init = function () {
      findPageType();
      triggerPageFunction(pageVariables.category);
    };
  ​
    var pageFunctions = {
      "All Pages": function () {
        try {
          /* Best practices : https://www.segmentify.com/dev/integration_web/#page-view */
          segmentifyEvents.viewPage(pageVariables.category, pageVariables.subCategory, pageVariables.params);
        } catch (err) {
          // can you check it on our log system.
          segmentifyEvents.error(err);
        }
      },
      "Home Page": function () {},
      "Category Page": function () {},
      "Product Page": function () {
        try {
          var productObj = {};
  ​
          productObj["brand"] = jQuery(".site-header__logo-link > font > font").text();
          productObj["title"] = jQuery(".product-single__title").text();
          productObj["productId"] =ShopifyAnalytics.meta.selectedVariantId
          productObj["image"] = jQuery(".zoomImg").attr("src");
          productObj["price"] = jQuery(".price-item.price-item--regular").text().trim();
          productObj["oldPrice"] = "";
          productObj["inStock"] = true;
          productObj["url"] =  window.location.href;
          productObj["category"] = "";
          productObj["categories"] =  "";
          productObj["params"] = {};
  ​
          if (parseFloat(productObj["price"]) > parseFloat(productObj["oldPrice"]) || parseFloat(productObj["oldPrice"]) === 0 || (parseFloat(productObj["oldPrice"]) === parseFloat(productObj["price"]))) {
            delete productObj["oldPrice"];
          }
  ​
          // Send product view event
          // Best practices : https://www.segmentify.com/dev/integration_web/#product-view
          segmentifyEvents.viewProduct(productObj);
        } catch (err) {
          // can you check it on our log system.
          segmentifyEvents.error(err);
        }
      },
      "Search Page": function () {},
      "404 Page": function () {},
      "Basket Page": function () {
        try {
          var basketAmount = helperFunctions.priceFormatter(jQuery(".cart-subtotal__price").text(),["."," "]);
          var basketProducts = [];
  ​        var basketRows = jQuery("tr.cart__row");
        basketRows.each(function(index){
            basketProducts.push({
                "quantity": jQuery(this).attr('data-cart-item-quantity'),
               "price" : jQuery(this).find("dd[data-cart-item-regular-price]"),
               "productId":jQuery("tr.cart__row").attr("data-cart-item-key").split(":")[0],
            });
        });
          // Put basket event information into a variable. 
          var basketInfo = {
            "totalPrice": basketAmount,
            "productList": basketProducts
          };
  ​
          // Send checkout basket event
          // Best practices : https://www.segmentify.com/dev/integration_web/#view-basket
          segmentifyEvents.checkoutBasket(basketInfo);
        } catch (err) {
          // can you check it on our log system.
          segmentifyEvents.error(err);
        }
      },
      "Checkout Success Page": function () {
        try {
          var purchaseAmount = "";
          var purchaseProducts = [];
          var orderNo = "";
  ​
          // Put purchase event information into a variable.
          var purchaseInfo = {
            "orderNo": orderNo,
            "totalPrice": purchaseAmount,
            "productList": purchaseProducts
          };
  ​
          // Send checkout purchase event
          // Best practices : https://www.segmentify.com/dev/integration_web/#view-basket
          segmentifyEvents.checkoutPurchase(purchaseInfo);
        } catch (err) {
          // can you check it on our log system.
          segmentifyEvents.error(err);
        }
  ​
      }
    };
  ​
    return {
      init: init,
      events: segmentifyEvents,
      helpers: helperFunctions
    };
  };
  ​
  /* Call Wait Function at the bottom of the script */
  waitSegmentifyJquery()