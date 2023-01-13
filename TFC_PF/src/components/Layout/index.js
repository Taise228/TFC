import {Link, Outlet, useLocation} from "react-router-dom";
import "./style.css";

const Layout = (props) => {
    const location = useLocation();
    // pathによってnavを変える
    if (props.is_admin){
        return (
            <>
            <nav className="admin">
                <div id="nav">
                    <img className="logo" src="https://www.cs.toronto.edu/~kianoosh/courses/csc309/resources/images/tfc.png" alt="logo" />
                    <ul>
                        <li><Link to="/">Home</Link></li>
                        <li><Link to='/logout/'>Logout</Link></li>
                        <li><Link to='/user/'>User</Link></li>
                        <li><p>(admin)</p></li>
                    </ul>
                </div>
            </nav>
            
            <div className="contents">
                <Outlet />
            </div>

            <footer>
                <img className="logo" src="https://www.cs.toronto.edu/~kianoosh/courses/csc309/resources/images/tfc.png" alt="logo" />
                <p>TFC Inc.</p>
            </footer>
        </>
        );
    }

    if (props.is_authenticated){
        return (
            <>
            <nav>
                <div id="nav">
                    <img className="logo" src="https://www.cs.toronto.edu/~kianoosh/courses/csc309/resources/images/tfc.png" alt="logo" />
                    <ul>
                        <li><Link to="/">Home</Link></li>
                        <li><Link to='/logout/'>Logout</Link></li>
                        <li><Link to='/user/'>User</Link></li>
                    </ul>
                </div>
            </nav>
            
            <div className="contents">
                <Outlet />
            </div>

            <footer>
                <img className="logo" src="https://www.cs.toronto.edu/~kianoosh/courses/csc309/resources/images/tfc.png" alt="logo" />
                <p>TFC Inc.</p>
            </footer>
        </>
        );
    }

    return (
        <>
        <nav>
            <div id="nav">
                <img className="logo" src="	https://www.cs.toronto.edu/~kianoosh/courses/csc309/resources/images/tfc.png" alt="logo" />
                <ul>
                    <li><Link to="/">Home</Link></li>
                    <li><Link to="signup/">Signup</Link></li>
                    <li><Link to='login/'>Login</Link></li>
                </ul>
            </div>
        </nav>
            
        <div className="contents">
            <Outlet />
        </div>

        <br />
        <footer>
            <img className="logo" src="https://www.cs.toronto.edu/~kianoosh/courses/csc309/resources/images/tfc.png" alt="logo" />
            <p>TFC Inc.</p>
        </footer>
        </>
    );
}

export default Layout;