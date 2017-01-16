const CSRF_NAME = document.getElementsByName('_csrf_parameter')[0].content;
const CSRF_VALUE = document.getElementsByName('_csrf')[0].content;

export {
    CSRF_NAME,
    CSRF_VALUE
}