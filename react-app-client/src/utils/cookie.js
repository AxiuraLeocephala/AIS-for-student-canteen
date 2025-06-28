export function getCookie(name) {
    let matches = document.cookie.match(new RegExp(
        "(?:^|; )" + name.replace(/([$?*|{}\]\\^])/g, '\\$1') + "=([^;]*)"
    ))
    
    return matches ? decodeURIComponent(matches[1]) : undefined;
}

export function setCookie(name, value, options = {}) {
    options = {
        path: '/',
        /*
        domain: 'axiuraleocephala.ru', // Доступ к куки только с указанного домена
        secure: true, // Передавать только по HTTPS
        httpOnly: true, // Запрещает доступ к куки через JS
        SameSite: "strict", // Отправлять куки только с указанного домена
        */
        samesite: "None",
        secure: true,
        ...options
    };

    if (options.expires instanceof Date) {
        options.expires = options.expires.toUTCString();
    }

    let updatedCookie = encodeURIComponent(name) + "=" + encodeURIComponent(value);

    for (let optionKey in options) {
        updatedCookie += "; " + optionKey;
        let optionValue = options[optionKey];
        if (optionValue !== true) {
            updatedCookie += "=" + optionValue;
        }
    }
    document.cookie = updatedCookie;
}

export function deleteCookie(name) {
    setCookie(name, "", {'max-age': -1})
}