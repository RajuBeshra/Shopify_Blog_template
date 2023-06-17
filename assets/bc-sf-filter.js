// Override Settings
var bcSfFilterSettings = {
    general: {
        limit: bcSfFilterConfig.custom.products_per_page,
        // Optional
        loadProductFirst: true
    }
};

// Declare Templates
var bcSfFilterTemplate = {
    'saleLabelHtml': '<div class="banner_holder"><div class="sale_banner">' + bcSfFilterConfig.label.sale + '</div></div>',
    'newLabelHtml': '<div class="new_banner">' + bcSfFilterConfig.label.new + '</div>',
    'comingsoonLabelHtml': '<div class="new_banner">' + bcSfFilterConfig.label.coming_soon + '</div>',
    'preorderLabelHtml': '<div class="new_banner">' + bcSfFilterConfig.label.pre_order + '</div>',
    'reviewHtml': '<span class="shopify-product-reviews-badge" data-id="{{itemId}}"></span>',
    'vendorHtml': '<div class="vendor"><span itemprop="brand">{{itemVendorLabel}}</span></div>',
    'quickViewBtnHtml': '<div data-fancybox-href="#product-{{itemId}}" class="quick_shop action_button" data-gallery="product-{{itemId}}-gallery">' + bcSfFilterConfig.label.quick_shop + '</div>',
    // 'quickViewBtnHtml': '<span data-fancybox-href="#product-{{itemId}}" class="quick_shop ss-icon" data-gallery="product-{{itemId}}-gallery"><span class="icon-plus"></span></span>',
    'newRowHtml': '<br class="clear product_clear" />',

    // Grid Template
    'productGridItemHtml': '<div data-boost-theme-quickview="{{itemId}}" class="{{itemColumnNumberClass}} {{itemCollectionGroupThumbClass}} thumbnail {{itemCollectionGroupMobileClass}}" itemprop="itemListElement" itemscope itemtype="http://schema.org/Product">' +
                                '<a href="{{itemUrl}}" itemprop="url">' +
                                    '<div class="relative product_image">' +
                                        '<img src="{{itemThumbUrl}}" alt="{{itemTitle}}" class="lazyload transition-in primary" />' +
                                        '{{itemFlipImage}}' +
                                    '</div>' +
                                    '<div class="info">' +
                                        '<span class="title" itemprop="name">{{itemTitle}}</span>' +
                                        '{{itemVendor}}' +
                                        '{{itemPrice}}' +
                                    '</div>' +
                                    '{{itemSaleLabel}}' +
                                    '{{itemNewLabel}}' +
                                    '{{itemComingsoonLabel}}' +
                                    '{{itemPreorderLabel}}' +
                                '</a>' +
                                '{{itemQuickViewBtn}}' +
                            '</div>' +
                            '{{itemNewRow}}',

    // Pagination Template
    'previousHtml': '<span class="prev"><a href="{{itemUrl}}">« ' + bcSfFilterConfig.label.paginate_prev + '</a></span>',
    'nextHtml': '<span class="next"><a href="{{itemUrl}}">' + bcSfFilterConfig.label.paginate_next + ' »</a></span>',
    'pageItemHtml': '<span class="page"><a href="{{itemUrl}}">{{itemTitle}}</a></span>',
    'pageItemSelectedHtml': '<span class="page current">{{itemTitle}}</span>',
    'pageItemRemainHtml': '<span class="deco">{{itemTitle}}</span>',
    'paginateHtml': '{{previous}}{{pageItems}}{{next}}',
  
    // Sorting Template
    'sortingHtml': '<label for="bc-sf-filter-top-sorting-select" class="inline">' + bcSfFilterConfig.label.sorting + '</label> <select id="bc-sf-filter-top-sorting-select" class="sort_by">{{sortingItems}}</select>',
};

