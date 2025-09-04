const programs = {
    group1: [
        "BCA", "BCAOL", "MCA", "MCAOL", "MP", "MPB",
        "PGDCA", "PGDCA_NEW", "PGDHRM", "PGDFM", "PGDOM",
        "PGDMM", "PGDFMP", "MBF", "MCA_NEW"
    ],
    group2: [
        "ASSO", "BA", "BCOM", "BDP", "BSC"
    ],
    group4: [
        "BAECH", "BAEGH", "BAG", "BAHDH", "BAHIH", "BAPAH", "BAPCH", "BAPSH",
        "BASOH", "BAVTM", "BCOMG", "BCOMOL", "BSCANH", "BSCBCH", "BSCG",
        "BSWG", "BSWGOL"
    ],
    group3: [
        "BAGH", "BAPSHH", "BAPSHG", "BAPSHM", "BAPSHS", "BAPSHW",
        "BAEGG", "BAEGH", "BAEGM", "BAEGS", "BAEGW", "BAPCHH",
        "BAPCHG", "BAPCHM", "BAPCHS", "BAPCHW"
    ],
    getAllPrograms() {
        return [...this.group1, ...this.group2, ...this.group4, ...this.group3];
    },
    getTypeForProgram(program) {
        if (this.group1.includes(program)) return 1;
        if (this.group2.includes(program)) return 2;
        if (this.group4.includes(program)) return 4;
        return 3;
    }
};

export default programs;
