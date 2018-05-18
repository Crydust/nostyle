function FilterRequester() {
	this.url = '/examples/filter-form';
	this.form = $('.filter form');
	this.products = $('.products');
	this.form.find('input').on('change', $.proxy(this, 'onInputChange'));
	$(window).on('popstate', $.proxy(this, 'onPopState'));
	this.form.find('[type=submit]').addClass('visually-hidden').attr('tabindex', '-1');

	// When this component kicks in we need to replace the history entry with this.
	// This is because when popstate fires, there's no useful state to work with
	// so we replace the current history entry with the state of the page on first entry.
	// Using pushState would add an EXTRA entry, and mean users have to press back twice
	// in their browser.
	history.replaceState({query: '', productsHtml: JSON.stringify($('.products').html()) }, null, this.url);
}

FilterRequester.prototype.onInputChange = function(e) {
	var query = this.form.serialize();
	this.requestResults(query);
};

FilterRequester.prototype.requestResults = function(query) {
	$.ajax({
		url: this.url,
		type: 'get',
		data: query,
		success: $.proxy(this, 'onRequestSuccess', query)
	});
};

FilterRequester.prototype.onRequestSuccess = function(query, response) {
	history.pushState(response, null, this.url+'?'+query);
	this.renderUpdates(response);
};

FilterRequester.prototype.renderUpdates = function(data) {
	this.updateFilterForm(data.query);
	this.products.html(JSON.parse(data.productsHtml));
};

FilterRequester.prototype.updateFilterForm = function(query) {
	this.form.find('input[type=radio], input[type=checkbox]').prop('checked', false);
	Object.keys(query).forEach(function(key) {
		var controlValue = query[key];
		if($.isArray(controlValue)) {
			controlValue.forEach(function(value) {
				$('.filter [name='+key+']').each(function(i, input) {
					if(input.value == value) {
						input.checked = true;
					}
				});
			});
		} else {
			$('.filter [name='+key+']').each(function(i, input) {
				if(input.value == controlValue) {
					input.checked = true;
				}
			});
		}
	});
};

FilterRequester.prototype.onPopState = function(e) {
	var state = e.originalEvent.state;
	this.renderUpdates(state);
};
