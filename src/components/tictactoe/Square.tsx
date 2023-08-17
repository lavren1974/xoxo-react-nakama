interface SquareProps {
    value: string | null; // Adjust the type as needed
    onSquareClick: () => void;
}

const Square: React.FC<SquareProps> = ({ value, onSquareClick }) => {


    return <button
        className="square"
        onClick={onSquareClick}
    >
        {value}
    </button>;
};

export default Square;