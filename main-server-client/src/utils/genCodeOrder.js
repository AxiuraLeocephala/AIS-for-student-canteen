import dbService from './../services/dbService.js';

async function GenCodeOrder() {
    const setLetters = "АКЕЦПМ";
    const setNumber = "0123456789";

    while (true) {
        let retVal = "";

        for(let i=0, n=setLetters.length; i<1; i++) {
            retVal += setLetters.charAt(Math.floor(Math.random() * n));
        }
        for(let i=0, n=setNumber.length; i<4; i++) {
            retVal += setNumber.charAt(Math.floor(Math.random() * n));
        }

        try {
            const [codeExists] = await dbService.getCodeReceive(retVal)
        
            if (!codeExists) {
                return retVal;
            }
        } catch (error) {
            throw error
        }
    }
}

export default GenCodeOrder;