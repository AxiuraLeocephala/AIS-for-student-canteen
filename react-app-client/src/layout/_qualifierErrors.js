const QualifierErrors = (error) => {
    console.log(error)
    if (error.response){
        throw new Response(error.response.data.err, {status: error.response.status});
    } else if (error.message === "Network Error") {
        throw new Response('Сервер спит. Всеми силами пытаемся его разбудить.', {status: 503});
    } else {
        throw new Response('🤖 Нет нужды паниковать, мы просто столкнулись с ошибкой на сервере.' +
            'Скоро виртуальный волшебник все исправит и ты сможешь продолжить своё' + 
            'путешествие по интернету. Подожди секундочку, пока он разберется с этим маленьким сбоем!', {status: 500});
    }
};

export default QualifierErrors;