// Build Product Grid Item
BCSfFilter.prototype.buildProductGridItem = function(data, index) {
    /*** Prepare data ***/
    var images = data.images_info;
     // Displaying price base on the policy of Shopify, have to multiple by 100
    var soldOut = !data.available; // Check a product is out of stock
    var onSale = data.compare_at_price_min > data.price_min; // Check a product is on sale
    var priceVaries = data.price_min != data.price_max; // Check a product has many prices
    // Get First Variant (selected_or_first_available_variant)
    var firstVariant = data['variants'][0];
    if (getParam('variant') !== null && getParam('variant') != '') {
        var paramVariant = data.variants.filter(function(e) { return e.id == getParam('variant'); });
        if (typeof paramVariant[0] !== 'undefined') firstVariant = paramVariant[0];
    } else {
        for (var i = 0; i < data['variants'].length; i++) {
            if (data['variants'][i].available) {
                firstVariant = data['variants'][i];
                break;
            }
        }
    }
    /*** End Prepare data ***/

    // Get Template
    var itemHtml = bcSfFilterTemplate.productGridItemHtml;

    var saleClass = onSale ? 'sale' : '';
    var soldOutClass = soldOut ? 'out_of_stock' : 'in_stock';

    var itemColumnNumberClass = '';
    var itemCollectionGroupThumbClass = buildItemCollectionGroupThumbClass(index, bcSfFilterConfig.custom.products_per_row);
    var itemCollectionGroupMobileClass = (index - 1) % 2 == 0 ? 'even' : 'odd';
    switch (bcSfFilterConfig.custom.products_per_row) {
        case 2: itemColumnNumberClass = bcSfFilterConfig.custom.show_sidebar ? 'six columns' : 'six columns'; break;
        case 3: itemColumnNumberClass = bcSfFilterConfig.custom.show_sidebar ? 'four columns' : 'one-third column'; break;
        default: itemColumnNumberClass = bcSfFilterConfig.custom.show_sidebar ? 'three columns' : 'four columns'; break;
    }
    itemHtml = itemHtml.replace(/{{itemColumnNumberClass}}/g, itemColumnNumberClass);    
    itemHtml = itemHtml.replace(/{{itemCollectionGroupThumbClass}}/g, itemCollectionGroupThumbClass);    
    itemHtml = itemHtml.replace(/{{itemCollectionGroupMobileClass}}/g, itemCollectionGroupMobileClass);
  
    // Add onSale label
    var itemSaleLabel = onSale ? bcSfFilterTemplate.saleLabelHtml : '';
    itemHtml = itemHtml.replace(/{{itemSaleLabel}}/g, itemSaleLabel);

    // Add Label (New, Coming soon, Pre order)
    var itemNewLabelHtml = '', itemComingsoonLabelHtml = '', itemPreorderLabelHtml = '';
    if (data.collections) {
        var newLabel = data.collections.filter(function(e) { return e.handle == 'new'; });
        itemNewLabelHtml = typeof newLabel[0] != 'undefined' ? '<div class="new_banner">' + bcSfFilterConfig.label.new + '</div>' : '';

        var comingsoonLabel = data.collections.filter(function(e) { return e.handle == 'coming-soon'; });
        itemComingsoonLabelHtml = typeof comingsoonLabel[0] != 'undefined' ? '<div class="new_banner">' + bcSfFilterConfig.label.coming_soon + '</div>' : '';

        var preorderLabel = data.collections.filter(function(e) { return e.handle == 'pre-order'; });
        itemPreorderLabelHtml = typeof preorderLabel[0] != 'undefined' ? '<div class="new_banner">' + bcSfFilterConfig.label.pre_order + '</div>' : '';
    }
    itemHtml = itemHtml.replace(/{{itemNewLabel}}/g, itemNewLabelHtml);
    itemHtml = itemHtml.replace(/{{itemComingsoonLabel}}/g, itemComingsoonLabelHtml);
    itemHtml = itemHtml.replace(/{{itemPreorderLabel}}/g, itemPreorderLabelHtml);

    // Add Quick view button
    var itemQuickViewBtnHtml = bcSfFilterConfig.custom.quick_shop_enabled ? bcSfFilterTemplate.quickViewBtnHtml : '';
    itemHtml = itemHtml.replace(/{{itemQuickViewBtn}}/g, itemQuickViewBtnHtml);

    // Add Thumbnail
    var itemThumbUrl = bcSfFilterConfig.general.no_image_url;
    if (images.length > 0) {
        switch (bcSfFilterConfig.custom.products_per_row) {
            case 2: itemThumbUrl = this.optimizeImage(images[0]['src'], '580x@2x'); break;
            case 3: itemThumbUrl = this.optimizeImage(images[0]['src'], '380x@2x'); break;
            default: itemThumbUrl = this.optimizeImage(images[0]['src'], '280x@2x'); break;
        }
    }
    itemHtml = itemHtml.replace(/{{itemThumbUrl}}/g, itemThumbUrl);

    // Add Flip Image
    var itemFlipImageHtml = '';
    if (bcSfFilterConfig.custom.collection_secondary_image) {
        var itemFlipImageUrl = images.length > 1 ? this.optimizeImage(images[1]['src'], '580x') : itemThumbUrl;
        itemFlipImageHtml += '<img src="' + itemFlipImageUrl + '" class="secondary" alt="{{itemTitle}}" />';
    }
    itemHtml = itemHtml.replace(/{{itemFlipImage}}/g, itemFlipImageHtml);

    // Add Vendor
    var itemVendorHtml = bcSfFilterConfig.custom.display_vendor_collection ? bcSfFilterTemplate.vendorHtml : '';
    itemHtml = itemHtml.replace(/{{itemVendor}}/g, itemVendorHtml);

    // Add Price
    var itemPriceHtml = '';
    itemPriceHtml += '<span class="price ' + saleClass + '" itemprop="offers" itemscope itemtype="http://schema.org/Offer">';
    itemPriceHtml += '<meta itemprop="price" content="' + this.formatMoney(data.price_min, this.moneyFormat) + '" />';
    itemPriceHtml += '<meta itemprop="priceCurrency" content="' + bcSfFilterConfig.shop.currency + '" />';
    itemPriceHtml += '<meta itemprop="seller" content="' + bcSfFilterConfig.shop.name + '" />';
    itemPriceHtml += '<meta itemprop="availability" content="' + soldOutClass + '" />';
    itemPriceHtml += '<meta itemprop="itemCondition" content="New" />';
    if (!soldOut) {
        if (priceVaries && data.price_min > 0) {
            itemPriceHtml += '<small><em>' + bcSfFilterConfig.label.from_price + '</em></small> ';
        }
        if (data.price_min > 0) {
            itemPriceHtml += '<span>' + this.formatMoney(data.price_min, this.moneyFormat) + '</span>';
        } else {
            itemPriceHtml += bcSfFilterConfig.label.free_price;
        }
    } else {
        itemPriceHtml += '<span class="sold_out">' + bcSfFilterConfig.label.sold_out +'</span>';
    }
    if (onSale) {
        itemPriceHtml += ' <span class="was_price">' + this.formatMoney(data.compare_at_price_max, this.moneyFormat) + '</span>';
    }
    itemPriceHtml += '</span>';
    itemHtml = itemHtml.replace(/{{itemPrice}}/g, itemPriceHtml);

    // Add new row
    var itemNewRowHtml = index % bcSfFilterConfig.custom.products_per_row == 0 ? bcSfFilterTemplate.newRowHtml : '';
    itemHtml = itemHtml.replace(/{{itemNewRow}}/g, itemNewRowHtml);

    // Add main attribute
    itemHtml = itemHtml.replace(/{{itemId}}/g, data.id);
    itemHtml = itemHtml.replace(/{{itemTitle}}/g, data.title);
    itemHtml = itemHtml.replace(/{{itemVendorLabel}}/g, data.vendor);
    itemHtml = itemHtml.replace(/{{itemUrl}}/g, this.buildProductItemUrl(data));

    return itemHtml;
};

