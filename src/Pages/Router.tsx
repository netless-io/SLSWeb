import {
    LoaderFunction,
    LoaderFunctionArgs,
    createBrowserRouter,
    redirect,
} from 'react-router-dom'
import { ChartQueryLoader, ChartQueryPage } from './ChartQueryPage';
import CustomLogQueryPage, { CustomLogQueryLoader } from './CustomLogQueryPage';
import LogQueryPage, { LogQueryLoader } from './LogQueryPage';
import UsageInvestigatePage, { UsageInvestLoader } from './UsageInvestigatePage';
import Root from './Root';
import UsageDetailPage, { UsageDetailLoader } from './UsageDetailPage';
import { baseUrl, isAgoraCustomerOrigin, isLogin } from '../utility';
import RootErrorBoundary from './RootErrorBoundary';
import { agoraCustomOrigin } from '../agoraSSOAuth';
import LoginPage, { LoginLoadingData } from './LoginPage';

const totalPages = [
    'normal',
    'custom',
    'chart',
    'usage',
    'usageDetail',
];
const agoraCustomPages = [ // exclude chart and custom. due to custom sls query. not safe.
    'normal',
    'chart',
    'usage',
    'usageDetail',
];


export const Pages = isAgoraCustomerOrigin() ? agoraCustomPages : totalPages;

function authCheckLoader(fn: LoaderFunction): LoaderFunction {
    return async (args: LoaderFunctionArgs) => {
        if (isAgoraCustomerOrigin() && !isLogin()) {
            return redirect('/login');
        }
        return await fn(args);
    }
}

export const PageElement = (path: string) => {
    switch (path) {
        case 'custom': return {
            path,
            element: <CustomLogQueryPage />,
            loader: authCheckLoader(async (args: LoaderFunctionArgs) => {
                return await CustomLogQueryLoader(args.request.url);
            })
        }
        case 'chart': return {
            path,
            element: <ChartQueryPage />,
            loader: authCheckLoader(async (args: LoaderFunctionArgs) => {
                return await ChartQueryLoader(args.request.url);
            })
        }
        case 'usage': return {
            path,
            element: <UsageInvestigatePage />,
            loader: authCheckLoader(async (args: LoaderFunctionArgs) => {
                return await UsageInvestLoader(args.request.url);
            })
        }
        case 'usageDetail': return {
            path,
            element: <UsageDetailPage />,
            loader: authCheckLoader(async (args: LoaderFunctionArgs) => {
                return await UsageDetailLoader(args.request.url);
            })
        }
        case 'normal': return {
            path: 'normal',
            element: <LogQueryPage />,
            loader: authCheckLoader(async (args: LoaderFunctionArgs) => {
                return await LogQueryLoader(args.request.url);
            })
        }
        default: return {}
    }
}

const childrenRouters = Pages.map((page) => {
    return PageElement(page);
});

const AgoraCustomerRouters = [
    {
        path: "login",
        loader: async () => {
            return await LoginLoadingData();
        },
        element: <LoginPage />,
    },
    {
        path: "handleSSO",
        loader: async (args: LoaderFunctionArgs) => {
            // Get code and state from sourceUrl.
            const sourceUrl = new URL(args.request.url);
            const code = sourceUrl.searchParams.get("code")
            const state = sourceUrl.searchParams.get("state")
            const url = new URL(`${baseUrl}/handleAgoraSSO`);
            url.searchParams.append("code", code);
            url.searchParams.append("state", state);
            // Redirect to the sso url.
            return redirect(url.toString());
        }
    },
    {
        path: "handleAgoraLogout",
        loader: async (args: LoaderFunctionArgs) => {
            const url = new URL(`${baseUrl}/handleAgoraLogout`);
            return redirect(url.toString());
        }
    }
];

const router = createBrowserRouter([
    ...AgoraCustomerRouters,
    {
        path: "/",
        element: <Root />,
        errorElement: <RootErrorBoundary />,
        children: [
            {
                index: true,
                loader: () => { return redirect('/' + Pages[0]) }
            },
            ...childrenRouters,
        ],
    }
]);

export default router;
