
function Validator(formSelector,options) {
    //Gán giá trị mặc định cho tham số
    if(!options){
        options = {}
    }
    function getParent(element,selector){
        var parent = element.parentElement;
        while (parent) {
            if(parent.matches(selector)) {
                 return parent;}
        } 
        return parent
        
        
    }

    var formRules = {};

    /**
    -Nếu có lỗi thì return `error mesage` 
    -Nếu ko có lỗi thì return undefined
    
    **/
    var validatorRules = {
        required: function (value) {
            return value ? undefined : 'Vui lòng nhập trường này'
        },
        email: function (value) {
            var regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;

            return regex.test(value) ? undefined : 'Vui lòng nhập đúng định dạng Email'
        },
        min: function (min) {
            return function (value) {
                return value.length >= min ? undefined : `Vui lòng nhập tối thiểu ${min} ký tự`
            }
        },
        max: function (max) {
            return function (value) {
                return value.length <= max ? undefined : `Vui lòng nhập tối đa ${max} ký tự`
            }
        },
    }
    //Lấy ra form Elements trong DOM theo `formSelector`
    var formElement = document.querySelector(formSelector);
     

    //Chỉ xử lý khi có element trong DOM

    if (formElement) {
        var inputs = formElement.querySelectorAll('[name][rules]');

        for (var input of inputs) {
            var rules = input.getAttribute('rules').split('|')
            for (var rule of rules) {



                var ruleInfo;
                var isRuleHasValue = rule.includes(':');

                if (isRuleHasValue) {
                    ruleInfo = rule.split(':')

                    rule = ruleInfo[0];

                    // console.log(validatorRules[rule])
                }

                var ruleFunc = validatorRules[rule];

                if (isRuleHasValue) {
                    ruleFunc = ruleFunc(ruleInfo[1]);

                }


                if (Array.isArray(formRules[input.name])) {
                    formRules[input.name].push(ruleFunc);
                } else {
                    formRules[input.name] = [ruleFunc];
                }
            }
            //Lắng nghe sự kiện để validate (blur,change)

            input.onblur = handleValidate;
            input.oninput = handleClearErrors;
        }

        function handleValidate(event) {
            
            var rules=formRules[event.target.name];
            var errMessage;

            rules.find(function(rule){
                errMessage=rule(event.target.value);
                return errMessage;
                

            });
            //Nếu có lỗi thì hiển thị message ra UI
            if(errMessage){
                var formGroup=getParent(event.target,".form-group")
                if(formGroup){
                    formGroup.classList.add('invalid');
                    var formMessage=formGroup.querySelector('.form-message')
                    if(formMessage){
                        formMessage.innerText= errMessage
                    }
                }
            }
            if(!errMessage){
                event.target.data = event.target.value;
            }
            return !errMessage;
        }

        //Hàm clear ERR message lỗi
        function handleClearErrors(event){
            var formGroup=getParent(event.target,".form-group")
            if(formGroup.classList.contains('invalid')){
                formGroup.classList.remove('invalid');
                var formMessage=formGroup.querySelector('.form-message')
                    if(formMessage){
                        formMessage.innerText= ''
                    }
            }
        }

        

    }

    //Xử lý hành vi submit form 
    formElement.onsubmit = function(event){
        event.preventDefault();
        var inputs = formElement.querySelectorAll('[name][rules]');
        var isValid= true;
        var userData = {};
        for (var input of inputs) {

           if(! handleValidate({target: input}))
            isValid=false;
            userData[input.name] = input.data;
        }
        
        if(isValid){
            
            console.log(userData);
            if(typeof options.onSubmit==='function'){
                options.onSubmit();
            }else{
                formElement.submit();
            }
        }

    }
}