// Build advanced class
function buildItemCollectionGroupThumbClass(index, productsPerRow) {
    var temp = index < productsPerRow ? index : index % productsPerRow;
    if (temp == 0) { return 'omega'; }
    else if (temp == 1) { return 'alpha'; }
    return '';
}

// Build Pagination
BCSfFilter.prototype.buildPagination = function(totalProduct) {
    // Get page info
    var currentPage = parseInt(this.queryParams.page);
    var totalPage = Math.ceil(totalProduct / this.queryParams.limit);

    // If it has only one page, clear Pagination
    if (totalPage == 1) {
        jQ(this.selector.pagination).html('');
        return false;
    }

    if (this.getSettingValue('general.paginationType') == 'default') {
        var paginationHtml = bcSfFilterTemplate.paginateHtml;

        // Build Previous
        var previousHtml = (currentPage > 1) ? bcSfFilterTemplate.previousHtml : '';
        previousHtml = previousHtml.replace(/{{itemUrl}}/g, this.buildToolbarLink('page', currentPage, currentPage -1));
        paginationHtml = paginationHtml.replace(/{{previous}}/g, previousHtml);

        // Build Next
        var nextHtml = (currentPage < totalPage) ? bcSfFilterTemplate.nextHtml : '';
        nextHtml = nextHtml.replace(/{{itemUrl}}/g, this.buildToolbarLink('page', currentPage, currentPage + 1));
        paginationHtml = paginationHtml.replace(/{{next}}/g, nextHtml);

        // Create page items array
        var beforeCurrentPageArr = [];
        for (var iBefore = currentPage - 1; iBefore > currentPage - 3 && iBefore > 0; iBefore--) {
            beforeCurrentPageArr.unshift(iBefore);
        }
        if (currentPage - 4 > 0) {
            beforeCurrentPageArr.unshift('...');
        }
        if (currentPage - 4 >= 0) {
            beforeCurrentPageArr.unshift(1);
        }
        beforeCurrentPageArr.push(currentPage);

        var afterCurrentPageArr = [];
        for (var iAfter = currentPage + 1; iAfter < currentPage + 3 && iAfter <= totalPage; iAfter++) {
            afterCurrentPageArr.push(iAfter);
        }
        if (currentPage + 3 < totalPage) {
            afterCurrentPageArr.push('...');
        }
        if (currentPage + 3 <= totalPage) {
            afterCurrentPageArr.push(totalPage);
        }

        // Build page items
        var pageItemsHtml = '';
        var pageArr = beforeCurrentPageArr.concat(afterCurrentPageArr);
        for (var iPage = 0; iPage < pageArr.length; iPage++) {
            if (pageArr[iPage] == '...') {
                pageItemsHtml += bcSfFilterTemplate.pageItemRemainHtml;
            } else {
                pageItemsHtml += (pageArr[iPage] == currentPage) ? bcSfFilterTemplate.pageItemSelectedHtml : bcSfFilterTemplate.pageItemHtml;
            }
            pageItemsHtml = pageItemsHtml.replace(/{{itemTitle}}/g, pageArr[iPage]);
            pageItemsHtml = pageItemsHtml.replace(/{{itemUrl}}/g, this.buildToolbarLink('page', currentPage, pageArr[iPage]));
        }
        paginationHtml = paginationHtml.replace(/{{pageItems}}/g, pageItemsHtml);

        jQ(this.selector.pagination).html(paginationHtml);
    }
};

