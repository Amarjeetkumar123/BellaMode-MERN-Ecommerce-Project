import { Link, useRouteError, isRouteErrorResponse } from 'react-router-dom'

// Serves both the catch-all route and the router's errorElement, so a bad URL
// or a thrown route error lands on a branded page instead of a stack trace.
const NotFound = () => {
    const error = useRouteError();
    const is404 = !error || (isRouteErrorResponse(error) && error.status === 404);

    return (
        <section className='notfound'>
            <span className='eyebrow'>{is404 ? 'Error 404' : 'Something went wrong'}</span>
            <h1>{is404 ? 'This page has moved on' : 'We hit a snag'}</h1>
            <p>
                {is404
                    ? "The page you're looking for doesn't exist — it may have been removed or the link is out of date."
                    : 'An unexpected error occurred while loading this page. Please try again.'}
            </p>
            <div className='notfound__actions'>
                <Link to='/' className='btn !rounded-lg'>Back to shopping</Link>
                <Link to='/shop' className='notfound__link'>Browse all products</Link>
            </div>
        </section>
    );
};

export default NotFound;
