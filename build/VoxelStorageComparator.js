export class VoxelStorageComparator {
    compare(o1, o2) {
        // console.log("Comparing o1: "+o1.toPrint());
        // console.log("Comparing o2: "+o2.toPrint());
        if (o1.data < o2.data) {
            return -1;
        }
        if (o1.data > o2.data) {
            return 1;
        }
        return 0;
    }
}