// Build Sorting
BCSfFilter.prototype.buildFilterSorting = function() {
    if (bcSfFilterTemplate.hasOwnProperty('sortingHtml')) {
        jQ(this.selector.topSorting).html('');

        var sortingArr = this.getSortingList();
        if (sortingArr) {
            // Build content 
            var sortingItemsHtml = '';
            for (var k in sortingArr) {
                sortingItemsHtml += '<option value="' + k +'">' + sortingArr[k] + '</option>';
            }
            var html = bcSfFilterTemplate.sortingHtml.replace(/{{sortingItems}}/g, sortingItemsHtml);
            jQ(this.selector.topSorting).html(html);

            // Set current value
            jQ(this.selector.topSorting + ' select').val(this.queryParams.sort);
        }
    }
};

// Build Breadcrumb
BCSfFilter.prototype.buildBreadcrumb = function(colData, apiData) {
    if (typeof colData !== 'undefined' && colData.hasOwnProperty('collection')) {
        var colInfo = colData.collection;
        var breadcrumbHtml = '<span itemscope itemtype="http://data-vocabulary.org/Breadcrumb"><a href="/" title="' + bcSfFilterConfig.shop.name + '"><span itemprop="title">' + bcSfFilterConfig.label.breadcrumb_home + '</span></a></span>';
        breadcrumbHtml += ' <span class="icon-right-arrow"></span>';
        breadcrumbHtml += ' <span itemscope itemtype="http://data-vocabulary.org/Breadcrumb"><a href="/collections' + colInfo.handle + '" title="' + colInfo.title + '" itemprop="url"><span itemprop="title">' + colInfo.title + '</span></a></span>';
        breadcrumbHtml += ' <span id="bc-sf-filter-top-pagination"></span>';
        jQ('.breadcrumb').html(breadcrumbHtml);
    }
};

