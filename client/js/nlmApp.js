(function () {
    var app = angular.module('nlmApp', []).config(function($sceProvider) {
        // Completely disable SCE.  For demonstration purposes only!
        // Do not use in main projects.
        $sceProvider.enabled(false);
      });

    app.controller('MessageCtrl', function ($scope) {       

        $scope.messages = [];
        
        $scope.sendmessage = function(e) {
            if(e.which === 13){
                var msg = $(e.currentTarget).val();
                $scope.messages.push({
                    Name: 'You',
                    Message: msg
                });
                $(e.currentTarget).val('');
                $.ajax({
                    url: 'http://localhost:5000/input/'+msg,
                    type: 'GET',
                    success: function(response, status, xhr){
                        
                        $scope.$apply(function () {
                            $scope.messages.push({
                                Name: 'Sonny',
                                Message: response.msg,
                                Confirm: response.confirm
                            });
                        });
                        var boxWrapper = document.getElementById('boxWrapper');
                        boxWrapper.scrollTop = boxWrapper.scrollHeight;

                        $('.cnf').on('click', function(e){
                            
                            var cnf = $(e.currentTarget).data('value');                            
                            $.ajax({
                                url: 'http://localhost:5000/confirm/'+cnf,
                                type: 'GET',
                                success: function(response, status, xhr){
                                    $('.btn').attr("disabled", true);
                                    $scope.$apply(function () {
                                        $scope.messages.push({
                                            Name: 'Network',
                                            Message: response,
                                            Confirm: false
                                        });
                                    });

                                    boxWrapper.scrollTop = boxWrapper.scrollHeight;
                                }
                            });
                        });
                        
                        $('.getit').on('click', function(e){
                            var target =  $(e.currentTarget);
                            var getit = target.data('value');
                            var searchterm = target.data('search');
                            if(getit === "yes"){
                                target.parent().append('<div class="search-loader"></div>');
                            }
                            $.ajax({
                                url: 'http://localhost:5000/getit/'+getit+'/'+searchterm,
                                type: 'GET',
                                success: function(response, status, xhr){
                                    $('.btn').attr("disabled", true);
                                    if(target.parent().find('.search-loader').length > 0){
                                        target.parent().find('.search-loader').remove();
                                    }
                                    $scope.$apply(function () {
                                        $scope.messages.push({
                                            Name: 'Network',
                                            Message: response.msg,
                                            Confirm: response.confirm
                                        });
                                    });

                                    boxWrapper.scrollTop = boxWrapper.scrollHeight;
                                    $('.cnf').on('click', function(e){
                                        
                                        var cnf = $(e.currentTarget).data('value');
                                        $.ajax({
                                            url: 'http://localhost:5000/confirm/'+cnf,
                                            type: 'GET',
                                            success: function(response, status, xhr){
                                                $('.btn').attr("disabled", true);
                                                $scope.$apply(function () {
                                                    $scope.messages.push({
                                                        Name: 'Network',
                                                        Message: response,
                                                        Confirm: false
                                                    });
                                                });
            
                                                boxWrapper.scrollTop = boxWrapper.scrollHeight;
                                            }
                                        });
                                    });
                                }
                            });
                        });
                    },
                    error: function(resonse, status){
                        alert('Something went wrong, kindly try after some time. Thank you.');
                    }
                })
            }
        }

    });

})();