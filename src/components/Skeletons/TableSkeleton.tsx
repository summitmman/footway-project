const TableSkeleton = () => {
    return (
        <div className="mt-10">
            <div className="flex gap-4">
                <div className="skeleton h-10 flex-grow"></div>
                <div className="skeleton h-10 w-20"></div>
            </div>
            <div className="skeleton w-full h-48 mt-4"></div>
        </div>
    );
}

export default TableSkeleton