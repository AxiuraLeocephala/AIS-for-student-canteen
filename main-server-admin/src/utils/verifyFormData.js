async function VerifyFormData(firstName, secondName, role, phoneNumber) {
    return Promise.all([
        new Promise((resolve, reject) => {
            if (firstName.length === 0 || 
                firstName.length > 15 ||
                firstName.charCodeAt(0) < 1040 || 
                firstName.charCodeAt(0) > 1103) {
                reject("Ошибка в поле «Имя»");
            }
            resolve();
        }),
        new Promise((resolve, reject) => {
            if (secondName.length === 0 || 
                secondName.length > 15 || 
                secondName.charCodeAt(0) < 1040 || 
                secondName.charCodeAt(0) > 1103) {
                reject("Ошибка в поле «Фамилия»");
            }
            resolve();
        }),
        new Promise((resolve, reject) => {
            if (role.length === 0 || !["worker", "admin"].includes(role)) {
                reject("Ошибка в поле «Роль»");
            }
            resolve()
        }),
        new Promise((resolve, reject) => {
            if (phoneNumber.length > 0) {
                if (!(phoneNumber.length === 11 &&  phoneNumber.substring(0, 1) === "8") || 
                (phoneNumber.length === 12 && phoneNumber.substring(0, 2) === "+7" ))  {
                    reject("Ошибка в поле «Номер телефона»");
                }
            }
            resolve();
        })
    ])
}

export default VerifyFormData;