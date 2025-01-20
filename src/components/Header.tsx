import { useContext, useEffect, useState } from "react"
import { StoreContext } from "../contexts"
import { UserType } from "../shared/enums";
import Dropdown from "./Dropdown";

const Header = () => {
    const {
        owners,
        userType,
        setUserType,
        owner,
        setOwner,
        isPending
    } = useContext(StoreContext);

    const [dataOptions, setDataOptions] = useState(owners.map(o => ({label: o, value: o})));
    useEffect(() => {
        setDataOptions(owners.map(o => ({label: o, value: o})));
    }, [owners]);
    

    return (
        <header className="navbar py-4">
            <div className="app-container flex justify-between items-center">
                <section id="logo" className="font-bold">Merchange Sales Channel</section>
                <section id="actions" className="flex gap-4 items-center">
                    {
                        userType === UserType.SELLER
                            ? <button className="btn btn-neutral" onClick={() => setUserType(UserType.OWNER)}>Switch to owner</button>
                            : (<>
                                {
                                    dataOptions.length
                                    ? <Dropdown data={dataOptions} value={owner} onChange={o => setOwner(o?.value)} label={o => `Owner: ${o?.label ?? ''}`} />
                                    : isPending ? <div className="skeleton h-12 w-full"></div> : null
                                }
                                <button className="btn btn-neutral" onClick={() => setUserType(UserType.SELLER)}>Switch to seller</button>
                            </>)
                    }
                </section>
            </div>
        </header>
    )
}

export default Header