// Add additional feature for product list, used commonly in customizing product list
BCSfFilter.prototype.buildExtrasProductList = function(data) {
    // Call theme functions
    lazyload();
    collection.init();

    // Build content for Quick view
    if (!this.isMobile() && bcSfFilterConfig.custom.quick_shop_enabled) {
      	this.buildExtrasProductListByAjax(data, 'boost-integration', function(results){
            results.forEach(function(result){
                // Append the custom html to product item
                jQ(result.quickshop_html).insertAfter(jQ('[data-boost-theme-quickview="'+ result.id+ '"]'));
            })
        });
    }
};

// Build additional elements
BCSfFilter.prototype.buildAdditionalElements = function(data) {
    // Add Wrapper for Product list
    if (jQ('#bc-sf-filter-products').children().hasClass('product-list') || jQ('#bc-sf-filter-products').children().hasClass('products')) {
        jQ('#bc-sf-filter-products').children().children().unwrap();
    }

    // Build Top Pagination
    var totalPage = Math.ceil(data.total_product / this.queryParams.limit);
    var topPaginationHtml = ' <span class="icon-right-arrow"></span> ' + (bcSfFilterConfig.label.breadcrumb_page).replace(/{{ current_page }}/g, this.queryParams.page).replace(/{{ pages }}/g, totalPage);
    jQ('#bc-sf-filter-top-pagination').html(topPaginationHtml);
};

// Build Default layout
BCSfFilter.prototype.buildDefaultElements=function(){var isiOS=/iPad|iPhone|iPod/.test(navigator.userAgent)&&!window.MSStream,isSafari=/Safari/.test(navigator.userAgent),isBackButton=window.performance&&window.performance.navigation&&2==window.performance.navigation.type;if(!(isiOS&&isSafari&&isBackButton)){var self=this,url=window.location.href.split("?")[0],searchQuery=self.isSearchPage()&&self.queryParams.hasOwnProperty("q")?"&q="+self.queryParams.q:"";window.location.replace(url+"?view=bc-original"+searchQuery)}};

