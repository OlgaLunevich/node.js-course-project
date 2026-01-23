import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth} from "../../auth/AuthContext.tsx";
import "./Header.css";

const Header = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { isAuthenticated, logout } = useAuth();

    const params = new URLSearchParams(location.search);
    const workspaceId = params.get("workspaceId");

    const listLink = workspaceId
        ? `/articles?workspaceId=${workspaceId}`
        : "/articles";

    const newArticleLink = workspaceId
        ? `/articles/new?workspaceId=${workspaceId}`
        : "/articles/new";

    const handleLogout = async () => {
        await logout();
        navigate("/");
    };

    return (
        <header className="header">
            <h1 className="header__title">
                <Link to="/">Articles</Link>
            </h1>

            <nav className="header__nav">
                {!isAuthenticated && (
                    <>
                        <Link className="btn" to="/login">
                            Login
                        </Link>
                        <Link className="btn" to="/register">
                            Register
                        </Link>
                    </>
                )}

                {isAuthenticated && (
                    <>
                        <Link className="btn" to={listLink}>
                            List
                        </Link>
                        <Link className="btn" to={newArticleLink}>
                            New Article
                        </Link>
                        <button className="btn" onClick={handleLogout}>
                            Logout
                        </button>
                    </>
                )}
            </nav>
        </header>
    );
};

export default Header;




