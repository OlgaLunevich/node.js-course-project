import { Link } from "react-router-dom";
import { useAuth} from "../../auth/AuthContext.tsx";

const HomePage = () => {
    const { ready, isAuthenticated } = useAuth();

    if (!ready) {
        return <p>Loading...</p>;
    }

    if (!isAuthenticated) {
        return (
            <div>
                <p>
                    You need to <Link to="/login">log in</Link> or{" "}
                    <Link to="/register">register</Link> to view articles.
                </p>
            </div>
        );
    }

    return (
        <div>
            <p>Use the navigation to view or create articles.</p>
        </div>
    );
};

export default HomePage;

