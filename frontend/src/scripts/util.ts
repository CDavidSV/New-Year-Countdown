export const getRand = (min: number, max: number): number => {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min);
}

export const randomColor = (): string => {
    const colorArr = [
        '#ff1100', // Red.
        '#ff9100', // Orange.
        '#fff700', // Yellow.
        '#40ff00', // Green.
        '#00b3ff', // Light Blue.
        '#0022ff', // Blue.
        '#bd00b6', // Purple.
        '#ff59f1', // Pink.
        '#c2c2c2', // Silver.
        '#ffffff', // White
    ];

    return colorArr[getRand(0, colorArr.length - 1)];
}
