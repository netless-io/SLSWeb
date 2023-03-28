import { redirect } from "react-router-dom";

export const agoraCustomOrigin = "http://sls-customer.netless.group";

function ssoUrl(referer: string) {
    const redirUrl = `${agoraCustomOrigin}/handleSSO`;
    const url = new URL(referer);
    const path = url.pathname;
    const search = url.searchParams.toString();
    const state = encodeURIComponent(path + '?' + search);
    const ssoUrl = `https://sso2.agora.io/api/v0/oauth/authorize?response_type=code&client_id=flat-log&redirect_uri=${redirUrl}&scope=basic_info&state=${state}`;
    return ssoUrl;
}

export async function authWrappedFetch(referer: string, url: URL, options: RequestInit,
    parser: (response: Response) => Promise<any>) {
    let requestInit = options;
    requestInit.credentials = 'include';
    const response = await fetch(url, requestInit);
    if (response.status === 401) {
        // Mock get access token.
        return redirect(ssoUrl(referer));
    }
    return await parser(response);
}