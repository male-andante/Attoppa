import { Button, ButtonGroup } from 'react-bootstrap';

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
    const renderPageNumbers = () => {
        const pages = [];
        const maxVisiblePages = 5;
        
        let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
        let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
        
        if (endPage - startPage + 1 < maxVisiblePages) {
            startPage = Math.max(1, endPage - maxVisiblePages + 1);
        }

        for (let i = startPage; i <= endPage; i++) {
            pages.push(
                <Button
                    key={i}
                    variant={i === currentPage ? "primary" : "outline-primary"}
                    size="sm"
                    onClick={() => onPageChange(i)}
                >
                    {i}
                </Button>
            );
        }
        
        return pages;
    };

    if (totalPages <= 1) return null;

    return (
        <div className="d-flex justify-content-center mt-4">
            <ButtonGroup>
                <Button
                    variant="outline-primary"
                    size="sm"
                    onClick={() => onPageChange(1)}
                    disabled={currentPage === 1}
                >
                    «
                </Button>
                <Button
                    variant="outline-primary"
                    size="sm"
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                >
                    ‹
                </Button>
                
                {renderPageNumbers()}
                
                <Button
                    variant="outline-primary"
                    size="sm"
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                >
                    ›
                </Button>
                <Button
                    variant="outline-primary"
                    size="sm"
                    onClick={() => onPageChange(totalPages)}
                    disabled={currentPage === totalPages}
                >
                    »
                </Button>
            </ButtonGroup>
        </div>
    );
};

export default Pagination; 