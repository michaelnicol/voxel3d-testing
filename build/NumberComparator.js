export class NumberComparator {
    compare(o1, o2) {
        if (o1.data < o2.data) {
            return -1;
        }
        if (o1.data > o2.data) {
            return 1;
        }
        return 0;
    }
}
