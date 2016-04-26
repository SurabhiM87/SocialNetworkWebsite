function initUploader(){
    var scope = $('.uploader');

    $.each(scope, function(k, elem){
        var self = $(elem);

        // check instance
        if (checkInstance(self, 'uploader')) return;

        self.fileupload({
            type: 'PUT',
            dataType: 'xml',
            autoUpload: true,
            multipart: false,
            acceptFileTypes: /(\.|\/)(gif|jpe?g|png|mp4|mva|mp3)$/i,
            maxFileSize: 20000000,
            disableImageResize: /Android(?!.*Chrome)|Opera/.test(window.navigator.userAgent),
            previewMaxWidth: 100,
            previewMaxHeight: 100,
            previewCrop: true,
            add: function (event, data) {
                $.each(data.files, function (index, file) {
                    $.ajax({
                        url: window.app.jsonUrl + JSON.stringify({'ajax':'uploadCreate'}),
                        type: 'POST',
                        data: {filename: file.name, size: file.size, type:file.type},
                    }).success(function(res){
                        var validation = data.process(function () {
                            return self.fileupload('process', data);
                        }).done(function() {
                            data.url = res.signedUrl;
                            self.fileupload('send', data);
                        });
                    }).error(function(){
                        console.log("error");
                    });
                });
            }
        }).on('fileuploadadd', function (e, data) {
            data.context = $('<div/>').appendTo(self.find('.uploader__files'));
            $.each(data.files, function (index, file) {
                var node = $('<p/>').append($('<span/>').text(file.name));
                if (!index) {
                    node.data(data);
                }
                node.appendTo(data.context);
            });
        }).on('fileuploadprocessalways', function (e, data) {
            var index = data.index,
                file = data.files[index],
                node = $(data.context.children()[index]);
            if (file.preview) {
                node.prepend('<br>').prepend(file.preview);
            }
            if (file.error) {
                node.append('<br>').append($('<span class="text-danger"/>').text(file.error));
            }
        }).on('fileuploadprogressall', function (e, data) {
            var progress = parseInt(data.loaded / data.total * 100, 10);
            var barContainer = self.find('.uploader__progress')
            var bar = self.find('.uploader__progressBar')
            if (progress < 100){
                barContainer.show()
                bar.css('width',progress + '%');
            } else {
                barContainer.hide()
            }
        }).on('fileuploaddone', function (e, data) {
            if (typeof self.data('successCallback') =='function'){
                self.data('successCallback')();
            }
        }).on('fileuploadfail', function (e, data) {
            //todo: handle amazon fails
        }).prop('disabled', !$.support.fileInput)
            .parent().addClass($.support.fileInput ? undefined : 'disabled');;
    });
}

$(document).ready(function(){
    initUploader();
});
