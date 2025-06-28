import dbService from "../services/dbService.js";

async function GenLogin() {
    const setNoun = [
        "малина", "клубника", "смородина", "ежевика", "черника", 
        "брусника", "голубика", "вишня", "арония", "рябина", 
        "клюква", "мирта", "шелковица", "морошка", "слива", 
        "фейхоа", "мелисса", "акация", "лаванда", "физалиса",
    ];
    const setAdjective = [
        "ароматная", "кислая", "темная", "красная", "сладкая",
        "дикая", "сладкая", "полезная", "яркая", "сочная",
        "зимняя", "нежная", "зеленая", "солнечная", "блестящая",
        "узкая", "хрустящая", "умная", "тёплая", "сильная",
    ];
    const banlistLogin = [
        "зимняя_вишня"
    ];
    let login;

    while (true) {
        login = setAdjective[Math.floor(Math.random() * 20)] + "_" + setNoun[Math.floor(Math.random() * 20)]

        if (banlistLogin.includes(login)) continue;

        try {
            const worker = await dbService.getWorkers(`Worker_Id`, `WHERE login=${login}`)

            if (!worker) return login
            
        } catch (error) {
            throw error
        }
    }
}

export default GenLogin;