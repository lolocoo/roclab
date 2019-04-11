let qs = (elem) => document.querySelector(elem);
let qsa = (elem) => document.querySelectorAll(elem);
let ready = (callback) => document.addEventListener('DOMContentLoaded', callback, false);

function postData(url, data) {
    return fetch(url, {
        body: JSON.stringify(data),
        cache: 'no-cache',
        headers: {
            'content-type': 'application/json'
        },
        method: 'POST',
        mode: 'cors',
        redirect: 'follow',
        referrer: 'no-referrer',
    }).then(response => response.json());
}

let app = {
    submitForm() {
        let formData = new FormData();
        formData.append('file', qs('#UserPhoto').files[0]);

        fetch('/face/detect', {
            method: "POST",
            body: formData
        }).then(function (response) {
            return response.json();
        }).then(data => {
            console.log(data);
        })
    },
    init() {
        qs('#SubmitForm').addEventListener('touchend', () => {
            this.submitForm();
        }, false);
    }
};

ready(() => {
    console.log('I am in !');
    app.init();
});