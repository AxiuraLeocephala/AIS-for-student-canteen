const userAgent = navigator.userAgent.toLowerCase();

export const usePlatform = {
    getTypePress() {
        let typeStartPress, typeEndPress;
        const isMobile = /mobile|iphone|ipad|android|blackberry|mini|windows\sce|palm/i.test(userAgent);

        if (isMobile) {
            typeStartPress = "touchstart";
            typeEndPress = "touchend";
        } else {
            typeStartPress = "mousedown";
            typeEndPress = "mouseup";
        }

        return [ typeStartPress, typeEndPress ];
    },
}