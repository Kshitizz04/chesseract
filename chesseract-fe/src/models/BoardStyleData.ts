export interface BoardStyleData {
    style: "classic" | "wooden" | "marble";
    showCoordinates: boolean;
    showLegalMoves: boolean;
}

export const boardColors = {
    classic: {
        light: { backgroundColor: '#E8EDF9' },
        dark: { backgroundColor: '#B7C0D8' }
    },
    wooden: {
        light: { 
            backgroundColor: '#E8C99B',
            backgroundImage: 'linear-gradient(to bottom right, #E8C99B, #D4A76A)',
            boxShadow: 'inset 0 0 8px rgba(0, 0, 0, 0.05)',
            position: 'relative'
        },
        dark: { 
            backgroundColor: '#906841',
            backgroundImage: 'linear-gradient(to bottom right, #906841, #7D5738)',
            boxShadow: 'inset 0 0 8px rgba(0, 0, 0, 0.1)',
            position: 'relative'
        }
    },
    marble: {
        light: { 
            backgroundColor: '#E8E8E8',
            backgroundImage: 'linear-gradient(to bottom right, #FFFFFF, #E8E8E8)',
            boxShadow: 'inset 0 0 10px rgba(0, 0, 0, 0.05)',
            position: 'relative'
        },
        dark: { 
            backgroundColor: '#9AABBD',
            backgroundImage: 'linear-gradient(45deg, #9AABBD, #8699AD)',
            boxShadow: 'inset 0 0 10px rgba(0, 0, 0, 0.1)',
            position: 'relative'
        }
    }
};