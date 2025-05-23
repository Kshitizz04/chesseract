import woodenSquareLight from '../assets/wooden-square-light.jpg';
import woodenSquareDark from '../assets/wooden-square-dark.jpg';
import marbleSquareLight from '../assets/marble-square-light.png';
import marbleSquareDark from '../assets/marble-square-dark.png';

export interface BoardStyleData {
    style: "classic" | "wooden" | "marble";
    showCoordinates: boolean;
    showLegalMoves: boolean;
}

export const boardColors = {
    classic: {
        light: { backgroundColor: '#E8EDF9' },
        dark: { backgroundColor: '#B7C0D8' },
        lastMove: {backgroundColor: '#8092bf'},
        optionSquares: {
            background: 'radial-gradient(circle, #798194 25%, transparent 26%)',
            opacity: 0.3,
            borderRadius: '50%'
        },
        capture: {
            background: 'radial-gradient(circle, transparent 55%, #8092bf 56%, #8092bf 69%, transparent 70%)',
            borderRadius: '50%',
        },
        premoveLight: {backgroundColor: 'rgb(252, 152, 134, 0.4)'},
        premoveDark: {backgroundColor: 'rgb(189, 109, 70, 0.4)'},
    },
    wooden: {
        light: {backgroundImage: `url(${woodenSquareLight.src})`, backgroundSize: 'cover'},
        dark: {backgroundImage: `url(${woodenSquareDark.src})`, backgroundSize: 'cover'},
        lastMove: {backgroundColor: 'rgba(181, 113, 45, 0.4)'},
        optionSquares: {
            background: 'radial-gradient(circle, rgba(161, 121, 79, 0.4) 25%, transparent 26%)',
            borderRadius: '50%'
        },
        capture: {
            background: 'radial-gradient(circle, transparent 55%, rgba(181, 113, 45, 0.4) 56%, rgba(181, 113, 45, 0.4) 69%, transparent 70%)',
            borderRadius: '50%',
        },
        premoveLight: {
            backgroundImage: `linear-gradient(rgba(252, 152, 134, 0.6), rgba(252, 152, 134, 0.6)), url(${woodenSquareLight.src})`,
            backgroundSize: 'cover'
        },
        premoveDark: {
            backgroundImage: `linear-gradient(rgba(189, 109, 70, 0.6), rgba(189, 109, 70, 0.6)), url(${woodenSquareDark.src})`,
            backgroundSize: 'cover'
        },
    },
    marble: {
        light: {backgroundImage: `url(${marbleSquareLight.src})`, backgroundSize: 'cover'},
        dark: {backgroundImage: `url(${marbleSquareDark.src})`, backgroundSize: 'cover'},
        lastMove: {backgroundColor: 'rgba(137, 137, 138, 0.4)'},
        optionSquares: {
            background: 'radial-gradient(circle,rgba(0, 0, 0, 0.4) 25%, transparent 26%)',
            borderRadius: '50%'
        },
        capture: {
            background: 'radial-gradient(circle, transparent 55%, rgba(137, 137, 138, 0.4) 56%, rgba(137, 137, 138, 0.4) 69%, transparent 70%)',
            borderRadius: '50%',
        },
        premoveLight: {
            backgroundImage: `linear-gradient(rgba(252, 152, 134, 0.6), rgba(252, 152, 134, 0.6)), url(${marbleSquareLight.src})`,
            backgroundSize: 'cover'
        },
        premoveDark: {
            backgroundImage: `linear-gradient(rgba(189, 109, 70, 0.6), rgba(189, 109, 70, 0.6)), url(${marbleSquareDark.src})`,
            backgroundSize: 'cover'
        },
    }
};