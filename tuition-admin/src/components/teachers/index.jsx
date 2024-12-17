import React from 'react';
import { Result, Button } from 'antd';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        console.error('Error:', error);
        console.error('Error Info:', errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <Result
                    status="error"
                    title="Something went wrong"
                    subTitle="Sorry, an error occurred while loading this page."
                    extra={[
                        <Button 
                            type="primary" 
                            key="refresh"
                            onClick={() => window.location.reload()}
                        >
                            Refresh Page
                        </Button>
                    ]}
                />
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;