function customizeJsonProductData(data) {for (var i = 0; i < data.variants.length; i++) {var variant = data.variants[i];var featureImage = data.images.filter(function(e) {return e.src == variant.image;});if (featureImage.length > 0) {variant.featured_image = {"id": featureImage[0]['id'],"product_id": data.id,"position": featureImage[0]['position'],"created_at": "","updated_at": "","alt": null,"width": featureImage[0]['width'], "height": featureImage[0]['height'], "src": featureImage[0]['src'], "variant_ids": [variant.id]}} else {variant.featured_image = '';};};var self = bcsffilter;var itemJson = {"id": data.id,"title": data.title,"handle": data.handle,"vendor": data.vendor,"variants": data.variants,"url": self.buildProductItemUrl(data),"options_with_values": data.options_with_values,"images": data.images,"images_info": data.images_info,"available": data.available,"price_min": data.price_min,"price_max": data.price_max,"compare_at_price_min": data.compare_at_price_min,"compare_at_price_max": data.compare_at_price_max};return itemJson;};
BCSfFilter.prototype.prepareProductData = function(data) {var countData = data.length;for (var k = 0; k < countData; k++) {data[k]['images'] = data[k]['images_info'];if (data[k]['images'].length > 0) {data[k]['featured_image'] = data[k]['images'][0]} else {data[k]['featured_image'] = {src: bcSfFilterConfig.general.no_image_url,width: '',height: '',aspect_ratio: 0}}data[k]['url'] = '/products/' + data[k].handle;var optionsArr = [];var countOptionsWithValues = data[k]['options_with_values'].length;for (var i = 0; i < countOptionsWithValues; i++) {optionsArr.push(data[k]['options_with_values'][i]['name'])}data[k]['options'] = optionsArr;if (typeof bcSfFilterConfig.general.currencies != 'undefined' && bcSfFilterConfig.general.currencies.length > 1) {var currentCurrency = bcSfFilterConfig.general.current_currency.toLowerCase().trim();function updateMultiCurrencyPrice(oldPrice, newPrice) {if (typeof newPrice != 'undefined') {return newPrice;}return oldPrice;}data[k].price_min = updateMultiCurrencyPrice(data[k].price_min, data[k]['price_min_' + currentCurrency]);data[k].price_max = updateMultiCurrencyPrice(data[k].price_max, data[k]['price_max_' + currentCurrency]);data[k].compare_at_price_min = updateMultiCurrencyPrice(data[k].compare_at_price_min, data[k]['compare_at_price_min_' + currentCurrency]);data[k].compare_at_price_max = updateMultiCurrencyPrice(data[k].compare_at_price_max, data[k]['compare_at_price_max_' + currentCurrency]);}data[k]['price_min'] *= 100, data[k]['price_max'] *= 100, data[k]['compare_at_price_min'] *= 100, data[k]['compare_at_price_max'] *= 100;data[k]['price'] = data[k]['price_min'];data[k]['compare_at_price'] = data[k]['compare_at_price_min'];data[k]['price_varies'] = data[k]['price_min'] != data[k]['price_max'];var firstVariant = data[k]['variants'][0];if (getParam('variant') !== null && getParam('variant') != '') {var paramVariant = data[k]['variants'].filter(function(e) {return e.id == getParam('variant')});if (typeof paramVariant[0] !== 'undefined') firstVariant = paramVariant[0]} else {var countVariants = data[k]['variants'].length;for (var i = 0; i < countVariants; i++) {if (data[k]['variants'][i].available) {firstVariant = data[k]['variants'][i];break}}}data[k]['selected_or_first_available_variant'] = firstVariant;var countVariants = data[k]['variants'].length;for (var i = 0; i < countVariants; i++) {var variantOptionArr = [];var count = 1;var variant = data[k]['variants'][i];var variantOptions = variant['merged_options'];if (Array.isArray(variantOptions)) {var countVariantOptions = variantOptions.length;for (var j = 0; j < countVariantOptions; j++) {var temp = variantOptions[j].split(':');data[k]['variants'][i]['option' + (parseInt(j) + 1)] = temp[1];data[k]['variants'][i]['option_' + temp[0]] = temp[1];variantOptionArr.push(temp[1])}data[k]['variants'][i]['options'] = variantOptionArr}data[k]['variants'][i]['compare_at_price'] = parseFloat(data[k]['variants'][i]['compare_at_price']) * 100;data[k]['variants'][i]['price'] = parseFloat(data[k]['variants'][i]['price']) * 100}data[k]['description'] = data[k]['content'] = data[k]['body_html'];if (data[k].hasOwnProperty('original_tags') && data[k]['original_tags'].length > 0) {data[k]['tags'] = data[k]['original_tags'].slice(0);}data[k]['json'] = customizeJsonProductData(data[k]);}return data;};