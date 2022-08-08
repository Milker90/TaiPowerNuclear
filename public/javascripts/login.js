'use strict';

$(function () {
    refreshCaptcha()
})

$("form").on('submit', function (e) {
    e.stopPropagation()
    e.preventDefault()
    handleLogin()
})

$(document).on('click', '#refresh-captcha-button', function () {
    refreshCaptcha()
})

function handleLogin() {
    let data = {
        username: $('#id-input').val(),
        pd: $('#pd-input').val(),
        captcha: $('#captcha-input').val()
    }
    $.post('/api/auth/login', data)
        .then(res => {
            Cookies.set('tpnuser', res.user)
            window.location.replace('/')
        }).fail(error => {
            if (error.status == 401) {
                alert('帳號或密碼錯誤')
            } else if (error.status == 400) {
                alert(error.responseJSON.msg)
                refreshCaptcha()
            }
        })
}

function refreshCaptcha() {
    let now = Date.now()
    $('#captcha-image').attr('src', `/api/auth/captcha?now=${now}`)
    $('#captcha-input').val('')
}