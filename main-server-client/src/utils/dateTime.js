class DateTime {
    currentDateTime() {
        return new Date();
    }

    getYear(date) {
        return date.getFullYear();
    }

    getMonth(date) {
        return date.getMonth();
    }

    getDate(date) {
        return date.getDate();
    }

    getHours(date) {
        return date.getHours();
    }

    getMinutes(date) {
        return date.getMinutes();
    }

    currentDateTimeMySQLFormat() {
        let currentDateTime = this.currentDateTime();
        currentDateTime = 
            String(this.getYear(currentDateTime)) + 
            "-" +
            String(this.getMonth(currentDateTime) + 1).padStart(2, '0') + 
            "-" +
            String(this.getDate(currentDateTime)).padStart(2, '0') + 
            " " +
            String(this.getHours(currentDateTime)).padStart(2, '0') + 
            ":" +
            String(this.getMinutes(currentDateTime)).padStart(2, '0');

        return currentDateTime;
    }

    getCurrentDateTimeMySQLFormat() {
        return this.currentDateTimeMySQLFormat();
    }
}

const dateTime = new DateTime();

export default dateTime