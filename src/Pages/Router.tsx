import {
    LoaderFunctionArgs,
    createBrowserRouter,
    redirect,
} from 'react-router-dom'
import { ChartQueryLoader, ChartQueryPage } from './ChartQueryPage';
import CustomLogQueryPage, { CustomLogQueryLoader } from './CustomLogQueryPage';
import LogQueryPage, { LogQueryLoader } from './LogQueryPage';
import UsageInvestigatePage from './UsageInvestigatePage';
import Root from './Root';

export const Pages = [
    'normal',
    'custom',
    'chart',
    'usage'
];

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
            element: <UsageInvestigatePage />
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
        errorElement: <div id="error-page">
            <h1>Oops! Bad path</h1>
        </div>,
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
