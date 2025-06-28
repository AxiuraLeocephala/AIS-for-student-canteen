async function GenPassword() {
    const setBird = [
        "свиристель", "гиациноваяАра", "гарпия", "желна", "олуша",
        "жако", "удод", "корелла", "гоацин", "императорскийПингвин",
        "египетскаяЦапля", "солнечнаяАратинга", "розоваяЦапля", "красныйИбис", "",
        "голубаяЦапля", "иглохвост", "неясыть", "пустельга", "огненныйЧиж",
        "марта", "буревестник", "пуночка", "дрофа", "зеленушка",
        "макао", "райскаяПтица", "арасари", "зимородок", "квезаль",
        "малюр", "небесныйСильф", "сипуха", "скопа", "звонарь",
        "агами", "песчанка", "майна", "розоваяЧайка", "золотойФазан",
    ] 
    const charsetNum = "0123456789";
    let password = "";

    if (Math.random() > 0.5) {
        password += charsetNum[Math.floor(Math.random() * 10)] + "_";
    }

    password += setBird[Math.floor(Math.random() * 40)] + "_";

    for(let i=0, n=charsetNum.length; i<3; i++) {
        password += charsetNum.charAt(Math.floor(Math.random() * n));
    }

    return password
}

export default GenPassword;