import { Spin } from "antd";
import { useNavigation, Outlet } from "react-router-dom";


export default function Root() {
    const { state } = useNavigation();
    return <Spin size="large" spinning={state === "loading"}>
        <Outlet />
    </Spin>
}