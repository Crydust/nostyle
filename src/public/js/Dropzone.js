var isAdvancedUpload = function() {
  var div = document.createElement( 'div' );
  return ( ( 'draggable' in div ) || ( 'ondragstart' in div && 'ondrop' in div ) ) && 'FormData' in window && 'FileReader' in window;
}();

if(isAdvancedUpload) {
  function Dropzone(container) {
  	this.dropzone = container;
    this.dropzone.addClass('dropzone-enhanced');
    this.setupDropzone();
    this.setupFileInput();
  }

  Dropzone.prototype.setupDropzone = function() {
    this.dropzone.find('label').html('Upload file');
    this.dropzone.on('dragover', $.proxy(this, 'onDragOver'));
    this.dropzone.on('dragleave', $.proxy(this, 'onDragLeave'));
    this.dropzone.on('drop', $.proxy(this, 'onDrop'));
  };

  Dropzone.prototype.setupFileInput = function() {
    this.fileInput = this.dropzone.find('[type=file]');
    this.fileInput.on('change', $.proxy(this, 'onFileChange'));
    this.fileInput.on('focus', $.proxy(this, 'onFileFocus'));
    this.fileInput.on('blur', $.proxy(this, 'onFileBlur'));
  };

  Dropzone.prototype.onDragOver = function(e) {
    // prevent default to allow the drop to happen
  	e.preventDefault();
  	this.dropzone.addClass('dropzone-dragover');
  };

  Dropzone.prototype.onDragLeave = function() {
  	this.dropzone.removeClass('dropzone-dragover');
  };

  Dropzone.prototype.onDrop = function(e) {
    // prevent default to allow the drop to happen
  	e.preventDefault();
  	this.dropzone.removeClass('dropzone-dragover');
    $('.fileList').removeClass('hidden');
  	this.uploadFiles(e.originalEvent.dataTransfer.files);
  };

  Dropzone.prototype.uploadFiles = function(files) {
    for(var i = 0; i < files.length; i++) {
      this.uploadFile(files[i]);
    }
  };

  Dropzone.prototype.onFileChange = function(e) {
    $('.fileList').removeClass('hidden');
    this.uploadFiles(e.currentTarget.files);
  };

  Dropzone.prototype.onFileFocus = function(e) {
    this.dropzone.find('label').addClass('dropzone-focused');
  };

  Dropzone.prototype.onFileBlur = function(e) {
    this.dropzone.find('label').removeClass('dropzone-focused');
  };

  Dropzone.prototype.uploadFile = function(file) {
    var formData = new FormData();
    formData.append('documents', file);

    var li = $('<li><span class="fileList-name">'+ formData.get('documents').name +'</span><progress value="0" max="100">0%</progress></li>');
    $('.fileList ul').append(li);
  	
    $.ajax({
      url: '/ajax-upload',
      type: 'post',
      data: formData,

      // Tell jQuery not to convert the data into a querystring
      // We want it to send formdata
      processData: false,

      // Tell jQuery not to override the implicit boundary string
      // which is generated automatically
      // True: Content-Type:application/x-www-form-urlencoded
      // False: Content-Type:multipart/form-data; boundary=----WebKitFormBoundaryBEAjAVnRD6Wsgymr
      contentType: false,
      success: function(response){
        if(response.error) {
          li.find('progress').remove();
          li.append('<span class="fileList-error"><svg width="1.5em" height="1.5em"><use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#warning-icon"></use></svg>'+response.error.text+'</span>');
          li.append('<button type="button" class="secondaryButton">Dismiss</button>');
        } else {
          li.find('.fileList-name').remove();
          li.prepend('<a class="fileList-name" href="/'+response.file.path+'">'+response.file.originalname+'</a>');
          li.append('<button type="button" class="secondaryButton">Remove</button>');
        }
      },
      xhr: function() {
        var xhr = new XMLHttpRequest();
        xhr.upload.addEventListener('progress', function(e) {
          if (e.lengthComputable) {
            // calculate the percentage of upload completed
            var percentComplete = e.loaded / e.total;
            percentComplete = parseInt(percentComplete * 100);
            li.find('progress')
              .prop('value', percentComplete)
              .text(percentComplete + '%');
          }
        }, false);
        return xhr;
      }
    });
  };
}
