import { useCallback, useEffect, useRef, useState } from "react";

interface IUseInfiniteScrollProps {
    totalRecords: number;
    batchCount: number;
    batchThresholdNumber: number
    scrollRef: HTMLElement | null;
    listRootRef: HTMLElement | null;
}
const useInfiniteScroll = ({
    totalRecords,
    batchCount,
    batchThresholdNumber,
    scrollRef,
    listRootRef
}: IUseInfiniteScrollProps): Array<number> => {
    // Array of total indexes
    const records = useRef(Array.from(Array(totalRecords).keys()));
    // Array of indexes managed by infinite scroll; this is what we return
    const [scrollManagedIndexes, setScrollManagedIndexes] = useState(records.current.slice(0, batchCount));

    // 1. Create Intersection observer
    const observer = useRef<IntersectionObserver | null>(null);
    const observerCallback = useCallback((entry: any) => {
        if (entry[0].intersectionRatio <= 0) {
            return;
        }
        setScrollManagedIndexes(records.current.slice(0, scrollManagedIndexes.length + batchCount));
    }, [scrollManagedIndexes, records]);
    // handle callback and scroll element changes
    useEffect(() => {
        // disconnect current observer if any
        observer.current?.disconnect();
        if (scrollRef) {
            observer.current = new IntersectionObserver(observerCallback, {
                root: scrollRef
            });
        } else {
            observer.current = null
        }
        
        return () => {
            observer.current?.disconnect();
        };
    }, [scrollRef, observerCallback]);

    // 2. Set target element to observe
    const targetListElement = useRef<Element | null>(null);
    // find target element whenever scrollManagedIndexes change, as it should be the nth element of the batch
    useEffect(() => {
        observer.current?.disconnect();
        if (observer.current && listRootRef) {
            targetListElement.current = listRootRef.children[scrollManagedIndexes.length - 1 - (batchCount - batchThresholdNumber)] ?? null;
            if (targetListElement.current) {
                observer.current.observe(targetListElement.current);
            }
        } else {
            targetListElement.current = null;
        }
    }, [scrollManagedIndexes, observer.current]);

    // Reset values if total number of records change
    useEffect(() => {
        records.current = Array.from(Array(totalRecords).keys());
        setScrollManagedIndexes(records.current.slice(0, batchCount));
        targetListElement.current = null;
    }, [totalRecords]);

    return scrollManagedIndexes;
};

export default useInfiniteScroll;