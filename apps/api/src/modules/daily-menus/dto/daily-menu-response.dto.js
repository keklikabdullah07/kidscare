export class DailyMenuResponseDto {
    menu;
    allergenWarnings;
    constructor(menu, allergenWarnings) {
        this.menu = menu;
        this.allergenWarnings = allergenWarnings;
    }
}
