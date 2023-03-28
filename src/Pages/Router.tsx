import {
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
import { baseUrl } from '../utility';
import RootErrorBoundary from './RootErrorBoundary';
import { agoraCustomOrigin } from '../agoraSSOAuth';

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

// Get current origin.
const origin = window.location.origin;
export const Pages = origin === agoraCustomOrigin ? agoraCustomPages : totalPages;

export const PageElement = (path: string) => {
    switch (path) {
        case 'custom': return {
            path,
            element: <CustomLogQueryPage />,
            loader: async (args: LoaderFunctionArgs) => {
                return await CustomLogQueryLoader(args.request.url);
            }
        }
        case 'chart': return {
            path,
            element: <ChartQueryPage />,
            loader: async (args: LoaderFunctionArgs) => {
                return await ChartQueryLoader(args.request.url);
            }
        }
        case 'usage': return {
            path,
            element: <UsageInvestigatePage />,
            loader: async (args: LoaderFunctionArgs) => {
                return await UsageInvestLoader(args.request.url);
            }
        }
        case 'usageDetail': return {
            path,
            element: <UsageDetailPage />,
            loader: async (args: LoaderFunctionArgs) => {
                return await UsageDetailLoader(args.request.url);
            }
        }
        case 'normal': return {
            path: 'normal',
            element: <LogQueryPage />,
            loader: async (args: LoaderFunctionArgs) => {
                return await LogQueryLoader(args.request.url);
            }
        }
        default: return {}
    }
}

const childrenRouters = Pages.map((page) => {
    return PageElement(page);
});

const router = createBrowserRouter([
    {
        path: "/",
        element: <Root />,
        errorElement: <RootErrorBoundary />,
        children: [
            {
                index: true,
                loader: () => { return redirect('/' + Pages[0]) }
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
            },
            ...childrenRouters,
        ],
    }
]);

export default router;
