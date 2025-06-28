import { getCookie, setCookie } from "./cookie.js";
import axios from "axios"
import QualifierErrors from "./../error/_qualifierError.js";

export function ScheduleRefreshTokens(timerRef) {
    const accessToken = getCookie('accessTokenAdmin');
    const exp = JSON.parse(atob(accessToken.split('.')[1])).exp;
    const timeout = (exp - Math.round(Date.now() / 1000)) * 1000 - 30000;
    timerRef.current = setTimeout(() => {
        RefreshTokens(timerRef);
    }, timeout);
}

export async function RefreshTokens(timerRef) {
    const refreshToken = getCookie('refreshTokenAdmin');

    axios.post('/admin-api/auth/refreshTokens', {
        refreshToken: refreshToken,
        fromAdminPanel: true
    })
    .then(res => {
        setCookie('accessTokenAdmin', res.data.accessToken, {'max-age': 43200});
        setCookie('refreshTokenAdmin', res.data.refreshToken, {'max-age': 43200});
        setCookie('roleWorker', res.data.role, {'max-age': 43200});
        ScheduleRefreshTokens(timerRef);
    })
    .catch(err => QualifierErrors(err));
}

export function CancelRefreshTokens(timerRef) {
    if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
    }
}