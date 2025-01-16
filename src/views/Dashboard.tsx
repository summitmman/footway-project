import { useContext } from "react"
import { UserContext } from "../contexts"
import { UserType } from "../shared/enums";
import Owner from './Owner';
// import Seller from "./Seller";

const Dashboard = () => {
    const { userType } = useContext(UserContext);
    
    if (userType === UserType.OWNER)
        return <Owner />;
    return <Owner />
}

export default Dashboard