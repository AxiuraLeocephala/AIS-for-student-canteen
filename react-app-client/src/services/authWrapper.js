import mAxios from "../features/setupAxios.js";
import { tg } from "./../hooks/useTelegram.js";
import QualifierErrors from './../layout/_qualifierErrors.js';
import { getCookie, setCookie } from "./../utils/cookie.js";

export async function AuthWrapper() {
    let initData = tg.initData;
    
    await mAxios.post('user-api/auth/checkInitData', {
        initData: initData
    })
    .then(res => {
        setCookie('accessToken', res.data.accessToken, {'max-age': 43200});
        setCookie('refreshToken', res.data.refreshToken, {'max-age': 43200});
    })
    .catch(err => QualifierErrors(err));
}

export function ScheduleRefreshTokens(timerRef) {
    const accessToken = getCookie('accessToken');
    const exp = JSON.parse(atob(accessToken.split('.')[1])).exp;
    const timeout = (exp - Math.round(Date.now() / 1000)) * 1000 - 30000;

    timerRef.current = setTimeout(() => {
        RefreshTokens(timerRef);
    }, timeout);
}

export function CancelRefreshTokens(timerRef) {
    if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
    }
}

export async function RefreshTokens(timerRef) {
    const refreshToken = getCookie('refreshToken');

    mAxios.post('user-api/auth/refreshTokens', {
        refreshToken: refreshToken
    })
    .then(res => {
        setCookie('accessToken', res.data.accessToken, {'max-age': 43200});
        setCookie('refreshToken', res.data.refreshToken, {'max-age': 43200});
        ScheduleRefreshTokens(timerRef);
    })
    .catch(err => QualifierErrors(err));
}