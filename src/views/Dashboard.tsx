import { useContext } from "react"
import { StoreContext } from "../contexts"
import { UserType } from "../shared/enums";
import Owner from './Owner';
import Seller from "./Seller";

const Dashboard = () => {
    const { userType } = useContext(StoreContext);
    
    if (userType === UserType.OWNER)
        return <Owner />;
    return <Seller />
}

export default Dashboard